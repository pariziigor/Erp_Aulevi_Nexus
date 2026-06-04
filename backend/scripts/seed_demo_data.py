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
DEFAULT_PASSWORD = "Aulevi@123"

SELLERS = [
    {"name": "Igor Aulevi", "email": "igor@aulevi.com"},
    {"name": "Leandro Aulevi", "email": "leandro@aulevi.com"},
    {"name": "Maria Aulevi", "email": "maria@aulevi.com"},
]

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
    ("DEMO-LSF-013", "Membrana hidrofuga para fachada", CategoryEnum.LSF, "RL", "389.90"),
    ("DEMO-LSF-014", "Fita de vedacao para membrana", CategoryEnum.LSF, "RL", "46.80"),
    ("DEMO-LSF-015", "Perfil cartola galvanizado", CategoryEnum.LSF, "UN", "39.90"),
    ("DEMO-LSF-016", "Lã de vidro termoacustica 50mm", CategoryEnum.LSF, "RL", "214.90"),
    ("DEMO-LSF-017", "Placa drywall RU 1200x2400", CategoryEnum.LSF, "UN", "89.90"),
    ("DEMO-LSF-018", "Placa drywall RF 1200x2400", CategoryEnum.LSF, "UN", "104.50"),
    ("DEMO-LSF-019", "Massa tratamento de juntas", CategoryEnum.LSF, "BD", "72.90"),
    ("DEMO-LSF-020", "Fita telada para juntas", CategoryEnum.LSF, "RL", "24.90"),

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
    ("DEMO-MM-013", "Rufo galvanizado corte sob medida", CategoryEnum.MM, "M", "64.90"),
    ("DEMO-MM-014", "Pingadeira galvanizada", CategoryEnum.MM, "M", "49.90"),
    ("DEMO-MM-015", "Pontalete metalico regulavel", CategoryEnum.MM, "UN", "136.50"),
    ("DEMO-MM-016", "Contraventamento metalico", CategoryEnum.MM, "UN", "58.40"),
    ("DEMO-MM-017", "Telha shingle premium", CategoryEnum.MM, "M2", "138.90"),
    ("DEMO-MM-018", "Telha ceramica colonial", CategoryEnum.MM, "M2", "72.30"),
    ("DEMO-MM-019", "Telha concreto plana", CategoryEnum.MM, "M2", "84.20"),
    ("DEMO-MM-020", "Kit fixacao para telhado", CategoryEnum.MM, "KIT", "245.00"),

    # Chale
    ("DEMO-CHALE-001", "Kit estrutura chale compacto", CategoryEnum.CHALE, "KIT", "9850.00"),
    ("DEMO-CHALE-002", "Fechamento externo chale", CategoryEnum.CHALE, "M2", "245.00"),
    ("DEMO-CHALE-003", "Kit estrutura chale premium", CategoryEnum.CHALE, "KIT", "18450.00"),
    ("DEMO-CHALE-004", "Mezanino metalico para chale", CategoryEnum.CHALE, "KIT", "6200.00"),
    ("DEMO-CHALE-005", "Escada compacta para chale", CategoryEnum.CHALE, "UN", "1890.00"),
    ("DEMO-CHALE-006", "Deck externo modular", CategoryEnum.CHALE, "M2", "310.00"),
    ("DEMO-CHALE-007", "Cobertura varanda chale", CategoryEnum.CHALE, "M2", "420.00"),
    ("DEMO-CHALE-008", "Kit isolamento termoacustico chale", CategoryEnum.CHALE, "KIT", "3150.00"),
    ("DEMO-CHALE-009", "Kit hidraulico basico chale", CategoryEnum.CHALE, "KIT", "2890.00"),
    ("DEMO-CHALE-010", "Kit eletrico basico chale", CategoryEnum.CHALE, "KIT", "2350.00"),
    ("DEMO-CHALE-011", "Janela aluminio chale", CategoryEnum.CHALE, "UN", "740.00"),
    ("DEMO-CHALE-012", "Porta externa chale", CategoryEnum.CHALE, "UN", "1190.00"),
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
    {
        "cnpj": "99000000000111",
        "razao_social": "DEMO SHOPPING PLAZA NORTE LTDA",
        "nome_fantasia": "Plaza Norte Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "02047000",
        "endereco": "Avenida Otto Baumgart",
        "numero": "500",
        "bairro": "Vila Guilherme",
        "cidade": "Sao Paulo",
        "uf": "SP",
        "contato_nome": "Eduardo Demo",
        "contato_email": "eduardo.demo@example.com",
        "contato_whatsapp": "11990000011",
        "contato_telefone": "1130000011",
    },
    {
        "cnpj": "99000000000112",
        "razao_social": "DEMO CONDOMINIOS VERTICAIS LTDA",
        "nome_fantasia": "Condominios Verticais Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "13010000",
        "endereco": "Rua Barao de Jaguara",
        "numero": "980",
        "bairro": "Centro",
        "cidade": "Campinas",
        "uf": "SP",
        "contato_nome": "Larissa Demo",
        "contato_email": "larissa.demo@example.com",
        "contato_whatsapp": "19990000012",
        "contato_telefone": "1930000012",
    },
    {
        "cnpj": "99000000000113",
        "razao_social": "DEMO LOGISTICA E GALPOES LTDA",
        "nome_fantasia": "Log Galpoes Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "29164000",
        "endereco": "Avenida Eldes Scherrer Souza",
        "numero": "2162",
        "bairro": "Parque Residencial Laranjeiras",
        "cidade": "Serra",
        "uf": "ES",
        "contato_nome": "Marcelo Demo",
        "contato_email": "marcelo.demo@example.com",
        "contato_whatsapp": "27990000013",
        "contato_telefone": "2730000013",
    },
    {
        "cnpj": "99000000000114",
        "razao_social": "DEMO POUSADAS DA MANTIQUEIRA LTDA",
        "nome_fantasia": "Mantiqueira Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "12460000",
        "endereco": "Avenida Januario Miraglia",
        "numero": "1020",
        "bairro": "Capivari",
        "cidade": "Campos do Jordao",
        "uf": "SP",
        "contato_nome": "Sofia Demo",
        "contato_email": "sofia.demo@example.com",
        "contato_whatsapp": "12990000014",
        "contato_telefone": "1230000014",
    },
    {
        "cnpj": "99000000000115",
        "razao_social": "DEMO CONSTRUCOES LITORAL LTDA",
        "nome_fantasia": "Litoral Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "11010000",
        "endereco": "Avenida Ana Costa",
        "numero": "420",
        "bairro": "Gonzaga",
        "cidade": "Santos",
        "uf": "SP",
        "contato_nome": "Vitor Demo",
        "contato_email": "vitor.demo@example.com",
        "contato_whatsapp": "13990000015",
        "contato_telefone": "1330000015",
    },
    {
        "cnpj": "99000000000116",
        "razao_social": "DEMO AGROINDUSTRIA CENTRO OESTE SA",
        "nome_fantasia": "Agro Centro Oeste Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "78005000",
        "endereco": "Avenida Getulio Vargas",
        "numero": "900",
        "bairro": "Centro Norte",
        "cidade": "Cuiaba",
        "uf": "MT",
        "contato_nome": "Renata Demo",
        "contato_email": "renata.demo@example.com",
        "contato_whatsapp": "65990000016",
        "contato_telefone": "6530000016",
    },
    {
        "cnpj": "99000000000117",
        "razao_social": "DEMO RESORTS E CABANAS LTDA",
        "nome_fantasia": "Resorts Cabanas Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "95670000",
        "endereco": "Avenida Borges de Medeiros",
        "numero": "2400",
        "bairro": "Centro",
        "cidade": "Gramado",
        "uf": "RS",
        "contato_nome": "Paulo Demo",
        "contato_email": "paulo.demo@example.com",
        "contato_whatsapp": "54990000017",
        "contato_telefone": "5430000017",
    },
    {
        "cnpj": "99000000000118",
        "razao_social": "DEMO ENGENHARIA AMAZONIA LTDA",
        "nome_fantasia": "Amazonia Engenharia Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "69010000",
        "endereco": "Avenida Eduardo Ribeiro",
        "numero": "1150",
        "bairro": "Centro",
        "cidade": "Manaus",
        "uf": "AM",
        "contato_nome": "Juliana Demo",
        "contato_email": "juliana.demo@example.com",
        "contato_whatsapp": "92990000018",
        "contato_telefone": "9230000018",
    },
    {
        "cnpj": "99000000000119",
        "razao_social": "DEMO URBANISMO NORTE LTDA",
        "nome_fantasia": "Urbanismo Norte Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "66010000",
        "endereco": "Avenida Presidente Vargas",
        "numero": "680",
        "bairro": "Campina",
        "cidade": "Belem",
        "uf": "PA",
        "contato_nome": "Diego Demo",
        "contato_email": "diego.demo@example.com",
        "contato_whatsapp": "91990000019",
        "contato_telefone": "9130000019",
    },
    {
        "cnpj": "99000000000120",
        "razao_social": "DEMO HABITATS MODULARES LTDA",
        "nome_fantasia": "Habitats Modulares Demo",
        "situacao_cadastral": "ATIVA",
        "cep": "70040900",
        "endereco": "SCS Quadra 2",
        "numero": "120",
        "bairro": "Asa Sul",
        "cidade": "Brasilia",
        "uf": "DF",
        "contato_nome": "Aline Demo",
        "contato_email": "aline.demo@example.com",
        "contato_whatsapp": "61990000020",
        "contato_telefone": "6130000020",
    },
]

BASE_QUOTE_SPECS = [
    {
        "numero": "DEMO-ORC-0001",
        "seller": "igor@aulevi.com",
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
        "seller": "leandro@aulevi.com",
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
        "seller": "maria@aulevi.com",
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
]

QUOTE_PATTERNS = [
    {
        "status": QuoteStatus.PENDENTE,
        "desconto": Decimal("180.00"),
        "frete": Decimal("620.00"),
        "payment": "BOLETO 14/28 DIAS",
        "shipping": "TRANSPORTADORA",
        "observations": "Orcamento LSF para residencia compacta com fechamento externo.",
        "items": [("DEMO-LSF-004", Decimal("32")), ("DEMO-LSF-005", Decimal("44")), ("DEMO-LSF-012", Decimal("20")), ("DEMO-LSF-016", Decimal("8"))],
    },
    {
        "status": QuoteStatus.APROVADO,
        "desconto": Decimal("0.00"),
        "frete": Decimal("890.00"),
        "payment": "PIX NA APROVACAO",
        "shipping": "CIF",
        "observations": "Cobertura metalica com telhas galvanizadas e conjunto de rufos.",
        "items": [("DEMO-MM-005", Decimal("50")), ("DEMO-MM-010", Decimal("130")), ("DEMO-MM-013", Decimal("30")), ("DEMO-MM-020", Decimal("5"))],
    },
    {
        "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
        "desconto": Decimal("750.00"),
        "frete": Decimal("1550.00"),
        "payment": "ENTRADA 40% + 3 PARCELAS",
        "shipping": "CIF",
        "observations": "Chale premium com varanda, mezanino e kits complementares.",
        "items": [("DEMO-CHALE-003", Decimal("1")), ("DEMO-CHALE-004", Decimal("1")), ("DEMO-CHALE-007", Decimal("18")), ("DEMO-CHALE-010", Decimal("1"))],
    },
    {
        "status": QuoteStatus.RASCUNHO,
        "desconto": Decimal("0.00"),
        "frete": Decimal("0.00"),
        "payment": "A DEFINIR",
        "shipping": "A DEFINIR",
        "observations": "Simulacao inicial aguardando confirmacao de metragem e padrao de acabamento.",
        "items": [("DEMO-LSF-001", Decimal("28")), ("DEMO-LSF-002", Decimal("38")), ("DEMO-LSF-017", Decimal("16"))],
    },
    {
        "status": QuoteStatus.CANCELADO,
        "desconto": Decimal("90.00"),
        "frete": Decimal("430.00"),
        "payment": "CARTAO 3X",
        "shipping": "RETIRADA",
        "observations": "Orcamento cancelado por alteracao de escopo do cliente.",
        "items": [("DEMO-MM-009", Decimal("85")), ("DEMO-MM-011", Decimal("8")), ("DEMO-MM-014", Decimal("22"))],
    },
    {
        "status": QuoteStatus.PENDENTE,
        "desconto": Decimal("320.00"),
        "frete": Decimal("1180.00"),
        "payment": "BOLETO 30/60 DIAS",
        "shipping": "FOB",
        "observations": "Kit para galpao com estrutura metalica, calhas e contraventamento.",
        "items": [("DEMO-MM-001", Decimal("18")), ("DEMO-MM-004", Decimal("60")), ("DEMO-MM-012", Decimal("42")), ("DEMO-MM-016", Decimal("24"))],
    },
    {
        "status": QuoteStatus.APROVADO,
        "desconto": Decimal("420.00"),
        "frete": Decimal("730.00"),
        "payment": "A VISTA COM DESCONTO",
        "shipping": "TRANSPORTADORA",
        "observations": "Reposicao de placas, massas, fitas e parafusos para obra em andamento.",
        "items": [("DEMO-LSF-003", Decimal("34")), ("DEMO-LSF-006", Decimal("6")), ("DEMO-LSF-019", Decimal("10")), ("DEMO-LSF-020", Decimal("12"))],
    },
    {
        "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
        "desconto": Decimal("1200.00"),
        "frete": Decimal("2450.00"),
        "payment": "ENTRADA + 4 PARCELAS",
        "shipping": "CIF",
        "observations": "Pacote de chales para implantacao em area turistica.",
        "items": [("DEMO-CHALE-001", Decimal("3")), ("DEMO-CHALE-002", Decimal("144")), ("DEMO-CHALE-006", Decimal("45")), ("DEMO-CHALE-009", Decimal("3"))],
    },
    {
        "status": QuoteStatus.PENDENTE,
        "desconto": Decimal("0.00"),
        "frete": Decimal("510.00"),
        "payment": "BOLETO 21 DIAS",
        "shipping": "RETIRADA",
        "observations": "Venda pontual de ancoradores, membranas e perfis cartola.",
        "items": [("DEMO-LSF-008", Decimal("180")), ("DEMO-LSF-013", Decimal("4")), ("DEMO-LSF-014", Decimal("10")), ("DEMO-LSF-015", Decimal("36"))],
    },
    {
        "status": QuoteStatus.APROVADO,
        "desconto": Decimal("270.00"),
        "frete": Decimal("670.00"),
        "payment": "ENTRADA 50% + SALDO NA ENTREGA",
        "shipping": "CIF",
        "observations": "Telhado com telha shingle e complementos de acabamento.",
        "items": [("DEMO-MM-017", Decimal("95")), ("DEMO-MM-013", Decimal("28")), ("DEMO-MM-014", Decimal("20")), ("DEMO-MM-020", Decimal("4"))],
    },
    {
        "status": QuoteStatus.RASCUNHO,
        "desconto": Decimal("0.00"),
        "frete": Decimal("0.00"),
        "payment": "A DEFINIR",
        "shipping": "A DEFINIR",
        "observations": "Estudo preliminar de chale compacto com portas e janelas.",
        "items": [("DEMO-CHALE-001", Decimal("1")), ("DEMO-CHALE-011", Decimal("4")), ("DEMO-CHALE-012", Decimal("2"))],
    },
    {
        "status": QuoteStatus.PENDENTE,
        "desconto": Decimal("150.00"),
        "frete": Decimal("980.00"),
        "payment": "BOLETO 30 DIAS",
        "shipping": "TRANSPORTADORA",
        "observations": "Estrutura para telhado ceramico com pontaletes e fixacao completa.",
        "items": [("DEMO-MM-015", Decimal("28")), ("DEMO-MM-018", Decimal("120")), ("DEMO-MM-020", Decimal("6")), ("DEMO-MM-016", Decimal("18"))],
    },
    {
        "status": QuoteStatus.CONVERTIDO_EM_PEDIDO,
        "desconto": Decimal("980.00"),
        "frete": Decimal("1760.00"),
        "payment": "ENTRADA 30% + 2 PARCELAS",
        "shipping": "CIF",
        "observations": "Residencia em LSF com drywall, isolamento e projeto estrutural.",
        "items": [("DEMO-LSF-004", Decimal("80")), ("DEMO-LSF-005", Decimal("120")), ("DEMO-LSF-011", Decimal("1")), ("DEMO-LSF-016", Decimal("18")), ("DEMO-LSF-017", Decimal("60"))],
    },
    {
        "status": QuoteStatus.CANCELADO,
        "desconto": Decimal("0.00"),
        "frete": Decimal("350.00"),
        "payment": "BOLETO 14 DIAS",
        "shipping": "TRANSPORTADORA",
        "observations": "Cliente solicitou cancelamento para revisar o cronograma da obra.",
        "items": [("DEMO-LSF-018", Decimal("22")), ("DEMO-LSF-019", Decimal("6")), ("DEMO-LSF-020", Decimal("8"))],
    },
]


def build_quote_specs(total: int = 48) -> list[dict]:
    """Build deterministic quote specs distributed among the three Aulevi sellers."""
    specs = list(BASE_QUOTE_SPECS)
    seller_emails = [seller["email"] for seller in SELLERS]
    client_cnpjs = [client["cnpj"] for client in CLIENTS]

    next_number = len(specs) + 1
    while len(specs) < total:
        pattern = QUOTE_PATTERNS[(next_number - 1) % len(QUOTE_PATTERNS)]
        created_days = (next_number * 3) % 42
        specs.append(
            {
                **pattern,
                "numero": f"DEMO-ORC-{next_number:04d}",
                "seller": seller_emails[(next_number - 1) % len(seller_emails)],
                "client": client_cnpjs[(next_number - 1) % len(client_cnpjs)],
                "created_days": created_days,
            }
        )
        next_number += 1

    return specs


def seed_sellers(db) -> dict[str, User]:
    sellers: dict[str, User] = {}
    for payload in SELLERS:
        user = db.query(User).filter(User.email == payload["email"]).first()
        if not user:
            user = User(
                name=payload["name"],
                email=payload["email"],
                password_hash=pwd_context.hash(DEFAULT_PASSWORD),
                role=RoleEnum.SELLER,
                is_active=True,
                must_change_password=False,
            )
            db.add(user)
            db.flush()
        else:
            user.name = payload["name"]
            user.role = RoleEnum.SELLER
            user.is_active = True
        sellers[payload["email"]] = user
    return sellers


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
        else:
            product.descricao = descricao
            product.categoria = categoria
            product.unidade_medida = unidade
            product.preco = Decimal(preco)
            product.is_active = True
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
        else:
            for field, value in payload.items():
                setattr(client, field, value)
            client.is_active = True
        clients[payload["cnpj"]] = client
    return clients


def replace_quote_items(db, quote: Quote, items: list[tuple[Product, Decimal]]) -> None:
    db.query(QuoteItem).filter(QuoteItem.quote_id == quote.id).delete(synchronize_session=False)

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


def seed_quotes(
    db,
    sellers: dict[str, User],
    clients: dict[str, Client],
    products: dict[str, Product],
) -> None:
    for spec in build_quote_specs(total=48):
        quote = db.query(Quote).filter(Quote.numero_orcamento == spec["numero"]).first()
        created_at = datetime.now(UTC).replace(tzinfo=None) - timedelta(days=spec["created_days"])

        client = clients.get(spec["client"])
        if not client or not client.id:
            raise RuntimeError(f"Cliente demo não encontrado ou sem ID: {spec['client']}")

        seller = sellers.get(spec["seller"])
        if not seller or not seller.id:
            raise RuntimeError(f"Vendedor demo não encontrado ou sem ID: {spec['seller']}")

        missing_products = [product_code for product_code, _ in spec["items"] if product_code not in products]
        if missing_products:
            raise RuntimeError(
                f"Produtos demo não encontrados no orçamento {spec['numero']}: {', '.join(missing_products)}"
            )

        if not quote:
            quote = Quote(
                numero_orcamento=spec["numero"],
                client_id=client.id,
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
        else:
            quote.client_id = client.id
            quote.seller_id = seller.id
            quote.status = spec["status"]
            quote.desconto = spec["desconto"]
            quote.valor_frete = spec["frete"]
            quote.payment_condition = spec["payment"]
            quote.shipping_type = spec["shipping"]
            quote.observations = spec["observations"]
            quote.created_at = created_at
            quote.updated_at = created_at
            quote.sent_at = created_at if spec["status"] != QuoteStatus.RASCUNHO else None

        # Importante: só fazemos flush depois de preencher os campos obrigatórios
        # client_id e seller_id. O PostgreSQL não permite inserir orçamento sem eles.
        db.flush()

        replace_quote_items(
            db,
            quote,
            [(products[product_code], quantity) for product_code, quantity in spec["items"]],
        )


def seed() -> None:
    db = SessionLocal()
    try:
        sellers = seed_sellers(db)
        products = seed_products(db)
        clients = seed_clients(db)
        seed_quotes(db, sellers, clients, products)
        db.commit()
        print("Demo data seeded successfully.")
        print(f"Sellers seeded: {len(sellers)}")
        print(f"Products seeded: {len(products)}")
        print(f"Clients seeded: {len(clients)}")
        print("Quotes seeded: 48")
        print("Seller logins:")
        for seller in SELLERS:
            print(f"- {seller['email']} | senha: {DEFAULT_PASSWORD}")
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

        # Mantem os usuarios reais da Aulevi. O cleanup remove apenas dados demo transacionais.
        db.commit()
        print("Demo data cleaned successfully.")
        print("Aulevi seller users were kept intentionally.")
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