import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Activity, ArrowLeft, ArrowUpRight, FileText, TrendingUp, Users } from 'lucide-react';

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

export const Dashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await api.get('/quotes/analytics/summary');
        setStats(response.data);
      } catch (err) {
        console.error('Erro ao processar metricas do dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(value || 0));
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
        </>
      )}
    </div>
  );
};
