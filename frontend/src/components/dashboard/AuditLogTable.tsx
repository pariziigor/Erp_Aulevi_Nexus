import { History } from 'lucide-react';
import type { AuditLog } from './types';

interface AuditLogTableProps {
  logs: AuditLog[];
  describeAction: (action: string) => string;
  describeChanges: (changes?: AuditLog['changes']) => string;
  formatDateTime: (value: string) => string;
}

export function AuditLogTable({ logs, describeAction, describeChanges, formatDateTime }: AuditLogTableProps) {
  const panelClass = 'rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

  return (
    <div className={panelClass}>
      <h3 className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">
        <History className="text-orange-500" size={16} /> Logs de Auditoria
      </h3>
	      <div className="nexus-table-scroll overflow-x-auto rounded-2xl border border-slate-200/70">
	        <table className="w-full min-w-[980px] text-left">
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
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center font-semibold uppercase text-slate-500">Nenhuma edição registrada.</td>
              </tr>
            ) : (
              logs.map((log) => (
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
  );
}
