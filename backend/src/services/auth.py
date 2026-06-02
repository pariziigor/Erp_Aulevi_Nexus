# backend/src/services/auth.py
from supabase import create_client, Client
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.core.config import settings

# Inicializa o cliente SDK do Supabase
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
supabase_admin: Client | None = None
if settings.SUPABASE_SERVICE_ROLE_KEY:
    supabase_admin = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
security = HTTPBearer()

class AuthService:
    @staticmethod
    def obter_cliente_admin() -> Client:
        if not supabase_admin:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_SERVICE_ROLE_KEY nao configurada. A criacao de usuarios pelo painel ADM exige a chave service_role do Supabase.",
            )
        return supabase_admin

    @staticmethod
    def autenticar_usuario(email: str, password: str) -> dict:
        """Autentica o usuário direto no Supabase Auth."""
        try:
            # O Supabase valida o e-mail, descriptografa a senha e gera o JWT
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return auth_response
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha incorretos."
            )

    @staticmethod
    def obter_usuario_logado(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        """Middleware para extrair e validar o usuário atual a partir do Token JWT."""
        token = credentials.credentials
        try:
            # Valida o token direto na API do Supabase Auth
            user_data = supabase.auth.get_user(token)
            return user_data.user
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado. Faça login novamente."
            )
