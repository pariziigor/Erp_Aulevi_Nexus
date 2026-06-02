import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Filter, Layers, Search } from 'lucide-react';

interface Product {
  id: string;
  codigo: string;
  descricao: string;
  categoria: 'LSF' | 'MM' | 'CHALE';
  preco: number;
  unidade_medida: string;
  is_active: boolean;
}

export const Products: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Erro ao buscar catalogo de produtos', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();
    const matchesSearch = product.descricao.toLowerCase().includes(term) ||
      product.codigo.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'ALL' || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Catalogo de Estruturas & Insumos</h2>
        <div className="nexus-badge">
          <Layers size={14} /> Total: {filteredProducts.length} itens
        </div>
      </div>

      <div className="nexus-filter-bar md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome do insumo ou codigo..."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm font-bold uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="LSF">Light Steel Frame (LSF)</option>
            <option value="MM">Madeiramento Metalico (MM)</option>
            <option value="CHALE">Chales</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Sincronizando catalogo com o banco central...</div>
      ) : (
        <div className="nexus-table-wrap">
          <table className="w-full text-left">
            <thead>
              <tr className="nexus-table-head">
                <th className="p-3 w-32">Codigo</th>
                <th className="p-3">Item / Descricao</th>
                <th className="p-3 w-40">Categoria</th>
                <th className="p-3 w-28 text-right">Preco Unit.</th>
                <th className="p-3 w-24 text-center">Unidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center font-mono text-xs text-gray-500 uppercase">
                    Nenhum produto correspondente aos filtros de busca.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-orange-50/50">
                    <td className="p-3 font-mono text-xs font-bold">{product.codigo}</td>
                    <td className="p-3">
                      <div className="font-bold uppercase">{product.descricao}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{product.is_active ? 'Ativo no catalogo' : 'Inativo'}</div>
                    </td>
                    <td className="p-3 text-xs">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-bold uppercase text-slate-600">
                        {product.categoria}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-950">
                      {formatCurrency(Number(product.preco))}
                    </td>
                    <td className="p-3 font-mono text-xs text-center uppercase font-medium">
                      {product.unidade_medida}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
