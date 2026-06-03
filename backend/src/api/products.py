import csv
import io
import re
import zipfile
from decimal import Decimal, InvalidOperation
from typing import List
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.audit_log import AuditLog
from src.models.product import CategoryEnum, Product
from src.models.user import RoleEnum, User
from src.schemas.product import ProductCreate, ProductImportResponse, ProductResponse
from src.services.auth import AuthService

router = APIRouter(prefix="/products", tags=["Produtos / Catalogo"])

PRODUCT_IMPORT_HEADERS = ["codigo", "descricao", "categoria", "unidade_medida", "preco", "is_active"]
XLSX_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def _get_admin_user(db: Session, current_user) -> User:
    user = db.query(User).filter(User.email == current_user.email, User.is_active == True).first()
    if not user or user.role != RoleEnum.ADM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem importar ou exportar produtos.",
        )
    return user


def _parse_decimal(value: str, row_number: int) -> Decimal:
    raw = str(value or "").strip()
    if "," in raw and "." in raw:
        raw = raw.replace(".", "").replace(",", ".")
    else:
        raw = raw.replace(",", ".")

    try:
        parsed = Decimal(raw)
    except (InvalidOperation, ValueError):
        raise ValueError(f"Linha {row_number}: preco invalido.")

    if parsed < 0:
        raise ValueError(f"Linha {row_number}: preco nao pode ser negativo.")

    return parsed


def _parse_bool(value: str | None, default: bool = True) -> bool:
    raw = str(value or "").strip().lower()
    if raw == "":
        return default
    return raw in {"1", "true", "sim", "yes", "ativo", "active"}


def _normalize_row(row: dict, row_number: int) -> dict:
    normalized = {str(key or "").strip().lower(): str(value or "").strip() for key, value in row.items()}
    codigo = normalized.get("codigo", "").upper()
    descricao = normalized.get("descricao", "")
    categoria_raw = normalized.get("categoria", "").upper()
    unidade_medida = normalized.get("unidade_medida", "").upper()
    preco_raw = normalized.get("preco", "")

    if not codigo:
        raise ValueError(f"Linha {row_number}: codigo e obrigatorio.")
    if not descricao:
        raise ValueError(f"Linha {row_number}: descricao e obrigatoria.")
    if categoria_raw not in CategoryEnum.__members__:
        raise ValueError(f"Linha {row_number}: categoria deve ser LSF, MM ou CHALE.")
    if not unidade_medida:
        raise ValueError(f"Linha {row_number}: unidade_medida e obrigatoria.")
    if not preco_raw:
        raise ValueError(f"Linha {row_number}: preco e obrigatorio.")

    return {
        "codigo": codigo,
        "descricao": descricao,
        "categoria": CategoryEnum[categoria_raw],
        "unidade_medida": unidade_medida,
        "preco": _parse_decimal(preco_raw, row_number),
        "is_active": _parse_bool(normalized.get("is_active"), True),
    }


def _column_letter(index: int) -> str:
    letters = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


def _inline_cell(ref: str, value: str) -> str:
    return f'<c r="{ref}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>'


def _number_cell(ref: str, value: Decimal) -> str:
    return f'<c r="{ref}"><v>{escape(str(value))}</v></c>'


def _build_xlsx(rows: list[list[str | Decimal]]) -> bytes:
    sheet_rows = []
    for row_index, row in enumerate(rows, start=1):
        cells = []
        for col_index, value in enumerate(row, start=1):
            ref = f"{_column_letter(col_index)}{row_index}"
            if isinstance(value, Decimal):
                cells.append(_number_cell(ref, value))
            else:
                cells.append(_inline_cell(ref, str(value)))
        sheet_rows.append(f'<row r="{row_index}">{"".join(cells)}</row>')

    sheet_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetData>'
        f'{"".join(sheet_rows)}'
        '</sheetData>'
        '</worksheet>'
    )
    workbook_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        '<sheets><sheet name="Produtos" sheetId="1" r:id="rId1"/></sheets>'
        '</workbook>'
    )
    workbook_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
        '</Relationships>'
    )
    root_rels_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        '</Relationships>'
    )
    content_types_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        '</Types>'
    )

    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types_xml)
        archive.writestr("_rels/.rels", root_rels_xml)
        archive.writestr("xl/workbook.xml", workbook_xml)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)
        archive.writestr("xl/worksheets/sheet1.xml", sheet_xml)
    return output.getvalue()


def _cell_text(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value = cell.find(f"{XLSX_NS}v")

    if cell_type == "inlineStr":
        text_node = cell.find(f".//{XLSX_NS}t")
        return text_node.text if text_node is not None and text_node.text is not None else ""

    if value is None or value.text is None:
        return ""

    if cell_type == "s":
        try:
            return shared_strings[int(value.text)]
        except (ValueError, IndexError):
            return ""

    return value.text


def _parse_xlsx_rows(content: bytes) -> tuple[set[str], list[dict]]:
    try:
        archive = zipfile.ZipFile(io.BytesIO(content))
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Arquivo Excel invalido.")

    shared_strings: list[str] = []
    if "xl/sharedStrings.xml" in archive.namelist():
        try:
            shared_root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        except ET.ParseError:
            raise HTTPException(status_code=400, detail="Arquivo Excel invalido.")
        for item in shared_root.findall(f"{XLSX_NS}si"):
            texts = [node.text or "" for node in item.findall(f".//{XLSX_NS}t")]
            shared_strings.append("".join(texts))

    worksheet_name = "xl/worksheets/sheet1.xml"
    if worksheet_name not in archive.namelist():
        raise HTTPException(status_code=400, detail="A planilha precisa conter uma primeira aba valida.")

    try:
        root = ET.fromstring(archive.read(worksheet_name))
    except ET.ParseError:
        raise HTTPException(status_code=400, detail="Arquivo Excel invalido.")
    rows = []
    for row in root.findall(f".//{XLSX_NS}row"):
        values_by_column: dict[int, str] = {}
        for fallback_index, cell in enumerate(row.findall(f"{XLSX_NS}c"), start=1):
            reference = cell.attrib.get("r", "")
            match = re.match(r"([A-Z]+)", reference)
            column_index = fallback_index
            if match:
                column_index = 0
                for char in match.group(1):
                    column_index = column_index * 26 + ord(char) - 64
            values_by_column[column_index] = _cell_text(cell, shared_strings).strip()
        if values_by_column:
            max_column = max(values_by_column)
            rows.append([values_by_column.get(index, "") for index in range(1, max_column + 1)])

    if not rows:
        return set(), []

    headers = [header.strip().lower() for header in rows[0]]
    data_rows = [
        {headers[index]: value for index, value in enumerate(row) if index < len(headers)}
        for row in rows[1:]
    ]
    return set(headers), data_rows


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_produto(payload: ProductCreate, db: Session = Depends(get_db)):
    """Cadastra um novo produto no catalogo. Evita codigos duplicados."""
    codigo_uppercase = payload.codigo.strip().upper()

    produto_existente = db.query(Product).filter(Product.codigo == codigo_uppercase).first()
    if produto_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ja existe um produto cadastrado com o codigo '{codigo_uppercase}'.",
        )

    novo_produto = Product(
        codigo=codigo_uppercase,
        descricao=payload.descricao,
        categoria=payload.categoria,
        unidade_medida=payload.unidade_medida,
        preco=payload.preco,
        is_active=True,
    )

    db.add(novo_produto)
    db.commit()
    db.refresh(novo_produto)
    return novo_produto


@router.get("", response_model=List[ProductResponse])
def listar_todos_produtos(db: Session = Depends(get_db)):
    """Lista todos os produtos ativos do catalogo."""
    return db.query(Product).filter(Product.is_active == True).all()


@router.get("/export")
def exportar_produtos_excel(
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Exporta o catalogo de produtos em Excel para administradores."""
    _get_admin_user(db, current_user)
    rows: list[list[str | Decimal]] = [PRODUCT_IMPORT_HEADERS]

    products = db.query(Product).order_by(Product.codigo.asc()).all()
    for product in products:
        rows.append([
            product.codigo,
            product.descricao,
            product.categoria.value,
            product.unidade_medida,
            product.preco,
            "true" if product.is_active else "false",
        ])

    return StreamingResponse(
        io.BytesIO(_build_xlsx(rows)),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=produtos_aulevi.xlsx"},
    )


@router.get("/template")
def baixar_modelo_produtos_excel(
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Baixa um modelo Excel com as colunas esperadas para carga de produtos."""
    _get_admin_user(db, current_user)
    rows: list[list[str | Decimal]] = [
        PRODUCT_IMPORT_HEADERS,
        ["PERFIL-LSF-01", "Perfil guia LSF", "LSF", "UN", Decimal("25.90"), "true"],
        ["PARAFUSO-MM-01", "Parafuso estrutural", "MM", "CX", Decimal("120.00"), "true"],
    ]

    return StreamingResponse(
        io.BytesIO(_build_xlsx(rows)),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=modelo_produtos_aulevi.xlsx"},
    )


@router.post("/import", response_model=ProductImportResponse)
async def importar_produtos_planilha(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Importa produtos em lote por Excel ou CSV. Produtos com codigo existente sao atualizados."""
    admin = _get_admin_user(db, current_user)
    filename = request.headers.get("x-filename", "produtos.xlsx")

    content = await request.body()
    if filename.lower().endswith(".xlsx"):
        headers, raw_rows = _parse_xlsx_rows(content)
        iterable_rows = raw_rows
    elif filename.lower().endswith(".csv"):
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Arquivo CSV deve estar em UTF-8.")
        reader = csv.DictReader(io.StringIO(text))
        headers = {str(header or "").strip().lower() for header in (reader.fieldnames or [])}
        iterable_rows = list(reader)
    else:
        raise HTTPException(status_code=400, detail="Envie um arquivo Excel (.xlsx) ou CSV.")

    missing_headers = [header for header in PRODUCT_IMPORT_HEADERS if header != "is_active" and header not in headers]
    if missing_headers:
        raise HTTPException(status_code=400, detail=f"Colunas obrigatorias ausentes: {', '.join(missing_headers)}.")

    rows_to_apply = []
    errors = []
    for index, row in enumerate(iterable_rows, start=2):
        if not any(str(value or "").strip() for value in row.values()):
            continue
        try:
            rows_to_apply.append(_normalize_row(row, index))
        except ValueError as exc:
            errors.append(str(exc))

    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})

    created = 0
    updated = 0
    for row in rows_to_apply:
        product = db.query(Product).filter(Product.codigo == row["codigo"]).first()
        if product:
            product.descricao = row["descricao"]
            product.categoria = row["categoria"]
            product.unidade_medida = row["unidade_medida"]
            product.preco = row["preco"]
            product.is_active = row["is_active"]
            updated += 1
        else:
            db.add(Product(**row))
            created += 1

    db.add(
        AuditLog(
            user_id=admin.id,
            user_name=admin.name,
            user_email=admin.email,
            action="product_bulk_import",
            entity_type="product",
            entity_label=filename,
            changes={
                "created": {"old": None, "new": created},
                "updated": {"old": None, "new": updated},
            },
        )
    )
    db.commit()

    return ProductImportResponse(total_linhas=len(rows_to_apply), criados=created, atualizados=updated)


@router.get("/categoria/{categoria}", response_model=List[ProductResponse])
def listar_produtos_por_categoria(categoria: CategoryEnum, db: Session = Depends(get_db)):
    """Filtra os produtos ativos por categoria (LSF, MM ou CHALE)."""
    return db.query(Product).filter(
        Product.categoria == categoria,
        Product.is_active == True,
    ).all()
