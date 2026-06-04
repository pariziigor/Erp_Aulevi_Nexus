import { Edit3 } from 'lucide-react';
import type { Client } from './types';

interface ClientsTableProps {
  clients: Client[];
  loading: boolean;
  onEditClient: (client: Client) => void;
}

export function ClientsTable({ clients, loading, onEditClient }: ClientsTableProps) {
  if (loading) {
    return <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Sincronizando registros da nuvem...</div>;
  }

  return (
    <div className="nexus-table-wrap nexus-table-scroll">
      <table className="w-full min-w-[880px] text-left">
        <thead>
          <tr className="nexus-table-head">
            <th className="p-3">CNPJ</th>
            <th className="p-3">Razão Social</th>
            <th className="p-3">Localização</th>
            <th className="p-3">Contato</th>
            <th className="p-3">E-mail</th>
            <th className="p-3">WhatsApp</th>
            <th className="p-3 w-20 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {clients.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center font-mono text-xs text-gray-500 uppercase">Nenhum cliente encontrado para os filtros.</td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id} className="transition-colors hover:bg-orange-50/50">
                <td className="p-3 font-mono text-xs whitespace-nowrap">{client.cnpj}</td>
                <td className="max-w-[280px] p-3 font-bold uppercase">
                  <span className="line-clamp-2 break-words">{client.razao_social}</span>
                </td>
                <td className="p-3 text-xs uppercase font-medium">{client.cidade} / {client.uf}</td>
                <td className="max-w-[180px] p-3 text-xs">
                  <span className="line-clamp-2 break-words">{client.contato_nome || '-'}</span>
                </td>
                <td className="max-w-[220px] p-3 text-xs">
                  <span className="line-clamp-2 break-all">{client.contato_email || '-'}</span>
                </td>
                <td className="p-3 font-mono text-xs whitespace-nowrap">{client.contato_whatsapp || '-'}</td>
                <td className="p-3 text-center">
                  <button
                    type="button"
                    onClick={() => onEditClient(client)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                    title="Editar contato"
                  >
                    <Edit3 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
