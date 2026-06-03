import React, { useEffect, useState } from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import { ProductBulkActions } from '../components/products/ProductBulkActions';
import { ProductFilters } from '../components/products/ProductFilters';
import { ProductsTable } from '../components/products/ProductsTable';
import type { Product } from '../components/products/types';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

export const Products: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Erro ao buscar catalogo de produtos', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase();
    const matchesSearch =
      product.descricao.toLowerCase().includes(term) ||
      product.codigo.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'ALL' || product.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function handleExportProducts() {
    setExporting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await api.get('/products/export', { responseType: 'blob' });
      downloadBlob(
        new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'produtos_aulevi.xlsx'
      );
      setMessage('Planilha de produtos gerada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar produtos.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadTemplate() {
    setError(null);
    setMessage(null);
    try {
      const response = await api.get('/products/template', { responseType: 'blob' });
      downloadBlob(
        new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        'modelo_produtos_aulevi.xlsx'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar modelo da planilha.');
    }
  }

  async function handleImportProducts(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImporting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await api.post('/products/import', file, {
        headers: {
          'Content-Type': file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'X-Filename': file.name,
        },
      });
      setMessage(`Carga concluída: ${response.data.criados} criados e ${response.data.atualizados} atualizados.`);
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar produtos.');
    } finally {
      setImporting(false);
    }
  }

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

      {user?.role === 'ADM' && (
        <ProductBulkActions
          exporting={exporting}
          importing={importing}
          onDownloadTemplate={handleDownloadTemplate}
          onExportProducts={handleExportProducts}
          onImportProducts={handleImportProducts}
        />
      )}

      {error && <div className="nexus-alert-error">[ERRO]: {error}</div>}
      {message && <div className="nexus-alert-success">[OK]: {message}</div>}

      <ProductFilters
        search={search}
        categoryFilter={categoryFilter}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryFilter}
      />

      <ProductsTable loading={loading} products={filteredProducts} />
    </div>
  );
};

