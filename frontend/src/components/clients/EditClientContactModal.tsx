import { Loader2, Save } from 'lucide-react';
import type React from 'react';
import { Modal } from '../shared/Modal';
import type { Client } from './types';

interface EditClientContactModalProps {
  client: Client;
  email: string;
  saving: boolean;
  telefone: string;
  whatsapp: string;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onTelefoneChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
}

export function EditClientContactModal({
  client,
  email,
  saving,
  telefone,
  whatsapp,
  onClose,
  onEmailChange,
  onSubmit,
  onTelefoneChange,
  onWhatsappChange,
}: EditClientContactModalProps) {
  return (
    <Modal isOpen onClose={onClose} title="Editar contato" className="max-w-xl">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <p className="break-words font-mono text-xs font-bold uppercase text-gray-500">{client.razao_social}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase mb-2">E-mail</label>
            <input type="email" required value={email} onChange={(event) => onEmailChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase mb-2">WhatsApp</label>
              <input type="text" required value={whatsapp} onChange={(event) => onWhatsappChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2">Telefone</label>
              <input type="text" value={telefone} onChange={(event) => onTelefoneChange(event.target.value)} className="w-full border-2 border-black p-2 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        <button disabled={saving} type="submit" className="nexus-primary-button w-full py-3">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar Alteração
        </button>
      </form>
    </Modal>
  );
}
