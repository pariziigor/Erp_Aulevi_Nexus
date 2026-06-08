import httpx
from fastapi import HTTPException, status


class CNPJService:
    @staticmethod
    def validar_cnpj(cnpj: str) -> bool:
        digits = "".join(filter(str.isdigit, cnpj))
        if len(digits) != 14 or digits == digits[0] * 14:
            return False

        def calculate_digit(base: str, weights: list[int]) -> str:
            total = sum(int(digit) * weight for digit, weight in zip(base, weights))
            remainder = total % 11
            return str(0 if remainder < 2 else 11 - remainder)

        first = calculate_digit(digits[:12], [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
        second = calculate_digit(digits[:12] + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
        return digits[-2:] == first + second

    @staticmethod
    async def consultar_cnpj(cnpj: str) -> dict:
        cnpj_limpo = "".join(filter(str.isdigit, cnpj))
        if not CNPJService.validar_cnpj(cnpj_limpo):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CNPJ invalido. Verifique os 14 digitos informados.",
            )

        url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj_limpo}"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=10.0)
            except httpx.RequestError:
                raise HTTPException(
                    status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                    detail="A BrasilAPI demorou muito para responder. Tente novamente.",
                )

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="CNPJ nao encontrado na base da BrasilAPI.",
            )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Falha ao integrar com o servico de busca de CNPJ.",
            )

        dados = response.json()
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
            "uf": dados.get("uf"),
        }
