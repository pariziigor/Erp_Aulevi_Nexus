import type { SystemUser } from './types';
import { SkeletonRow } from '../shared/Skeleton';

interface UsersTableProps {
  loading: boolean;
  updatingUserId: string | null;
  users: SystemUser[];
  onResetPassword: (user: SystemUser) => void;
  onUpdateUser: (user: SystemUser, payload: Partial<Pick<SystemUser, 'role' | 'is_active'>>) => void;
}

export function UsersTable({ loading, updatingUserId, users, onResetPassword, onUpdateUser }: UsersTableProps) {
  return (
    <div className="nexus-table-wrap">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="nexus-table-head">
            <th className="p-3">Usuário</th>
            <th className="w-40 p-3">Permissão</th>
            <th className="w-44 p-3">Status</th>
            <th className="w-44 p-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <SkeletonRow key={index} columns={3} actionColumn />
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center font-mono text-xs uppercase text-gray-500">
                Nenhum usuário cadastrado.
              </td>
            </tr>
          ) : (
            users.map((systemUser) => (
              <tr key={systemUser.id} className="row-fade transition hover:bg-orange-50/50">
                <td className="p-3">
	                  <div className="line-clamp-2 break-words font-bold uppercase">{systemUser.name}</div>
	                  <div className="break-all font-mono text-xs text-gray-500">{systemUser.email}</div>
                </td>
                <td className="p-3">
                  <select
                    value={systemUser.role}
                    disabled={updatingUserId === systemUser.id}
                    onChange={(event) => onUpdateUser(systemUser, { role: event.target.value as SystemUser['role'] })}
	                    className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 text-xs font-black uppercase focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 disabled:opacity-50"
                  >
                    <option value="SELLER">Vendedor</option>
                    <option value="ADM">Administrador</option>
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex flex-col items-start gap-2">
                    <span className={`rounded-full border px-2 py-1 text-xs font-bold uppercase ${systemUser.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {systemUser.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    {systemUser.must_change_password && (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-bold uppercase text-orange-700">
                        Senha temporaria
                      </span>
                    )}
                    {systemUser.password_reset_requested_at && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold uppercase text-amber-700">
                        Reset solicitado
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
	                  <div className="flex flex-col gap-2 sm:min-w-36">
                    <button
                      disabled={updatingUserId === systemUser.id}
                      type="button"
                      onClick={() => onResetPassword(systemUser)}
                      className="nexus-secondary-button px-3 py-2"
                    >
                      Redefinir senha
                    </button>
                  <button
                    disabled={updatingUserId === systemUser.id}
                    type="button"
                    onClick={() => onUpdateUser(systemUser, { is_active: !systemUser.is_active })}
                    className="nexus-secondary-button px-3 py-2"
                  >
                    {systemUser.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
