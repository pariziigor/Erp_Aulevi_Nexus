import { FileText, TrendingUp } from 'lucide-react';
import type { SellerSummary } from './types';

interface SellerSummaryCardsProps {
  summary: SellerSummary;
  formatCurrency: (value: number) => string;
}

export function SellerSummaryCards({ summary, formatCurrency }: SellerSummaryCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="nexus-surface flex min-h-32 flex-col justify-between p-5">
          <div className="flex justify-between text-xs font-black uppercase text-gray-500">
            <span>Total Emitido</span>
            <FileText size={18} />
          </div>
          <div className="text-3xl font-black font-mono">{summary.total_orcamentos}</div>
        </div>
        <div className="nexus-surface flex min-h-32 flex-col justify-between p-5">
          <div className="flex justify-between text-xs font-black uppercase text-gray-500">
            <span>Pipeline</span>
            <TrendingUp size={18} />
          </div>
	          <div className="break-words font-mono text-2xl font-black">{formatCurrency(summary.valor_total_orcado)}</div>
        </div>
        <div className="nexus-surface flex min-h-32 flex-col justify-between p-5">
          <div className="text-xs font-black uppercase text-gray-500">Aprovado</div>
	          <div className="break-words font-mono text-2xl font-black">{formatCurrency(summary.valor_total_aprovado)}</div>
        </div>
        <div className="nexus-surface flex min-h-32 flex-col justify-between p-5">
          <div className="text-xs font-black uppercase text-gray-500">Conversão</div>
          <div className="text-3xl font-black font-mono">{summary.taxa_conversao}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs font-mono uppercase sm:grid-cols-2 xl:grid-cols-4">
        <div className="nexus-surface p-4">Pendentes: <strong>{summary.orcamentos_pendentes}</strong></div>
        <div className="nexus-surface p-4">Aprovados: <strong>{summary.orcamentos_aprovados}</strong></div>
        <div className="nexus-surface p-4">Cancelados: <strong>{summary.orcamentos_cancelados}</strong></div>
        <div className="nexus-surface p-4">Ticket médio: <strong>{formatCurrency(summary.ticket_medio)}</strong></div>
      </div>
    </>
  );
}
