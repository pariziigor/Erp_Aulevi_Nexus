import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Activity, ArrowLeft, ArrowUpRight, FileText, History, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../context/useAuth';

interface DashboardStats {
  total_clientes: number;
  total_orcamentos: number;
  orcamentos_pendentes: number;
  orcamentos_aprovados: number;
  orcamentos_cancelados: number;
  taxa_conversao: number;
  valor_total_orcado_mes: number;
  valor_total_aprovado_mes: number;
  ticket_medio: number;
  categoria_maior_faturamento?: string | null;
  produtos_mais_orcados: Array<{
    codigo: string;
    descricao: string;
    quantidade: number;
  }>;
}

interface AuditLog {
  id: string;
  user_name?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_label?: string;
  changes?: Record<string, { old?: string | boolean | null; new?: string | boolean | null }>;
  created_at: string;
}

export const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [summaryResponse, logsResponse] = await Promise.all([
          api.get('/quotes/analytics/summary'),
          user?.role === 'ADM' ? api.get('/audit-logs?limit=20') : Promise.resolve({ data: [] }),
        ]);
        setStats(summaryResponse.data);
        setAuditLogs(logsResponse.data);
      } catch (err) {
        console.error('Erro ao processar metricas do dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user?.role]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(value || 0));
  };

  const formatDateTime = (value: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  };

  const describeAction = (action: string) => {
    const labels: Record<string, string> = {
      client_contact_updated: 'Contato do cliente atualizado',
      user_created: 'Usuario criado',
      user_permissions_updated: 'Permissao de usuario atualizada',
    };
    return labels[action] || action.replaceAll('_', ' ');
  };

  const describeChanges = (changes?: AuditLog['changes']) => {
    if (!changes) return 'Sem detalhes de campos.';
    const labels: Record<string, string> = {
      contato_email: 'e-mail',
      contato_whatsapp: 'WhatsApp',
      contato_telefone: 'telefone',
      role: 'permissao',
      is_active: 'status',
    };
    return Object.entries(changes)
      .map(([field, values]) => `${labels[field] || field}: ${values.old || '-'} -> ${values.new || '-'}`)
      .join(' | ');
  };

  const cardClass = 'flex h-36 flex-col justify-between rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl';
  const panelClass = 'rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <button onClick={onBack} className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase text-slate-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <div className="md:text-right">
          <p className="text-xs font-bold uppercase text-orange-600">Administrativo</p>
          <h2 className="text-2xl font-extrabold uppercase text-slate-950">Core Analytics</h2>
        </div>
      </div>

      {loading || !stats ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 py-12 text-center text-xs font-semibold uppercase text-slate-500 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          Consolidando métricas operacionais...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className={cardClass}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Orçado no mês</span>
                <TrendingUp className="text-orange-500" size={20} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-950">{formatCurrency(stats.valor_total_orcado_mes)}</div>
                <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">pipeline comercial real</p>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Clientes</span>
                <Users className="text-orange-500" size={20} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-950">{stats.total_clientes}</div>
                <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">base compartilhada</p>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Orçamentos</span>
                <FileText className="text-orange-500" size={20} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-950">{stats.total_orcamentos}</div>
                <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">emitidos no ERP</p>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold uppercase text-slate-500">Conversão</span>
                <Activity className="text-orange-500" size={20} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-950">{stats.taxa_conversao}%</div>
                <p className="mt-1 text-[11px] font-medium uppercase text-slate-400">aprovados sobre emitidos</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className={panelClass}>
              <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Funil Comercial</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <p className="flex justify-between gap-3">Pendentes <strong className="text-slate-950">{stats.orcamentos_pendentes}</strong></p>
                <p className="flex justify-between gap-3">Aprovados <strong className="text-emerald-600">{stats.orcamentos_aprovados}</strong></p>
                <p className="flex justify-between gap-3">Cancelados <strong className="text-red-600">{stats.orcamentos_cancelados}</strong></p>
                <p className="flex justify-between gap-3">Aprovado no mês <strong className="text-slate-950">{formatCurrency(stats.valor_total_aprovado_mes)}</strong></p>
                <p className="flex justify-between gap-3">Ticket médio <strong className="text-slate-950">{formatCurrency(stats.ticket_medio)}</strong></p>
              </div>
            </div>

            <div className={panelClass}>
              <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Categoria Líder</h3>
              <div className="text-4xl font-extrabold text-slate-950">{stats.categoria_maior_faturamento || '-'}</div>
              <p className="mt-2 text-xs font-medium uppercase text-slate-500">Maior faturamento nos itens orçados.</p>
            </div>

            <div className={panelClass}>
              <h3 className="mb-4 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">Produtos Mais Orçados</h3>
              <div className="space-y-3 text-xs text-slate-600">
                {stats.produtos_mais_orcados.length === 0 ? (
                  <p className="uppercase text-slate-500">Sem itens orçados ainda.</p>
                ) : (
                  stats.produtos_mais_orcados.map((product) => (
                    <p key={product.codigo} className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2">
                      <ArrowUpRight className="text-orange-500" size={14} /> <strong>{product.codigo}</strong> {product.quantidade} un.
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {user?.role === 'ADM' && (
            <div className={panelClass}>
              <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">
                <History className="text-orange-500" size={16} /> Logs de Auditoria
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200/70">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900 text-xs font-bold uppercase text-white">
                      <th className="p-3 w-36">Data/Hora</th>
                      <th className="p-3 w-48">Usuário</th>
                      <th className="p-3 w-56">Ação</th>
                      <th className="p-3">Registro</th>
                      <th className="p-3">Alterações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center font-semibold uppercase text-slate-500">Nenhuma edição registrada.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="transition hover:bg-orange-50/50">
                          <td className="p-3 font-mono">{formatDateTime(log.created_at)}</td>
                          <td className="p-3">
                            <div className="font-bold uppercase text-slate-900">{log.user_name || 'Sistema'}</div>
                            <div className="font-mono text-slate-500">{log.user_email}</div>
                          </td>
                          <td className="p-3 font-bold uppercase text-slate-700">{describeAction(log.action)}</td>
                          <td className="p-3 uppercase text-slate-600">{log.entity_label || log.entity_type}</td>
                          <td className="p-3 font-mono text-slate-600">{describeChanges(log.changes)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
