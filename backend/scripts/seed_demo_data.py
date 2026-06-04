r"""Seed temporary demo data for local/system testing.

Usage from backend folder:
    .\venv\Scripts\python.exe scripts\seed_demo_data.py seed
    .\venv\Scripts\python.exe scripts\seed_demo_data.py cleanup
"""
from __future__ import annotations

import sys
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from pathlib import Path

from passlib.context import CryptContext

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from src.core.database import SessionLocal
from src.models.client import Client
from src.models.product import CategoryEnum, Product
from src.models.quote import Quote, QuoteItem, QuoteStatus
from src.models.user import RoleEnum, User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
DEMO_PREFIX = "DEMO"


PRODUCTS = [
    # LSF - Light Steel Frame
    ("DEMO-LSF-001", "Perfil guia steel frame 90mm", CategoryEnum.LSF, "UN", "31.90"),
    ("DEMO-LSF-002", "Montante steel frame 90mm", CategoryEnum.LSF, "UN", "42.50"),
    ("DEMO-LSF-003", "Placa cimenticia 1200x2400", CategoryEnum.LSF, "UN", "168.00"),
    ("DEMO-LSF-004", "Perfil guia steel frame 140mm", CategoryEnum.LSF, "UN", "48.90"),
    ("DEMO-LSF-005", "Montante steel frame 140mm", CategoryEnum.LSF, "UN", "63.75"),
    ("DEMO-LSF-006", "Parafuso autobrocante 4.8x19", CategoryEnum.LSF, "CX", "96.40"),
    ("DEMO-LSF-007", "Parafuso ponta broca 4.2x13", CategoryEnum.LSF, "CX", "82.30"),
    ("DEMO-LSF-008", "Chumbador parabolt 1/2x4", CategoryEnum.LSF, "UN", "4.30"),
    ("DEMO-LSF-009", "Manta hidrofuga 20cm x 10m", CategoryEnum.LSF, "RL", "69.79"),
    ("DEMO-LSF-010", "Cantoneira de ancoragem 189x49x5/16", CategoryEnum.LSF, "UN", "27.00"),
    ("DEMO-LSF-011", "Projeto estrutural LSF", CategoryEnum.LSF, "SV", "2500.00"),
    ("DEMO-LSF-012", "Fechamento OSB estrutural 11,1mm", CategoryEnum.LSF, "UN", "122.90"),

    # MM - Madeiramento / Metalico
    ("DEMO-MM-001", "Viga metalica galvanizada", CategoryEnum.MM, "UN", "289.90"),
    ("DEMO-MM-002", "Parafuso estrutural metalico", CategoryEnum.MM, "CX", "118.75"),
    ("DEMO-MM-003", "Telha sanduiche termoacustica", CategoryEnum.MM, "M2", "152.40"),
    ("DEMO-MM-004", "Perfil terca metalica 0.95", CategoryEnum.MM, "UN", "74.90"),
    ("DEMO-MM-005", "Perfil terca metalica 1.25", CategoryEnum.MM, "UN", "96.50"),
    ("DEMO-MM-006", "Conexao metalica pequena", CategoryEnum.MM, "UN", "18.90"),
    ("DEMO-MM-007", "Conexao metalica media", CategoryEnum.MM, "UN", "29.90"),
    ("DEMO-MM-008", "Conexao metalica grande", CategoryEnum.MM, "UN", "44.50"),
    ("DEMO-MM-009", "Telha fibrocimento 6mm", CategoryEnum.MM, "M2", "54.90"),
    ("DEMO-MM-010", "Telha aco galvanizado trapezoidal", CategoryEnum.MM, "M2", "87.60"),
    ("DEMO-MM-011", "Cumeeira galvanizada", CategoryEnum.MM, "UN", "65.00"),
    ("DEMO-MM-012", "Calha galvanizada corte sob medida", CategoryEnum.MM, "M", "78.90"),

    # Chale
    ("DEMO-CHALE-001", "Kit estrutura chale compacto", CategoryEnum.CHALE, "KIT", "9850.00"),
    ("DEMO-CHALE-002", "Fechamento externo chale", CategoryEnum.CHALE, "M2", "245.00"),
    ("DEMO-CHALE-003", "Kit estrutura chale premium", CategoryEnum.CHALE, "KIT", "18450.00"),
    ("DEMO-CHALE-004", "Mezanino metalico para chale", CategoryEnum.CHALE, "KIT", "6200.00"),
    ("DEMO-CHALE-005", "Escada compacta para chale", CategoryEnum.CHALE, "UN", "1890.00"),
    ("DEMO-CHALE-006", "Deck externo modular", CategoryEnum.CHALE, "M2", "310.00"),
    ("DEMO-CHALE-007", "Cobertura varanda chale", CategoryEnum.CHALE, "M2", "420.00"),
    ("DEMO-CHALE-008", "Kit isolamento termoacustico chale", CategoryEnum.CHALE, "KIT", "3150.00"),
]

CLIENTS = [
    {
        "cnpj": "99000000000101",
        "razao_social": "DEMO CONSTRUTORA HORIZONTE LTDA",
        "nome_fantasia": "Demo Horizonte",
        "situacao_cadastral": "ATIVA",
        "cep": "01001000",
        "endereco": "Praca da Se",
        "numero": "100",
        "bairro": "Se",
        "cidade": "Sao Paulo",
        "uf": "SP",
        "contato_nome": "Marina Demo",
        "contato_email": "marina.demo@example.com",
        "contato_whatsapp": "11990000001",
        "contato_telefone": "1130000001",
    },
    {
        "cnpj": "99000000000102",
        "razao_social": "DEMO ENGENHARIA VALE AZUL SA",
        "nome_fantasia": "Vale Azul Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "30140071",
        "endereco": "Avenida Afonso Pena",
        "numero": "2200",
        "bairro": "Funcionarios",
        "cidade": "Belo Horizonte",
        "uf": "MG",
        "contato_nome": "Rafael Demo",
        "contato_email": "rafael.demo@example.com",
        "contato_whatsapp": "31990000002",
        "contato_telefone": "3130000002",
    },
    {
        "cnpj": "99000000000103",
        "razao_social": "DEMO PROJETOS SERRA NORTE LTDA",
        "nome_fantasia": "Serra Norte Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "80010000",
        "endereco": "Rua XV de Novembro",
        "numero": "450",
        "bairro": "Centro",
        "cidade": "Curitiba",
        "uf": "PR",
        "contato_nome": "Bianca Demo",
        "contato_email": "bianca.demo@example.com",
        "contato_whatsapp": "41990000003",
        "contato_telefone": "4130000003",
    },
    {
        "cnpj": "99000000000104",
        "razao_social": "DEMO INCORPORADORA SOLAR DAS AGUAS LTDA",
        "nome_fantasia": "Solar das Aguas Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "13560000",
        "endereco": "Rua Episcopal",
        "numero": "730",
        "bairro": "Centro",
        "cidade": "Sao Carlos",
        "uf": "SP",
        "contato_nome": "Gustavo Demo",
        "contato_email": "gustavo.demo@example.com",
        "contato_whatsapp": "16990000004",
        "contato_telefone": "1630000004",
    },
    {
        "cnpj": "99000000000105",
        "razao_social": "DEMO OBRAS RAPIDAS CERRADO LTDA",
        "nome_fantasia": "Obras Cerrado Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "74003010",
        "endereco": "Avenida Goias",
        "numero": "1180",
        "bairro": "Setor Central",
        "cidade": "Goiania",
        "uf": "GO",
        "contato_nome": "Patricia Demo",
        "contato_email": "patricia.demo@example.com",
        "contato_whatsapp": "62990000005",
        "contato_telefone": "6230000005",
    },
    {
        "cnpj": "99000000000106",
        "razao_social": "DEMO ARQUITETURA MODULAR BRASIL LTDA",
        "nome_fantasia": "Modular Brasil Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "20040020",
        "endereco": "Rua da Assembleia",
        "numero": "85",
        "bairro": "Centro",
        "cidade": "Rio de Janeiro",
        "uf": "RJ",
        "contato_nome": "Lucas Demo",
        "contato_email": "lucas.demo@example.com",
        "contato_whatsapp": "21990000006",
        "contato_telefone": "2130000006",
    },
    {
        "cnpj": "99000000000107",
        "razao_social": "DEMO FAZENDAS E GALPOES SUL LTDA",
        "nome_fantasia": "Galpoes Sul Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "90020000",
        "endereco": "Rua dos Andradas",
        "numero": "1410",
        "bairro": "Centro Historico",
        "cidade": "Porto Alegre",
        "uf": "RS",
        "contato_nome": "Fernanda Demo",
        "contato_email": "fernanda.demo@example.com",
        "contato_whatsapp": "51990000007",
        "contato_telefone": "5130000007",
    },
    {
        "cnpj": "99000000000108",
        "razao_social": "DEMO HABITACIONAL NORDESTE SA",
        "nome_fantasia": "Habitacional Nordeste Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "50030000",
        "endereco": "Avenida Guararapes",
        "numero": "320",
        "bairro": "Santo Antonio",
        "cidade": "Recife",
        "uf": "PE",
        "contato_nome": "Andre Demo",
        "contato_email": "andre.demo@example.com",
        "contato_whatsapp": "81990000008",
        "contato_telefone": "8130000008",
    },
    {
        "cnpj": "99000000000109",
        "razao_social": "DEMO RESIDENCIAL ALTO PADRAO LTDA",
        "nome_fantasia": "Alto Padrao Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "88010000",
        "endereco": "Rua Felipe Schmidt",
        "numero": "770",
        "bairro": "Centro",
        "cidade": "Florianopolis",
        "uf": "SC",
        "contato_nome": "Camila Demo",
        "contato_email": "camila.demo@example.com",
        "contato_whatsapp": "48990000009",
        "contato_telefone": "4830000009",
    },
    {
        "cnpj": "99000000000110",
        "razao_social": "DEMO EMPREENDIMENTOS INTERIOR PAULISTA LTDA",
        "nome_fantasia": "Interior Paulista Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "15010030",
        "endereco": "Rua Bernardino de Campos",
        "numero": "1560",
        "bairro": "Centro",
        "cidade": "Sao Jose do Rio Preto",
        "uf": "SP",
        "contato_nome": "Henrique Demo",
        "contato_email": "henrique.demo@example.com",
        "contato_whatsapp": "17990000010",
        "contato_telefone": "1730000010",
    },
]


def get_or_create_seller(db) -> User:
    seller = (
        db.query(User)
        .filter(User.is_active == True, User.role == RoleEnum.SELLER)
        .order_by(User.name.asc())
        .first()
    )
    if seller:
        return seller

    admin = (
        db.query(User)
        .filter(User.is_active == True, User.role == RoleEnum.ADM)
        .order_by(User.name.asc())
        .first()
    )
    if admin:
        return admin

    demo_user = db.query(User).filter(User.email == "demo.seller@aulevi.local").first()
    if demo_user:
        return demo_user

    demo_user = User(
        name="Demo Seller",
        email="demo.seller@aulevi.local",
        password_hash=pwd_context.hash("Demo1234"),
        role=RoleEnum.SELLER,
        is_active=True,
        must_change_password=False,
    )
    db.add(demo_user)
    db.flush()
    return demo_user


def seed_products(db) -> dict[str, Product]:
    products: dict[str, Product] = {}
    for codigo, descricao, categoria, unidade, preco in PRODUCTS:
        product = db.query(Product).filter(Product.codigo == codigo).first()
        if not product:
            product = Product(
                codigo=codigo,
                descricao=descricao,
                categoria=categoria,
                unidade_medida=unidade,
                preco=Decimal(preco),
                is_active=True,
            )
            db.add(product)
            db.flush()
        products[codigo] = product
    return products


def seed_clients(db) -> dict[str, Client]:
    clients: dict[str, Client] = {}
    for payload in CLIENTS:
        client = db.query(Client).filter(Client.cnpj == payload["cnpj"]).first()
        if not client:
            client = Client(**payload, is_active=True)
            db.add(client)
            db.flush()
        clients[payload["cnpj"]] = client
    return clients


def add_quote_items(db, quote: Quote, items: list[tuple[Product, Decimal]]) -> None:
    if quote.items:
        return

    subtotal = Decimal("0.00")
    for product, quantidade in items:
        total_item = quantidade * Decimal(product.preco)
        subtotal += total_item
        db.add(
            QuoteItem(
                quote_id=quote.id,
                product_id=product.id,
                quantidade=quantidade,
                preco_unitario=product.preco,
                total_item=total_item,
            )
        )

    quote.subtotal = subtotal
    quote.total = subtotal - Decimal(quote.desconto or 0) + Decimal(quote.valor_frete or 0)


def seed_quotes(db, seller: User, clients: dict[str, Client], products: dict[str, Product]) -> None:
    quote_specs = [
        {
            "numero": "DEMO-ORC-0001",
            "client": "99000000000101",
            "status": QuoteStatus.PENDENTE,
            "desconto": Decimal("250.00"),
            "frete": Decimal("480.00"),
            "payment": "BOLETO 30 DIAS",
            "shipping": "TRANSPORTADORA",
            "created_days": 8,
            "observations": "Casa terrea em LSF, padrao medio, com fechamento cimenticio.",
            "items": [("DEMO-LSF-001", Decimal("40")), ("DEMO-LSF-002", Decimal("35")), ("DEMO-LSF-003", Decimal("12"))],
        },
        {
            "numero": "DEMO-ORC-0002",
            "client": "99000000000102",
            "status": QuoteStatus.APROVADO,
            "desconto": Decimal("0.00"),
            "frete": Decimal("0.00"),
            "payment": "A VISTA",
            "shipping": "FRETE INCLUSO",
            "created_days": 5,
            "observations": "Telhado metalico com telha termoacustica para galpao comercial.",
            "items": [("DEMO-MM-001", Decimal("10")), ("DEMO-MM-002", Decimal("6")), ("DEMO-MM-003", Decimal("90"))],
        },
        {
            "numero": "DEMO-ORC-0003",
            "client": "99000000000103",
            "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
            "desconto": Decimal("500.00"),
            "frete": Decimal("1250.00"),
            "payment": "ENTRADA + 2 PARCELAS",
            "shipping": "CIF",
            "created_days": 2,
            "observations": "Chale compacto com fechamento externo e entrega CIF.",
            "items": [("DEMO-CHALE-001", Decimal("1")), ("DEMO-CHALE-002", Decimal("55"))],
        },
        {
            "numero": "DEMO-ORC-0004",
            "client": "99000000000101",
            "status": QuoteStatus.CANCELADO,
            "desconto": Decimal("0.00"),
            "frete": Decimal("350.00"),
            "payment": "CARTAO",
            "shipping": "RETIRADA",
            "created_days": 15,
            "observations": "Orcamento cancelado pelo cliente apos revisao de escopo.",
            "items": [("DEMO-LSF-002", Decimal("18")), ("DEMO-MM-002", Decimal("2"))],
        },
        {
            "numero": "DEMO-ORC-0005",
            "client": "99000000000104",
            "status": QuoteStatus.RASCUNHO,
            "desconto": Decimal("0.00"),
            "frete": Decimal("0.00"),
            "payment": "A DEFINIR",
            "shipping": "A DEFINIR",
            "created_days": 0,
            "observations": "Rascunho para simulacao de casa em LSF com fachada simples.",
            "items": [("DEMO-LSF-004", Decimal("28")), ("DEMO-LSF-005", Decimal("32")), ("DEMO-LSF-012", Decimal("18"))],
        },
        {
            "numero": "DEMO-ORC-0006",
            "client": "99000000000105",
            "status": QuoteStatus.PENDENTE,
            "desconto": Decimal("120.00"),
            "frete": Decimal("690.00"),
            "payment": "BOLETO 14/28 DIAS",
            "shipping": "TRANSPORTADORA",
            "created_days": 1,
            "observations": "Reposicao de perfis e conectores para obra no cerrado.",
            "items": [("DEMO-MM-004", Decimal("45")), ("DEMO-MM-006", Decimal("80")), ("DEMO-MM-007", Decimal("35"))],
        },
        {
            "numero": "DEMO-ORC-0007",
            "client": "99000000000106",
            "status": QuoteStatus.APROVADO,
            "desconto": Decimal("800.00"),
            "frete": Decimal("1450.00"),
            "payment": "ENTRADA 40% + 3 PARCELAS",
            "shipping": "CIF",
            "created_days": 3,
            "observations": "Chale premium com mezanino, escada e deck externo.",
            "items": [("DEMO-CHALE-003", Decimal("1")), ("DEMO-CHALE-004", Decimal("1")), ("DEMO-CHALE-005", Decimal("1")), ("DEMO-CHALE-006", Decimal("24"))],
        },
        {
            "numero": "DEMO-ORC-0008",
            "client": "99000000000107",
            "status": QuoteStatus.PENDENTE,
            "desconto": Decimal("0.00"),
            "frete": Decimal("980.00"),
            "payment": "BOLETO 30/60 DIAS",
            "shipping": "FOB",
            "created_days": 6,
            "observations": "Galpao rural com telha galvanizada e calhas sob medida.",
            "items": [("DEMO-MM-005", Decimal("70")), ("DEMO-MM-010", Decimal("180")), ("DEMO-MM-011", Decimal("12")), ("DEMO-MM-012", Decimal("46"))],
        },
        {
            "numero": "DEMO-ORC-0009",
            "client": "99000000000108",
            "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
            "desconto": Decimal("1500.00"),
            "frete": Decimal("2200.00"),
            "payment": "ENTRADA + 4 PARCELAS",
            "shipping": "CIF",
            "created_days": 9,
            "observations": "Lote habitacional com multiplas unidades em LSF.",
            "items": [("DEMO-LSF-001", Decimal("160")), ("DEMO-LSF-002", Decimal("220")), ("DEMO-LSF-006", Decimal("18")), ("DEMO-LSF-008", Decimal("420")), ("DEMO-LSF-011", Decimal("1"))],
        },
        {
            "numero": "DEMO-ORC-0010",
            "client": "99000000000109",
            "status": QuoteStatus.APROVADO,
            "desconto": Decimal("350.00"),
            "frete": Decimal("870.00"),
            "payment": "PIX NA APROVACAO",
            "shipping": "TRANSPORTADORA",
            "created_days": 11,
            "observations": "Residencia de alto padrao com reforco de perfis e isolamento.",
            "items": [("DEMO-LSF-004", Decimal("60")), ("DEMO-LSF-005", Decimal("88")), ("DEMO-LSF-009", Decimal("20")), ("DEMO-CHALE-008", Decimal("2"))],
        },
        {
            "numero": "DEMO-ORC-0011",
            "client": "99000000000110",
            "status": QuoteStatus.PENDENTE,
            "desconto": Decimal("0.00"),
            "frete": Decimal("520.00"),
            "payment": "BOLETO 21 DIAS",
            "shipping": "RETIRADA",
            "created_days": 4,
            "observations": "Compra pontual de placas, parafusos e chumbadores para ampliacao.",
            "items": [("DEMO-LSF-003", Decimal("30")), ("DEMO-LSF-006", Decimal("5")), ("DEMO-LSF-007", Decimal("4")), ("DEMO-LSF-008", Decimal("75"))],
        },
        {
            "numero": "DEMO-ORC-0012",
            "client": "99000000000102",
            "status": QuoteStatus.RASCUNHO,
            "desconto": Decimal("0.00"),
            "frete": Decimal("0.00"),
            "payment": "A DEFINIR",
            "shipping": "A DEFINIR",
            "created_days": 0,
            "observations": "Estudo inicial para substituicao de telhas fibrocimento.",
            "items": [("DEMO-MM-009", Decimal("210")), ("DEMO-MM-011", Decimal("16"))],
        },
        {
            "numero": "DEMO-ORC-0013",
            "client": "99000000000103",
            "status": QuoteStatus.CANCELADO,
            "desconto": Decimal("100.00"),
            "frete": Decimal("400.00"),
            "payment": "CARTAO 3X",
            "shipping": "TRANSPORTADORA",
            "created_days": 18,
            "observations": "Cliente optou por aguardar nova fase do empreendimento.",
            "items": [("DEMO-CHALE-006", Decimal("18")), ("DEMO-CHALE-007", Decimal("12"))],
        },
        {
            "numero": "DEMO-ORC-0014",
            "client": "99000000000105",
            "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
            "desconto": Decimal("250.00"),
            "frete": Decimal("760.00"),
            "payment": "A VISTA COM DESCONTO",
            "shipping": "CIF",
            "created_days": 13,
            "observations": "Estrutura metalica para cobertura de area tecnica.",
            "items": [("DEMO-MM-001", Decimal("16")), ("DEMO-MM-004", Decimal("40")), ("DEMO-MM-008", Decimal("24")), ("DEMO-MM-002", Decimal("8"))],
        },
        {
            "numero": "DEMO-ORC-0015",
            "client": "99000000000106",
            "status": QuoteStatus.PENDENTE,
            "desconto": Decimal("600.00"),
            "frete": Decimal("1320.00"),
            "payment": "ENTRADA 50% + SALDO NA ENTREGA",
            "shipping": "CIF",
            "created_days": 7,
            "observations": "Chale compacto com varanda e isolamento termoacustico.",
            "items": [("DEMO-CHALE-001", Decimal("2")), ("DEMO-CHALE-002", Decimal("96")), ("DEMO-CHALE-007", Decimal("28")), ("DEMO-CHALE-008", Decimal("2"))],
        },
    ]

    for spec in quote_specs:
        quote = db.query(Quote).filter(Quote.numero_orcamento == spec["numero"]).first()
        if not quote:
            created_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=spec["created_days"])
            quote = Quote(
                numero_orcamento=spec["numero"],
                client_id=clients[spec["client"]].id,
                seller_id=seller.id,
                status=spec["status"],
                desconto=spec["desconto"],
                valor_frete=spec["frete"],
                payment_condition=spec["payment"],
                shipping_type=spec["shipping"],
                observations=spec["observations"],
                created_at=created_at,
                updated_at=created_at,
                sent_at=created_at if spec["status"] != QuoteStatus.RASCUNHO else None,
            )
            db.add(quote)
            db.flush()

        add_quote_items(
            db,
            quote,
            [(products[product_code], quantity) for product_code, quantity in spec["items"]],
        )


def seed() -> None:
    db = SessionLocal()
    try:
        seller = get_or_create_seller(db)
        products = seed_products(db)
        clients = seed_clients(db)
        seed_quotes(db, seller, clients, products)
        db.commit()
        print("Demo data seeded successfully.")
        print(f"Products seeded: {len(products)}")
        print(f"Clients seeded: {len(clients)}")
        print(f"Quotes assigned to: {seller.name} ({seller.email})")
    finally:
        db.close()


def cleanup() -> None:
    db = SessionLocal()
    try:
        demo_quotes = db.query(Quote).filter(Quote.numero_orcamento.like(f"{DEMO_PREFIX}-%")).all()
        demo_quote_ids = [quote.id for quote in demo_quotes]

        if demo_quote_ids:
            db.query(QuoteItem).filter(QuoteItem.quote_id.in_(demo_quote_ids)).delete(synchronize_session=False)
            db.query(Quote).filter(Quote.id.in_(demo_quote_ids)).delete(synchronize_session=False)

        db.query(Product).filter(Product.codigo.like(f"{DEMO_PREFIX}-%")).delete(synchronize_session=False)
        db.query(Client).filter(Client.cnpj.in_([client["cnpj"] for client in CLIENTS])).delete(synchronize_session=False)
        db.query(User).filter(User.email == "demo.seller@aulevi.local").delete(synchronize_session=False)
        db.commit()
        print("Demo data cleaned successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "seed"
    if command == "seed":
        seed()
    elif command == "cleanup":
        cleanup()
    else:
        print("Usage: python scripts/seed_demo_data.py [seed|cleanup]")
        raise SystemExit(1)