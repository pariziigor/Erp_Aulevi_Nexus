import os
import subprocess
from decimal import Decimal
from functools import lru_cache
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException
from jinja2 import Environment, FileSystemLoader


class PDFService:
    _BASE_DIR = Path(__file__).resolve().parents[2]
    _RENDERER_PATH = _BASE_DIR / "pdf-renderer" / "render-pdf.cjs"
    _TEMPLATES_DIR = _BASE_DIR / "src" / "templates"
    _STYLESHEET_PATH = _TEMPLATES_DIR / "quote_pdf.css"

    @staticmethod
    def _format_brl(value) -> str:
        amount = Decimal(str(value or 0))
        formatted = f"{amount:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
        return f"R$ {formatted}"

    @staticmethod
    def _commercial_label(value) -> str:
        if not value:
            return "A combinar"
        labels = {
            "A_VISTA": "À vista",
            "30_DIAS": "30 dias",
            "30_60": "30 / 60 dias",
            "30_60_90": "30 / 60 / 90 dias",
            "ENTRADA_PARCELAS": "Entrada + parcelas",
            "ENTREGA_LOCAL": "Entrega local",
            "FRETE_INCLUSO": "Frete incluso",
            "FRETE_A_CALCULAR": "Frete a calcular",
        }
        return labels.get(str(value), str(value).replace("_", " ").title())

    @staticmethod
    @lru_cache(maxsize=1)
    def _get_template_environment() -> Environment:
        env = Environment(loader=FileSystemLoader(PDFService._TEMPLATES_DIR))
        env.filters["brl"] = PDFService._format_brl
        env.filters["commercial_label"] = PDFService._commercial_label
        return env

    @staticmethod
    def gerar_pdf_orcamento(quote, client, items_details) -> BytesIO:
        """
        Compila o template HTML com os dados dinâmicos do banco
        e o converte em PDF usando o Chromium gerenciado pelo Puppeteer.
        """
        env = PDFService._get_template_environment()
        template = env.get_template("quote_pdf.html")

        html_content = template.render(
            quote=quote,
            client=client,
            items_details=items_details,
        )

        node_binary = os.getenv("PDF_NODE_BINARY", "node")
        timeout = int(os.getenv("PDF_RENDER_TIMEOUT_SECONDS", "60"))

        try:
            result = subprocess.run(
                [
                    node_binary,
                    str(PDFService._RENDERER_PATH),
                    str(PDFService._STYLESHEET_PATH),
                ],
                input=html_content.encode("utf-8"),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                timeout=timeout,
            )
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=500,
                detail="Node.js não foi encontrado para renderizar o PDF.",
            ) from exc
        except subprocess.TimeoutExpired as exc:
            raise HTTPException(
                status_code=504,
                detail="A renderização do PDF excedeu o tempo limite.",
            ) from exc

        if result.returncode != 0 or not result.stdout.startswith(b"%PDF"):
            renderer_error = result.stderr.decode("utf-8", errors="replace").strip()
            raise HTTPException(
                status_code=500,
                detail=renderer_error or "Erro interno ao renderizar o PDF comercial.",
            )

        return BytesIO(result.stdout)
