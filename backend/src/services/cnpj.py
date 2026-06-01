# backend/src/services/cnpj.py
import httpx
from fastapi import HTTPException, status

class CNPJService:
    @staticmethod
    async def consultar_cnpj(cnpj: str) -> dict:
        # Remove pontos, barras e traços, deixando apenas números
        cnpj_limpo = "".join(filter(str.isdigit, cnpj))
        
        if len(cnpj_limpo) != 14:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CNPJ inválido. Deve conter 14 dígitos."
            )
            
        url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj_limpo}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=10.0)
                
                if response.status_code == 404:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="CNPJ não encontrado na base da BrasilAPI."
                    )
                elif response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Falha ao integrar com o serviço de busca de CNPJ."
                    )
                    
                dados = response.json()
                
                # Mapeamos e limpamos os dados retornados para o formato que nosso ERP precisa
                return {
                    "cnpj": cnpj_limpo,
                    "razao_social": dados.get("razao_social"),
                    "nome_fantasia": dados.get("nome_fantasia") or dados.get("razao_social"),
                    "situacao_cadastral": dados.get("descricao_situacao_cadastral"),
                    "cnae": dados.get("cnae_fiscal_descricao"),
                    "cep": dados.get("cep"),
                    "endereco": dados.get("logradouro"),
                    "numero": dados.get("numero"),
                    "bairro": dados.get("bairro"),
                    "cidade": dados.get("municipio"),
                    "uf": dados.get("uf")
                }
            except httpx.RequestError:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="A BrasilAPI demorou muito para responder. Tente novamente."
                )
