import { Download, Loader2, Trash2 } from 'lucide-react';
import type { QuoteItem } from './types';

interface QuoteCompositionPanelProps {
  discount: number;
  generatingPdf: boolean;
  items: QuoteItem[];
  observations: string;
  shippingValue: number;
  subtotal: number;
  totalBudget: number;
  formatCurrency: (value: number) => string;
  onDiscountChange: (value: number) => void;
  onObservationsChange: (value: string) => void;
  onRemoveItem: (index: number) => void;
  onShippingValueChange: (value: number) => void;
}

export function QuoteCompositionPanel({
  discount,
  formatCurrency,
  generatingPdf,
  items,
  observations,
  shippingValue,
  subtotal,
  totalBudget,
  onDiscountChange,
  onObservationsChange,
  onRemoveItem,
  onShippingValueChange,
}: QuoteCompositionPanelProps) {
  return (
    <div className="nexus-panel flex min-h-[400px] flex-col justify-between">
      <div>
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">Composição do Orçamento</h3>
            <p className="text-xs text-slate-500 mt-1">Itens adicionados para este orçamento</p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-orange-100 px-4 py-2 text-xs font-black text-orange-700">{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-xs font-bold uppercase text-white tracking-wider">
                <th className="px-4 py-3 sm:px-5">Código</th>
                <th className="px-4 py-3 sm:px-5">Descrição</th>
                <th className="px-4 py-3 text-center sm:px-5">Qtd</th>
                <th className="px-4 py-3 text-right sm:px-5">Unitário</th>
                <th className="px-4 py-3 text-right sm:px-5">Subtotal</th>
                <th className="px-4 py-3 text-center sm:px-5">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-slate-400">Nenhum item adicionado</div>
                      <p className="text-xs text-slate-500">Adicione produtos para começar o orçamento</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr 
                    key={item.product_id} 
                    className="transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-transparent group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 group-hover:text-slate-700 transition-colors sm:px-5 whitespace-nowrap">{item.codigo}</td>
                    <td className="px-4 py-3 uppercase font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors sm:px-5">
                      <span className="line-clamp-2 break-words">{item.descricao}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-slate-700 group-hover:text-slate-900 transition-colors sm:px-5">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 group-hover:text-slate-700 transition-colors sm:px-5">{formatCurrency(item.price_unit)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-bold text-slate-950 group-hover:text-orange-600 transition-colors sm:px-5">{formatCurrency(item.quantity * item.price_unit)}</td>
                    <td className="px-4 py-3 text-center sm:px-5">
                      <button 
                        type="button" 
                        onClick={() => onRemoveItem(index)} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-red-100 hover:text-red-600 transition-all duration-200 hover:scale-110"
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 space-y-5 border-t border-slate-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="discount" className="block text-xs font-black uppercase text-slate-700 tracking-wide">Desconto (R$)</label>
            <div className="relative">
              <input 
                id="discount"
                type="number" 
                min="0" 
                value={discount} 
                onChange={(event) => onDiscountChange(Number(event.target.value))} 
                className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-3 text-sm font-mono outline-none transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-slate-300" 
                placeholder="0,00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">R$</span>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="shipping" className="block text-xs font-black uppercase text-slate-700 tracking-wide">Valor do Frete (R$)</label>
            <div className="relative">
              <input 
                id="shipping"
                type="number" 
                min="0" 
                value={shippingValue} 
                onChange={(event) => onShippingValueChange(Number(event.target.value))} 
                className="w-full rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-3 text-sm font-mono outline-none transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-slate-300" 
                placeholder="0,00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-semibold">R$</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="observations" className="block text-xs font-black uppercase text-slate-700 tracking-wide">Observações Comerciais</label>
          <textarea
            id="observations"
            value={observations}
            onChange={(event) => onObservationsChange(event.target.value)}
            placeholder="Ex: Proposta válida por 10 dias..."
            className="h-20 w-full resize-none rounded-xl border-2 border-slate-200 bg-white/90 px-4 py-3 text-xs outline-none transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 hover:border-slate-300"
          />
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/80 via-white to-orange-50/30 shadow-lg shadow-orange-500/10">
          <div className="px-6 py-5 border-b border-orange-200/50 bg-gradient-to-r from-orange-500/8 to-transparent">
            <h4 className="text-xs font-black uppercase tracking-widest text-orange-900">Resumo do Orçamento</h4>
          </div>
          <div className="p-6">
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                <span className="text-xs font-semibold text-slate-600">Subtotal</span>
                <strong className="font-mono text-sm text-slate-950">{formatCurrency(subtotal)}</strong>
              </div>
              {Number(discount || 0) > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                  <span className="text-xs font-semibold text-slate-600">Desconto</span>
                  <strong className="font-mono text-sm text-red-600 font-bold">- {formatCurrency(Number(discount || 0))}</strong>
                </div>
              )}
              {Number(shippingValue || 0) > 0 && (
                <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                  <span className="text-xs font-semibold text-slate-600">Frete</span>
                  <strong className="font-mono text-sm text-slate-950">+ {formatCurrency(Number(shippingValue || 0))}</strong>
                </div>
              )}
            </div>
            <div className="space-y-2 pt-4 border-t border-orange-200">
              <p className="text-xs font-bold uppercase text-orange-700 tracking-wider">Total do Orçamento</p>
              <p className="break-words font-mono text-3xl font-black leading-tight text-orange-600 sm:text-4xl">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={generatingPdf || items.length === 0}
          className="w-full nexus-primary-button py-4 px-6 text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
        >
          {generatingPdf ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Gerando PDF...
            </>
          ) : (
            <>
              <Download size={18} /> Salvar & Emitir PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
