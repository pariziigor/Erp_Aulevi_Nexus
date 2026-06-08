from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.audit_logs import router as audit_logs_router
from src.api.auth import router as auth_router
from src.api.clients import router as clients_router
from src.api.products import router as products_router
from src.api.quotes import router as quotes_router
from src.api.commercial import router as commercial_router
from src.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials="*" not in settings.cors_origins_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(clients_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(quotes_router, prefix="/api")
app.include_router(audit_logs_router, prefix="/api")
app.include_router(commercial_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "API do ERP Comercial rodando perfeitamente."}
