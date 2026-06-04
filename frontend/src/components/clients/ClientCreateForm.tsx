import { Loader2 } from 'lucide-react';
import type React from 'react';
import type { ClientFormState } from './types';

interface ClientCreateFormProps {
  form: ClientFormState;
  loadingCnpj: boolean;
  onChange: (field: keyof ClientFormState, value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onSearchCnpj: () => void;
}

export function ClientCreateForm({ form, loadingCnpj, onChange, onSearchCnpj, onSubmit }: ClientCreateFormProps) {
  return (
    <form onSubmit={onSubmit} className="nexus-panel space-y-6 p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-black uppercase mb-2">CNPJ</label>
	          <div className="flex flex-col gap-2 sm:flex-row">
	            <input type="text" value={form.cnpj} onChange={(event) => onChange('cnpj', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="00000000000000" />
	            <button type="button" onClick={onSearchCnpj} disabled={loadingCnpj} className="nexus-secondary-button px-4 sm:w-auto">
	              {loadingCnpj ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
	            </button>
	          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-black uppercase mb-2">Razão Social</label>
          <input type="text" required value={form.razaoSocial} onChange={(event) => onChange('razaoSocial', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-black uppercase mb-2">Nome Fantasia</label>
          <input type="text" value={form.nomeFantasia} onChange={(event) => onChange('nomeFantasia', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">Situação Cadastral</label>
          <input type="text" value={form.situacaoCadastral} onChange={(event) => onChange('situacaoCadastral', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none bg-gray-50" />
        </div>
      </div>

	      <div className="grid grid-cols-1 gap-4 border-t border-slate-200/70 pt-5 sm:grid-cols-2 md:grid-cols-4">
	        <div className="sm:col-span-2 md:col-span-2">
          <label className="block text-xs font-black uppercase mb-2">Endereço</label>
          <input type="text" value={form.endereco} onChange={(event) => onChange('endereco', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">Número</label>
          <input type="text" value={form.numero} onChange={(event) => onChange('numero', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">Bairro</label>
          <input type="text" value={form.bairro} onChange={(event) => onChange('bairro', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
	        <div className="sm:col-span-2 md:col-span-2">
          <label className="block text-xs font-black uppercase mb-2">Cidade</label>
          <input type="text" value={form.cidade} onChange={(event) => onChange('cidade', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">UF</label>
          <input type="text" value={form.uf} onChange={(event) => onChange('uf', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">CEP</label>
          <input type="text" value={form.cep} onChange={(event) => onChange('cep', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-slate-200/70 pt-5 md:grid-cols-4">
        <div>
          <label className="block text-xs font-black uppercase mb-2">Nome do Contato</label>
          <input type="text" required value={form.contatoNome} onChange={(event) => onChange('contatoNome', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="Ex: Diretor de Compras" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">E-mail</label>
          <input type="email" required value={form.contatoEmail} onChange={(event) => onChange('contatoEmail', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">WhatsApp</label>
          <input type="text" required value={form.contatoWhatsapp} onChange={(event) => onChange('contatoWhatsapp', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="11999999999" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase mb-2">Telefone</label>
          <input type="text" value={form.contatoTelefone} onChange={(event) => onChange('contatoTelefone', event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" placeholder="Opcional" />
        </div>
      </div>

      <button type="submit" className="nexus-primary-button w-full py-3">
        Efetivar Cadastro
      </button>
    </form>
  );
}
