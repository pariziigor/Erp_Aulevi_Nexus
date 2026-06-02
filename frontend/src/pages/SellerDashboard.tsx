import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, CalendarDays, Download, Eye, FileText, Loader2, Search, TrendingUp } from 'lucide-react';

interface SellerSummary {
  total_orcamentos: number;
  orcamentos_pendentes: number;
  orcamentos_aprovados: number;
  orcamentos_cancelados: number;
  taxa_conversao: number;
  valor_total_orcado: number;
  valor_total_aprovado: number;
  ticket_medio: number;
}

interface SellerQuoteItem {
  id: string;
  codigo?: string;
  descricao?: string;
  categoria?: string;
  unidade_medida?: string;
  quantidade: number;
  preco_unitario: number;
  total_item: number;
}

interface SellerQuote {
  id: string;
  numero_orcamento: string;
  status: string;
  client_name?: string;
  client_cnpj?: string;
  client_city?: string;
  client_uf?: string;
  subtotal: number;
  desconto: number;
  valor_frete: number;
  total: number;
  payment_condition?: string;
  shipping_type?: string;
  observations?: string;
  client_response?: string;
  created_at: string;
  updated_at?: string;
  items: SellerQuoteItem[];
}

interface SellerDashboardPayload {
  seller: {
    id: string;
    name: string;
    email: string;
  };
  summary: SellerSummary;
  quotes: SellerQuote[];
}

export const SellerDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [payload, setPayload] = useState<SellerDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedQuote, setSelectedQuote] = useState<SellerQuote | null>(null);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/quotes/seller/dashboard');
        setPayload(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar painel do vendedor.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const quotes = useMemo(() => payload?.quotes || [], [payload?.quotes]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(quotes.map((quote) => quote.status))).sort();
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter;
      const matchesSearch = !term || [
        quote.numero_orcamento,
        quote.client_name,
        quote.client_cnpj,
        quote.client_city,
        quote.client_uf,
      ].some((value) => String(value || '').toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [quotes, search, statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  };

  const statusLabel = (statusValue: string) => statusValue.replaceAll('_', ' ');

  const statusClass = (statusValue: string) => {
    if (statusValue.includes('APROVADO') || statusValue.includes('CONVERTIDO')) return 'bg-green-50';
    if (statusValue.includes('CANCELADO') || statusValue.includes('EXPIRADO')) return 'bg-red-50';
    if (statusValue.includes('PENDENTE')) return 'bg-yellow-50';
    return 'bg-gray-50';
  };

  async function handleDownloadPdf(quote: SellerQuote) {
    setDownloadingQuoteId(quote.id);
    try {
      const response = await api.get(`/quotes/${quote.id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orcamento_${quote.numero_orcamento}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao baixar PDF.');
    } finally {
      setDownloadingQuoteId(null);
    }
  }

  if (loading) {
    return <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Carregando seu painel comercial...</div>;
  }

  if (error && !payload) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <div className="nexus-alert-error">{error}</div>
      </div>
    );
  }

  const summary = payload?.summary;

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Meu Painel de Orcamentos</h2>
        <div className="nexus-badge">
          {payload?.seller.name}
        </div>
      </div>

      {error && (
        <div className="nexus-alert-error">{error}</div>
      )}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="nexus-surface flex h-32 flex-col justify-between p-5">
            <div className="flex justify-between text-xs font-black uppercase text-gray-500">
              <span>Total Emitido</span>
              <FileText size={18} />
            </div>
            <div className="text-3xl font-black font-mono">{summary.total_orcamentos}</div>
          </div>
          <div className="nexus-surface flex h-32 flex-col justify-between p-5">
            <div className="flex justify-between text-xs font-black uppercase text-gray-500">
              <span>Pipeline</span>
              <TrendingUp size={18} />
            </div>
            <div className="text-2xl font-black font-mono">{formatCurrency(summary.valor_total_orcado)}</div>
          </div>
          <div className="nexus-surface flex h-32 flex-col justify-between p-5">
            <div className="text-xs font-black uppercase text-gray-500">Aprovado</div>
            <div className="text-2xl font-black font-mono">{formatCurrency(summary.valor_total_aprovado)}</div>
          </div>
          <div className="nexus-surface flex h-32 flex-col justify-between p-5">
            <div className="text-xs font-black uppercase text-gray-500">Conversao</div>
            <div className="text-3xl font-black font-mono">{summary.taxa_conversao}%</div>
          </div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono uppercase">
          <div className="nexus-surface p-4">Pendentes: <strong>{summary.orcamentos_pendentes}</strong></div>
          <div className="nexus-surface p-4">Aprovados: <strong>{summary.orcamentos_aprovados}</strong></div>
          <div className="nexus-surface p-4">Cancelados: <strong>{summary.orcamentos_cancelados}</strong></div>
          <div className="nexus-surface p-4">Ticket Medio: <strong>{formatCurrency(summary.ticket_medio)}</strong></div>
        </div>
      )}

      <div className="nexus-filter-bar md:grid-cols-4">
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por numero, cliente, CNPJ ou cidade..."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-bold uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        >
          <option value="ALL">Todos os Status</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>{statusLabel(option)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredQuotes.length === 0 ? (
          <div className="nexus-panel md:col-span-2 xl:col-span-3 p-8 text-center text-xs font-semibold uppercase text-slate-500">
            Nenhum orcamento encontrado.
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <button
              key={quote.id}
              type="button"
              onClick={() => setSelectedQuote(quote)}
              className="nexus-surface flex min-h-56 flex-col justify-between p-5 text-left transition-all hover:-translate-y-1 hover:border-orange-300/60 hover:bg-white/90 hover:shadow-2xl hover:shadow-orange-500/10"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black font-mono">{quote.numero_orcamento}</div>
                    <div className="text-xs font-bold uppercase text-gray-500">{quote.client_name || 'Cliente sem nome'}</div>
                  </div>
                  <span className={`border border-black px-2 py-1 text-[10px] font-black uppercase ${statusClass(quote.status)}`}>
                    {statusLabel(quote.status)}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono">{formatCurrency(quote.total)}</div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-300 pt-3 text-xs font-mono uppercase text-gray-500">
                <span className="flex items-center gap-1"><CalendarDays size={14} /> {formatDate(quote.created_at)}</span>
                <span className="flex items-center gap-1"><Eye size={14} /> Detalhes</span>
              </div>
            </button>
          ))
        )}
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="nexus-panel max-h-[90vh] w-full max-w-5xl space-y-6 overflow-y-auto p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-2xl font-black font-mono">{selectedQuote.numero_orcamento}</h3>
                <p className="text-xs font-mono uppercase text-gray-500">{selectedQuote.client_name} - {selectedQuote.client_city}/{selectedQuote.client_uf}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedQuote)}
                  disabled={downloadingQuoteId === selectedQuote.id}
                  className="nexus-primary-button"
                >
                  {downloadingQuoteId === selectedQuote.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  PDF
                </button>
                <button type="button" onClick={() => setSelectedQuote(null)} className="nexus-secondary-button">
                  Fechar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs uppercase md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Status<br /><strong>{statusLabel(selectedQuote.status)}</strong></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Pagamento<br /><strong>{selectedQuote.payment_condition || '-'}</strong></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Frete<br /><strong>{selectedQuote.shipping_type || '-'}</strong></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Criado<br /><strong>{formatDate(selectedQuote.created_at)}</strong></div>
            </div>

            <div className="nexus-table-wrap">
              <table className="w-full text-left">
                <thead>
                  <tr className="nexus-table-head">
                    <th className="p-3">Codigo</th>
                    <th className="p-3">Descricao</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">Unitario</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {selectedQuote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-mono text-xs">{item.codigo}</td>
                      <td className="p-3 font-bold uppercase text-xs">{item.descricao}</td>
                      <td className="p-3 text-center font-mono">{item.quantidade}</td>
                      <td className="p-3 text-right font-mono text-xs">{formatCurrency(item.preco_unitario)}</td>
                      <td className="p-3 text-right font-mono text-xs font-bold">{formatCurrency(item.total_item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs uppercase md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Subtotal<br /><strong>{formatCurrency(selectedQuote.subtotal)}</strong></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Desconto<br /><strong>{formatCurrency(selectedQuote.desconto)}</strong></div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">Frete<br /><strong>{formatCurrency(selectedQuote.valor_frete)}</strong></div>
              <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-3 text-orange-700">Total<br /><strong>{formatCurrency(selectedQuote.total)}</strong></div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs uppercase text-slate-600">
              <strong>Observacoes:</strong> {selectedQuote.observations || 'Sem observacoes comerciais.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
