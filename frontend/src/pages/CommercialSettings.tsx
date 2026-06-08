import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

import type { CommercialOption } from '../components/quotes/types';
import { useToast } from '../components/shared/Toast';
import api from '../services/api';

interface OptionSectionProps {
  title: string;
  endpoint: string;
  options: CommercialOption[];
  onRefresh: () => Promise<void>;
}

function OptionSection({ title, endpoint, options, onRefresh }: OptionSectionProps) {
  const { addToast } = useToast();
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function createOption(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(endpoint, { code, label, sort_order: options.length, is_active: true });
      setCode('');
      setLabel('');
      await onRefresh();
      addToast('Opcao comercial criada.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao criar opcao.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleOption(option: CommercialOption) {
    try {
      await api.patch(`${endpoint}/${option.id}`, { is_active: !option.is_active });
      await onRefresh();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Erro ao atualizar opcao.', 'error');
    }
  }

  return (
    <section className="nexus-panel space-y-5">
      <h3 className="text-sm font-extrabold uppercase text-slate-900">{title}</h3>
      <form onSubmit={createOption} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto]">
        <input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Codigo" className="rounded-xl border border-slate-200 bg-white p-3 text-sm uppercase outline-none focus:border-orange-400" />
        <input required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Nome exibido" className="rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-orange-400" />
        <button disabled={saving} className="nexus-primary-button" type="submit">
          <Plus size={16} /> Adicionar
        </button>
      </form>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/80 p-3">
            <div>
              <p className="text-sm font-bold text-slate-900">{option.label}</p>
              <p className="text-xs font-mono text-slate-500">{option.code}</p>
            </div>
            <button type="button" onClick={() => toggleOption(option)} className={option.is_active ? 'nexus-secondary-button' : 'nexus-primary-button'}>
              {option.is_active ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CommercialSettings({ onBack }: { onBack: () => void }) {
  const [paymentOptions, setPaymentOptions] = useState<CommercialOption[]>([]);
  const [shippingOptions, setShippingOptions] = useState<CommercialOption[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOptions = useCallback(async () => {
    const [paymentResponse, shippingResponse] = await Promise.all([
      api.get('/commercial-options/payment-conditions?include_inactive=true'),
      api.get('/commercial-options/shipping-types?include_inactive=true'),
    ]);
    setPaymentOptions(paymentResponse.data);
    setShippingOptions(shippingResponse.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOptions().catch(() => setLoading(false));
  }, [loadOptions]);

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Configuracoes Comerciais</h2>
      </div>
      {loading ? (
        <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Carregando configuracoes...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <OptionSection title="Condicoes de pagamento" endpoint="/commercial-options/payment-conditions" options={paymentOptions} onRefresh={loadOptions} />
          <OptionSection title="Tipos de frete" endpoint="/commercial-options/shipping-types" options={shippingOptions} onRefresh={loadOptions} />
        </div>
      )}
    </div>
  );
}
