# backend/src/services/pdf.py
import os
from io import BytesIO
from fastapi import HTTPException
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa

class PDFService:
    @staticmethod
    def gerar_pdf_orcamento(quote, client, items_details) -> BytesIO:
        """
        Compila o template HTML com os dados dinâmicos do banco
        e converte em um arquivo PDF binário na memória.
        """
        # Caminho absoluto para a pasta de templates
        base_dir = os.path.dirname(os.path.dirname(__file__))
        templates_dir = os.path.join(base_dir, "templates")
        
        env = Environment(loader=FileSystemLoader(templates_dir))
        template = env.get_template("quote_pdf.html")
        
        # Renderiza o HTML mesclando os dados do banco
        html_content = template.render(
            quote=quote,
            client=client,
            items_details=items_details
        )
        
        # Cria o arquivo PDF na memória (Buffer)
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(BytesIO(html_content.encode("utf-8")), dest=pdf_buffer)
        
        if pisa_status.err:
            raise HTTPException(status_code=500, detail="Erro interno ao renderizar o PDF comercial.")
            
        pdf_buffer.seek(0)
        return pdf_buffer