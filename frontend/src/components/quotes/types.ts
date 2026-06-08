export interface ClientOption {
  id: string;
  razao_social: string;
  cnpj: string;
}

export interface ProductOption {
  id: string;
  codigo: string;
  descricao: string;
  categoria: 'LSF' | 'MM' | 'CHALE';
  preco: number;
  unidade_medida: string;
}

export interface QuoteSummary {
  id: string;
  numero_orcamento: string;
  status: string;
  total: number;
  created_at: string;
}

export interface QuoteItem {
  product_id: string;
  codigo: string;
  descricao: string;
  quantity: number;
  price_unit: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface CommercialOption {
  id: string;
  code: string;
  label: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}
