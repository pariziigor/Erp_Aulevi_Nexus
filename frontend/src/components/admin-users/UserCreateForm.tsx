import { UserPlus } from 'lucide-react';
import type React from 'react';
import { LoadingButton } from '../shared/FormComponents';
import { PasswordInput } from '../shared/PasswordInput';
import type { SystemUser } from './types';

interface UserCreateFormProps {
  email: string;
  name: string;
  password: string;
  role: SystemUser['role'];
  saving: boolean;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRoleChange: (value: SystemUser['role']) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function UserCreateForm({
  email,
  name,
  password,
  role,
  saving,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
}: UserCreateFormProps) {
  return (
    <form onSubmit={onSubmit} className="nexus-panel space-y-5 lg:col-span-1">
      <h3 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">
        <UserPlus size={16} /> Novo Usuário
      </h3>
      <div>
        <label className="block text-xs font-black uppercase mb-2">Nome</label>
        <input required value={name} onChange={(event) => onNameChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-black uppercase mb-2">E-mail</label>
        <input required type="email" value={email} onChange={(event) => onEmailChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs font-black uppercase mb-2">Senha Temporaria</label>
        <PasswordInput
          value={password}
          onChange={onPasswordChange}
          minLength={6}
	          className="border-slate-200 bg-white/80 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase mb-2">Nível de Permissão</label>
	        <select value={role} onChange={(event) => onRoleChange(event.target.value as SystemUser['role'])} className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-black uppercase focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10">
          <option value="SELLER">Vendedor</option>
          <option value="ADM">Administrador</option>
        </select>
      </div>
      <LoadingButton isLoading={saving} loadingText="Criando acesso..." type="submit" className="w-full py-3">
        Criar Acesso
      </LoadingButton>
    </form>
  );
}
