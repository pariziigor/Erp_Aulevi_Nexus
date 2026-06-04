import { useMemo, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  MapPin,
  ShoppingBag,
  Trophy,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { DashboardStats } from './types';

interface DashboardMetricsProps {
  stats: DashboardStats;
  formatCurrency: (value: number) => string;
}

export function DashboardMetrics({ stats, formatCurrency }: DashboardMetricsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 8;
  const cardClass = 'flex min-h-36 flex-col justify-between rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

  const cards = useMemo(() => [
    {
      label: 'Orcado no mes',
      icon: <TrendingUp className="text-orange-500" size={20} />,
      value: formatCurrency(stats.valor_total_orcado_mes),
      helper: 'pipeline comercial real',
    },
    {
      label: 'Clientes',
      icon: <Users className="text-orange-500" size={20} />,
      value: stats.total_clientes,
      helper: 'base compartilhada',
    },
    {
      label: 'Orcamentos',
      icon: <FileText className="text-orange-500" size={20} />,
      value: stats.total_orcamentos,
      helper: 'emitidos no ERP',
    },
    {
      label: 'Conversao',
      icon: <Activity className="text-orange-500" size={20} />,
      value: `${stats.taxa_conversao}%`,
      helper: 'aprovados sobre emitidos',
    },
    {
      label: 'Maior venda por valor',
      icon: <Trophy className="text-orange-500" size={20} />,
      value: stats.vendedor_maior_valor?.name || '-',
      helper: stats.vendedor_maior_valor
        ? `${formatCurrency(stats.vendedor_maior_valor.value)} em ${stats.vendedor_maior_valor.orders} pedidos`
        : 'sem vendas aprovadas',
    },
    {
      label: 'Mais pedidos',
      icon: <ShoppingBag className="text-orange-500" size={20} />,
      value: stats.vendedor_maior_pedidos?.name || '-',
      helper: stats.vendedor_maior_pedidos
        ? `${stats.vendedor_maior_pedidos.orders} pedidos | ${formatCurrency(stats.vendedor_maior_pedidos.value)}`
        : 'sem pedidos aprovados',
    },
    {
      label: 'Regiao lider',
      icon: <MapPin className="text-orange-500" size={20} />,
      value: stats.regiao_maior_vendas?.region || '-',
      helper: stats.regiao_maior_vendas
        ? `${formatCurrency(stats.regiao_maior_vendas.value)} em ${stats.regiao_maior_vendas.orders} pedidos`
        : 'sem vendas por regiao',
    },
  ], [formatCurrency, stats]);

  const totalPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
  const firstCardIndex = (currentPage - 1) * cardsPerPage;
  const visibleCards = cards.slice(firstCardIndex, firstCardIndex + cardsPerPage);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {visibleCards.map((card) => (
          <div key={card.label} className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-bold uppercase text-slate-500">{card.label}</span>
              {card.icon}
            </div>
            <div>
              <div className="line-clamp-2 break-words text-2xl font-extrabold text-slate-950 sm:text-3xl">{card.value}</div>
              <p className="mt-1 line-clamp-2 break-words text-[11px] font-medium uppercase text-slate-400">{card.helper}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/60 p-3 text-xs font-bold uppercase text-slate-600 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <span>Cards {firstCardIndex + 1}-{Math.min(firstCardIndex + cardsPerPage, cards.length)} de {cards.length}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="nexus-secondary-button px-3 py-2"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-orange-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="nexus-secondary-button px-3 py-2"
            >
              Proxima <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
