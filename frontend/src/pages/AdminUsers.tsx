import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Loader2, Save, Shield, UserPlus, Users } from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'ADM' | 'SELLER';
  is_active: boolean;
}

export const AdminUsers: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADM' | 'SELLER'>('SELLER');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await api.get('/auth/users');
      setUsersList(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuarios.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/auth/users', {
        name,
        email,
        password,
        role,
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('SELLER');
      setMessage('Usuario criado com sucesso e registrado no log de auditoria.');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateUser(user: SystemUser, payload: Partial<Pick<SystemUser, 'role' | 'is_active'>>) {
    setUpdatingUserId(user.id);
    setError(null);
    setMessage(null);

    try {
      await api.patch(`/auth/users/${user.id}`, payload);
      setMessage('Permissao do usuario atualizada e registrada no log de auditoria.');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuario.');
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Administracao de Usuarios</h2>
        <div className="nexus-badge">
          <Shield size={14} /> Acesso ADM
        </div>
      </div>

      {error && (
        <div className="nexus-alert-error">
          [ERRO]: {error}
        </div>
      )}

      {message && (
        <div className="nexus-alert-success">
          [OK]: {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreateUser} className="nexus-panel space-y-5 lg:col-span-1">
          <h3 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">
            <UserPlus size={16} /> Novo Usuario
          </h3>
          <div>
            <label className="block text-xs font-black uppercase mb-2">Nome</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-2">E-mail</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-2">Senha Inicial</label>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-2">Nivel de Permissao</label>
            <select value={role} onChange={(e) => setRole(e.target.value as 'ADM' | 'SELLER')} className="w-full border-2 border-black p-2 text-sm bg-white font-black uppercase focus:outline-none">
              <option value="SELLER">Vendedor</option>
              <option value="ADM">Administrador</option>
            </select>
          </div>
          <button disabled={saving} type="submit" className="nexus-primary-button w-full py-3">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Criar Acesso
          </button>
        </form>

        <div className="lg:col-span-2 space-y-6">
          <div className="nexus-table-wrap">
            <table className="w-full text-left">
              <thead>
                <tr className="nexus-table-head">
                  <th className="p-3">Usuario</th>
                  <th className="p-3 w-40">Permissao</th>
                  <th className="p-3 w-32">Status</th>
                  <th className="p-3 w-44 text-center">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center font-mono text-xs uppercase text-gray-500">Carregando usuarios...</td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center font-mono text-xs uppercase text-gray-500">Nenhum usuario cadastrado.</td>
                  </tr>
                ) : (
                  usersList.map((systemUser) => (
                    <tr key={systemUser.id} className="transition hover:bg-orange-50/50">
                      <td className="p-3">
                        <div className="font-bold uppercase">{systemUser.name}</div>
                        <div className="font-mono text-xs text-gray-500">{systemUser.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={systemUser.role}
                          disabled={updatingUserId === systemUser.id}
                          onChange={(e) => handleUpdateUser(systemUser, { role: e.target.value as 'ADM' | 'SELLER' })}
                          className="w-full border-2 border-black p-2 text-xs bg-white font-black uppercase focus:outline-none disabled:opacity-50"
                        >
                          <option value="SELLER">Vendedor</option>
                          <option value="ADM">Administrador</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className={`rounded-full border px-2 py-1 text-xs font-bold uppercase ${systemUser.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                          {systemUser.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          disabled={updatingUserId === systemUser.id}
                          type="button"
                          onClick={() => handleUpdateUser(systemUser, { is_active: !systemUser.is_active })}
                          className="nexus-secondary-button px-3 py-2"
                        >
                          {systemUser.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="nexus-panel p-5">
            <h3 className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">
              <Users size={16} /> Recomendacoes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono uppercase text-gray-600">
              <p>Use ADM apenas para quem gerencia usuarios, catalogo e indicadores.</p>
              <p>Use Vendedor para operacao comercial diaria e emissao de propostas.</p>
              <p>Desative acessos imediatamente em desligamentos ou mudancas de funcao.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
