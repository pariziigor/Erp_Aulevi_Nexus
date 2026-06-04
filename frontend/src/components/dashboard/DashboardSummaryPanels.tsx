import { useState } from 'react';
import { ArrowUpRight, Clock, MapPin, Medal, Package } from 'lucide-react';
import type { DashboardStats } from './types';

interface DashboardSummaryPanelsProps {
  stats: DashboardStats;
  formatCurrency: (value: number) => string;
}

function formatConversionTime(hours: number) {
  if (!hours) return 'Sem pedidos convertidos';
  if (hours < 24) return `${hours.toFixed(1)} horas`;
  const days = hours / 24;
  return `${days.toFixed(1)} dias`;
}

export function DashboardSummaryPanels({ stats, formatCurrency }: DashboardSummaryPanelsProps) {
  const [activeTab, setActiveTab] = useState<'regions' | 'sellers' | 'products'>('regions');
  const panelClass = 'rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl';
  const maxRegionValue = Math.max(...stats.regioes_clientes_vendas.map((region) => Number(region.value || 0)), 1);
  const maxSellerValue = Math.max(...stats.ranking_vendedores.map((seller) => Number(seller.value || 0)), 1);
  const tabs = [
    { id: 'regions' as const, label: 'Regioes', icon: MapPin },
    { id: 'sellers' as const, label: 'Vendedores', icon: Medal },
    { id: 'products' as const, label: 'Produtos', icon: Package },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className={panelClass}>
          <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Funil Comercial</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="flex justify-between gap-3">Pendentes <strong className="text-slate-950">{stats.orcamentos_pendentes}</strong></p>
            <p className="flex justify-between gap-3">Aprovados <strong className="text-emerald-600">{stats.orcamentos_aprovados}</strong></p>
            <p className="flex justify-between gap-3">Cancelados <strong className="text-red-600">{stats.orcamentos_cancelados}</strong></p>
            <p className="flex justify-between gap-3">Aprovado no mes <strong className="text-slate-950">{formatCurrency(stats.valor_total_aprovado_mes)}</strong></p>
            <p className="flex justify-between gap-3">Ticket medio <strong className="text-slate-950">{formatCurrency(stats.ticket_medio)}</strong></p>
          </div>
        </div>

        <div className={panelClass}>
          <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Categoria Lider</h3>
          <div className="break-words text-4xl font-extrabold text-slate-950">{stats.categoria_maior_faturamento || '-'}</div>
          <p className="mt-2 text-xs font-medium uppercase text-slate-500">Maior faturamento nos itens orcados.</p>
        </div>

        <div className={panelClass}>
          <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">
            <Clock className="text-orange-500" size={16} /> Tempo Medio de Conversao
          </h3>
          <div className="text-4xl font-extrabold text-slate-950">
            {formatConversionTime(Number(stats.tempo_medio_conversao_horas || 0))}
          </div>
          <p className="mt-2 text-xs font-medium uppercase text-slate-500">Media entre emissao e conversao em pedido.</p>
        </div>
      </div>

      <div className={panelClass}>
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-900">Analises Detalhadas</h3>
            <p className="mt-1 text-xs font-medium uppercase text-slate-500">Navegue por bloco para reduzir rolagem.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white/65 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`no-hover-lift inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-extrabold uppercase transition ${
                    active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[48vh] overflow-y-auto pr-1">
          {activeTab === 'regions' && (
            <div className="space-y-3">
              {stats.regioes_clientes_vendas.length === 0 ? (
                <p className="text-xs font-semibold uppercase text-slate-500">Sem dados regionais ainda.</p>
              ) : (
                stats.regioes_clientes_vendas.map((region) => {
                  const width = Math.max(8, (Number(region.value || 0) / maxRegionValue) * 100);
                  return (
                    <div key={region.region} className="rounded-2xl border border-slate-200 bg-white/65 p-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs uppercase">
                        <strong className="text-slate-950">{region.region}</strong>
                        <span className="font-mono text-slate-500">
                          {region.clients} clientes | {region.orders} pedidos
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300" style={{ width: `${width}%` }} />
                      </div>
                      <div className="mt-2 text-right font-mono text-xs font-black text-orange-600">{formatCurrency(region.value)}</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'sellers' && (
            <div className="space-y-3">
              {stats.ranking_vendedores.length === 0 ? (
                <p className="text-xs font-semibold uppercase text-slate-500">Sem vendas aprovadas ainda.</p>
              ) : (
                stats.ranking_vendedores.map((seller, index) => {
                  const width = Math.max(8, (Number(seller.value || 0) / maxSellerValue) * 100);
                  return (
                    <div key={`${seller.email}-${index}`} className="rounded-2xl border border-slate-200 bg-white/65 p-3">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-black uppercase text-slate-950">#{index + 1} {seller.name}</div>
                          <div className="break-all font-mono text-[11px] text-slate-500">{seller.email}</div>
                        </div>
                        <span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-bold uppercase text-orange-700">
                          {seller.orders} pedidos
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-slate-900 to-orange-500" style={{ width: `${width}%` }} />
                      </div>
                      <div className="mt-2 text-right font-mono text-xs font-black text-slate-950">{formatCurrency(seller.value)}</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="grid grid-cols-1 gap-3 text-xs text-slate-600 md:grid-cols-2 xl:grid-cols-5">
              {stats.produtos_mais_orcados.length === 0 ? (
                <p className="uppercase text-slate-500">Sem itens orcados ainda.</p>
              ) : (
                stats.produtos_mais_orcados.map((product) => (
                  <p key={product.codigo} className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
                    <ArrowUpRight className="shrink-0 text-orange-500" size={14} /> <strong>{product.codigo}</strong> {product.quantidade} un.
                  </p>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
