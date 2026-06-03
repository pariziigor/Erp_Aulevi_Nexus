export interface Product {
  id: string;
  codigo: string;
  descricao: string;
  categoria: 'LSF' | 'MM' | 'CHALE';
  preco: number;
  unidade_medida: string;
  is_active: boolean;
}

