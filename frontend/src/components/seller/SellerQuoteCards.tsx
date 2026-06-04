import { CalendarDays, Eye } from 'lucide-react';
import type { SellerQuote } from './types';

interface SellerQuoteCardsProps {
  quotes: SellerQuote[];
  formatCurrency: (value: number) => string;
  formatDate: (value?: string) => string;
  statusClass: (status: string) => string;
  statusLabel: (status: string) => string;
  onSelectQuote: (quote: SellerQuote) => void;
}

export function SellerQuoteCards({
  quotes,
  formatCurrency,
  formatDate,
  statusClass,
  statusLabel,
  onSelectQuote,
}: SellerQuoteCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {quotes.length === 0 ? (
        <div className="nexus-panel md:col-span-2 xl:col-span-3 p-8 text-center text-xs font-semibold uppercase text-slate-500">
          Nenhum orçamento encontrado.
        </div>
      ) : (
        quotes.map((quote) => (
	          <button
	            key={quote.id}
	            type="button"
	            onClick={() => onSelectQuote(quote)}
	            className="nexus-surface flex min-h-56 flex-col justify-between p-5 text-left transition-all hover:-translate-y-1 hover:border-orange-300/60 hover:bg-white/90 hover:shadow-2xl hover:shadow-orange-500/10"
	          >
	            <div className="space-y-4">
	              <div className="flex items-start justify-between gap-3">
	                <div className="min-w-0">
	                  <div className="break-words font-mono text-lg font-black">{quote.numero_orcamento}</div>
	                  <div className="mt-1 line-clamp-2 break-words text-xs font-bold uppercase text-gray-500">{quote.client_name || 'Cliente sem nome'}</div>
	                </div>
	                <span className={`shrink-0 rounded-full border border-slate-200 px-2 py-1 text-[10px] font-black uppercase ${statusClass(quote.status)}`}>
	                  {statusLabel(quote.status)}
	                </span>
	              </div>
	              <div className="break-words font-mono text-2xl font-black text-slate-950">{formatCurrency(quote.total)}</div>
	            </div>
	            <div className="mt-5 flex flex-col gap-2 border-t border-gray-300 pt-3 text-xs font-mono uppercase text-gray-500 sm:flex-row sm:items-center sm:justify-between">
	              <span className="flex items-center gap-1"><CalendarDays size={14} /> {formatDate(quote.created_at)}</span>
	              <span className="flex items-center gap-1 text-orange-600"><Eye size={14} /> Detalhes</span>
	            </div>
	          </button>
        ))
      )}
    </div>
  );
}
