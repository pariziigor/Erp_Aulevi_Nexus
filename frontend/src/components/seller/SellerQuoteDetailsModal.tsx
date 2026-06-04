import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building2, CalendarDays, Download, FileText, Loader2, MapPin, Package, X } from 'lucide-react';
import type { SellerQuote } from './types';

interface SellerQuoteDetailsModalProps {
  downloadingQuoteId: string | null;
  quote: SellerQuote;
  formatCurrency: (value: number) => string;
  formatDate: (value?: string) => string;
  statusLabel: (status: string) => string;
  onClose: () => void;
  onDownloadPdf: (quote: SellerQuote) => void;
}

function statusTone(status: string) {
  if (status.includes('APROVADO') || status.includes('CONVERTIDO')) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }
  if (status.includes('CANCELADO') || status.includes('EXPIRADO')) {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  if (status.includes('PENDENTE')) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export function SellerQuoteDetailsModal({
  downloadingQuoteId,
  quote,
  formatCurrency,
  formatDate,
  statusLabel,
  onClose,
  onDownloadPdf,
}: SellerQuoteDetailsModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

	return createPortal(
		<div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5">
			<button
				type="button"
				aria-label="Fechar detalhes"
				onClick={onClose}
				className="no-hover-lift absolute inset-0 cursor-default bg-white/80 backdrop-blur-[30px] backdrop-saturate-50"
			/>

				<section className="modal-slide-up relative z-[201] flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl">
					<header className="relative shrink-0 overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-orange-50/50 to-slate-50/80 px-5 py-6 sm:px-7">
					<div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-transparent pointer-events-none" />
					<div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full bg-orange-300/15 blur-3xl md:block" />
					<div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
						<div className="min-w-0 space-y-5">
							<div className="flex flex-wrap items-center gap-2">
								<span className={`badge-pop-in rounded-full border-2 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ${statusTone(quote.status)}`}>
									{statusLabel(quote.status)}
								</span>
                <span className="fade-in-delay rounded-full border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 px-4 py-1.5 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                  {quote.items.length} {quote.items.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <div>
                <h3 className="font-mono text-3xl font-black text-slate-950 sm:text-4xl tracking-tight leading-tight">{quote.numero_orcamento}</h3>
                <div className="mt-3 flex flex-col gap-2 text-xs font-semibold uppercase text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
                  <span className="inline-flex items-center gap-2 hover:text-orange-600 transition-colors">
                    <Building2 size={15} className="text-orange-500" /> {quote.client_name || 'Cliente sem nome'}
                  </span>
                  <span className="inline-flex items-center gap-2 hover:text-orange-600 transition-colors">
                    <MapPin size={15} className="text-orange-500" /> {quote.client_city || '-'} / {quote.client_uf || '-'}
                  </span>
                  <span className="inline-flex items-center gap-2 hover:text-orange-600 transition-colors">
                    <CalendarDays size={15} className="text-orange-500" /> {formatDate(quote.created_at)}
									</span>
								</div>
							</div>
						</div>

						<div className="flex shrink-0 flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={() => onDownloadPdf(quote)}
								disabled={downloadingQuoteId === quote.id}
								className="nexus-primary-button px-5"
							>
								{downloadingQuoteId === quote.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
								PDF
							</button>
							<button type="button" onClick={onClose} className="nexus-secondary-button px-4">
								<X size={16} /> Fechar
							</button>
						</div>
					</div>
				</header>

	        <div className="min-h-0 space-y-6 overflow-y-auto p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-4 text-xs uppercase md:grid-cols-3">
            <div className="group fade-in-delay rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-md transition-all hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10">
              <span className="block text-slate-500 font-semibold mb-2">Pagamento</span>
              <strong className="block text-sm text-slate-950 font-bold group-hover:text-orange-600 transition-colors">{quote.payment_condition || 'A definir'}</strong>
            </div>
            <div className="group fade-in-delay rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-md transition-all hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10">
              <span className="block text-slate-500 font-semibold mb-2">Frete</span>
              <strong className="block text-sm text-slate-950 font-bold group-hover:text-orange-600 transition-colors">{quote.shipping_type || 'A definir'}</strong>
            </div>
            <div className="group fade-in-delay rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-md transition-all hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10">
              <span className="block text-slate-500 font-semibold mb-2">CNPJ</span>
              <strong className="block font-mono text-sm text-slate-950 font-bold group-hover:text-orange-600 transition-colors">{quote.client_cnpj || '-'}</strong>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/8">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 px-5 py-5 sm:px-7">
              <Package size={20} className="text-orange-500" />
              <h4 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">Itens do Orçamento</h4>
              <span className="ml-auto inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{quote.items.length} itens</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="bg-slate-950 text-xs font-bold uppercase text-white tracking-wider">
                    <th className="px-5 py-4 sm:px-6">Código</th>
                    <th className="px-5 py-4 sm:px-6">Descrição</th>
                    <th className="px-5 py-4 text-center sm:px-6">Qtd</th>
                    <th className="px-5 py-4 text-right sm:px-6">Unitário</th>
                    <th className="px-5 py-4 text-right sm:px-6">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {quote.items.map((item, idx) => (
                    <tr key={item.id} className="row-fade group transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50/60 hover:to-orange-50/30 hover:shadow-inner" style={{ animationDelay: `${idx * 50}ms` }}>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600 group-hover:text-slate-700 transition-colors sm:px-6">{item.codigo}</td>
                      <td className="px-5 py-4 text-xs font-bold uppercase text-slate-900 group-hover:text-orange-600 transition-colors sm:px-6">{item.descricao}</td>
                      <td className="px-5 py-4 text-center font-mono text-slate-700 group-hover:text-slate-900 transition-colors sm:px-6">{item.quantidade}</td>
                      <td className="px-5 py-4 text-right font-mono text-xs text-slate-600 group-hover:text-slate-700 transition-colors sm:px-6">{formatCurrency(item.preco_unitario)}</td>
                      <td className="px-5 py-4 text-right font-mono text-sm font-black text-slate-950 group-hover:text-orange-600 transition-colors sm:px-6">{formatCurrency(item.total_item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
            <div className="fade-in-delay rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase text-slate-700">
                <FileText size={18} className="text-orange-500" /> Observações Comerciais
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-line">
                {quote.observations || 'Sem observações comerciais.'}
              </p>
            </div>

            <div className="fade-in-delay overflow-hidden rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 shadow-2xl shadow-orange-500/15">
              <div className="bg-gradient-to-r from-orange-500/10 to-transparent px-6 py-5 border-b border-orange-200/50">
                <h4 className="text-xs font-black uppercase tracking-wider text-orange-900">Resumo Financeiro</h4>
              </div>
              <div className="space-y-4 p-6 text-xs uppercase">
                <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                  <span className="text-slate-600 font-semibold">Subtotal</span>
                  <strong className="font-mono text-slate-950 text-sm">{formatCurrency(quote.subtotal)}</strong>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-orange-100">
                  <span className="text-slate-600 font-semibold">Desconto</span>
                  <strong className="font-mono text-red-600 text-sm font-bold">- {formatCurrency(quote.desconto)}</strong>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-orange-200">
                  <span className="text-slate-600 font-semibold">Frete</span>
                  <strong className="font-mono text-slate-950 text-sm">+ {formatCurrency(quote.valor_frete)}</strong>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <span className="font-extrabold text-orange-700 text-xs">Total do Orçamento</span>
                  <strong className="break-words font-mono text-3xl font-black text-orange-600 leading-tight">{formatCurrency(quote.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
