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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b-2 border-black pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:underline">
          <ArrowLeft size={16} /> Voltar ao Menu
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Core Analytics</h2>
      </div>

      {loading || !stats ? (
        <div className="text-xs font-mono uppercase text-center py-12">Consolidando metricas operacionais...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black uppercase text-gray-500 tracking-wider">Orcado no Mes</span>
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight">{formatCurrency(stats.valor_total_orcado_mes)}</div>
                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">// pipeline comercial real</p>
              </div>
            </div>

            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black uppercase text-gray-500 tracking-wider">Clientes</span>
                <Users size={20} />
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight">{stats.total_clientes}</div>
                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">// base compartilhada</p>
              </div>
            </div>

            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black uppercase text-gray-500 tracking-wider">Orcamentos</span>
                <FileText size={20} />
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight">{stats.total_orcamentos}</div>
                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">// emitidos no ERP</p>
              </div>
            </div>

            <div className="border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black uppercase text-gray-500 tracking-wider">Conversao</span>
                <Activity size={20} />
              </div>
              <div>
                <div className="text-3xl font-black font-mono tracking-tight">{stats.taxa_conversao}%</div>
                <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">// aprovados sobre emitidos</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Funil Comercial</h3>
              <div className="font-mono text-xs space-y-2">
                <p>Pendentes: <strong>{stats.orcamentos_pendentes}</strong></p>
                <p>Aprovados: <strong>{stats.orcamentos_aprovados}</strong></p>
                <p>Cancelados: <strong>{stats.orcamentos_cancelados}</strong></p>
                <p>Aprovado no mes: <strong>{formatCurrency(stats.valor_total_aprovado_mes)}</strong></p>
                <p>Ticket medio: <strong>{formatCurrency(stats.ticket_medio)}</strong></p>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Categoria Lider</h3>
              <div className="text-4xl font-black font-mono">{stats.categoria_maior_faturamento || '-'}</div>
              <p className="text-xs font-mono text-gray-500 uppercase mt-2">Maior faturamento nos itens orcados.</p>
            </div>

            <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4">Produtos Mais Orcados</h3>
              <div className="font-mono text-xs space-y-2">
                {stats.produtos_mais_orcados.length === 0 ? (
                  <p className="text-gray-500 uppercase">Sem itens orcados ainda.</p>
                ) : (
                  stats.produtos_mais_orcados.map((product) => (
                    <p key={product.codigo} className="flex items-center gap-2">
                      <ArrowUpRight size={14} /> <strong>{product.codigo}</strong> {product.quantidade} un.
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {user?.role === 'ADM' && (
            <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
                <History size={16} /> Logs de Auditoria
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white text-xs font-black uppercase tracking-wider">
                      <th className="p-3 w-36">Data/Hora</th>
                      <th className="p-3 w-48">Usuario</th>
                      <th className="p-3 w-56">Acao</th>
                      <th className="p-3">Registro</th>
                      <th className="p-3">Alteracoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black text-xs">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center font-mono text-gray-500 uppercase">Nenhuma edicao registrada.</td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono">{formatDateTime(log.created_at)}</td>
                          <td className="p-3">
                            <div className="font-bold uppercase">{log.user_name || 'Sistema'}</div>
                            <div className="font-mono text-gray-500">{log.user_email}</div>
                          </td>
                          <td className="p-3 font-bold uppercase">{describeAction(log.action)}</td>
                          <td className="p-3 uppercase">{log.entity_label || log.entity_type}</td>
                          <td className="p-3 font-mono">{describeChanges(log.changes)}</td>
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
