import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, ChevronDown, Download, FileCheck, Loader2, Plus, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  razao_social: string;
  cnpj: string;
}

interface Product {
  id: string;
  codigo: string;
  descricao: string;
  categoria: 'LSF' | 'MM' | 'CHALE';
  preco: number;
  unidade_medida: string;
}

interface Quote {
  id: string;
  numero_orcamento: string;
  status: string;
  total: number;
  created_at: string;
}

interface QuoteItem {
  product_id: string;
  codigo: string;
  descricao: string;
  quantity: number;
  price_unit: number;
}

const paymentOptions = [
  { value: 'A_VISTA', label: 'A vista' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'CARTAO', label: 'Cartao' },
  { value: '30_DIAS', label: '30 dias' },
  { value: '30_60', label: '30/60' },
  { value: '30_60_90', label: '30/60/90' },
  { value: 'ENTRADA_PARCELAS', label: 'Entrada + parcelas' },
];

const shippingOptions = [
  { value: 'CIF', label: 'CIF' },
  { value: 'FOB', label: 'FOB' },
  { value: 'RETIRADA', label: 'Retirada' },
  { value: 'ENTREGA_LOCAL', label: 'Entrega local' },
  { value: 'TRANSPORTADORA', label: 'Transportadora' },
  { value: 'FRETE_INCLUSO', label: 'Frete incluso' },
  { value: 'FRETE_A_CALCULAR', label: 'Frete a calcular' },
];

interface CommercialSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

function CommercialSelect({ options, value, onChange }: CommercialSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${open ? 'z-[120]' : 'z-0'}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border bg-white/80 p-3 text-left text-xs font-extrabold uppercase text-slate-900 shadow-sm outline-none transition hover:border-orange-300 hover:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 ${open ? 'border-orange-300 ring-4 ring-orange-500/10' : 'border-slate-200'}`}
      >
        <span>{selectedOption?.label || 'Selecione'}</span>
        <ChevronDown size={16} className={`text-slate-500 transition ${open ? 'rotate-180 text-orange-500' : ''}`} />
      </button>

      {open && (
        <div className="nexus-dropdown-panel">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold uppercase transition ${selected ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-700'}`}
              >
                {option.label}
                {selected && <span className="h-2 w-2 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const Quotes: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [category, setCategory] = useState<'LSF' | 'MM' | 'CHALE'>('LSF');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [observations, setObservations] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingValue, setShippingValue] = useState(0);
  const [paymentCondition, setPaymentCondition] = useState('A_VISTA');
  const [shippingType, setShippingType] = useState('FRETE_A_CALCULAR');

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [clientsRes, productsRes, quotesRes] = await Promise.all([
          api.get('/clients'),
          api.get('/products'),
          api.get('/quotes'),
        ]);
        setClients(clientsRes.data);
        setProducts(productsRes.data);
        setQuotes(quotesRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados para orcamentos', err);
        setErrorMessage('Falha ao sincronizar clientes, produtos ou historico.');
      } finally {
        setLoadingData(false);
      }
    }
    loadInitialData();
  }, []);

  const productsByCategory = useMemo(
    () => products.filter((product) => product.categoria === category),
    [products, category],
  );

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase().replace(/\D/g, '');
    const rawTerm = clientSearch.trim().toLowerCase();
    if (!rawTerm) return clients;

    return clients.filter((client) => {
      const cnpjDigits = client.cnpj.replace(/\D/g, '');
      return client.razao_social.toLowerCase().includes(rawTerm) || cnpjDigits.includes(term);
    });
  }, [clients, clientSearch]);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return productsByCategory;

    return productsByCategory.filter((product) => (
      product.codigo.toLowerCase().includes(term) ||
      product.descricao.toLowerCase().includes(term)
    ));
  }, [productsByCategory, productSearch]);

  const clientOptions = useMemo(() => {
    if (!selectedClientId || filteredClients.some((client) => client.id === selectedClientId)) {
      return filteredClients;
    }
    const selectedClient = clients.find((client) => client.id === selectedClientId);
    return selectedClient ? [selectedClient, ...filteredClients] : filteredClients;
  }, [clients, filteredClients, selectedClientId]);

  const productOptions = useMemo(() => {
    if (!selectedProductId || filteredProducts.some((product) => product.id === selectedProductId)) {
      return filteredProducts;
    }
    const selectedProduct = productsByCategory.find((product) => product.id === selectedProductId);
    return selectedProduct ? [selectedProduct, ...filteredProducts] : filteredProducts;
  }, [filteredProducts, productsByCategory, selectedProductId]);

  function handleCategoryChange(nextCategory: 'LSF' | 'MM' | 'CHALE') {
    setCategory(nextCategory);
    setSelectedProductId('');
    setProductSearch('');
    setItems([]);
  }

  function handleAddItem() {
    if (!selectedProductId || quantityInput <= 0) return;

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = items.findIndex((item) => item.product_id === product.id);
    if (existingIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += Number(quantityInput);
      setItems(updatedItems);
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          codigo: product.codigo,
          descricao: product.descricao,
          quantity: Number(quantityInput),
          price_unit: Number(product.preco),
        },
      ]);
    }

    setSelectedProductId('');
    setProductSearch('');
    setQuantityInput(1);
  }

  function handleRemoveItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price_unit, 0);
  const totalBudget = Math.max(subtotal - Number(discount || 0) + Number(shippingValue || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  };

  async function handleEmitirOrcamento(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedClientId) {
      setErrorMessage('Selecione um cliente corporativo válido.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('O orçamento precisa conter pelo menos 1 item.');
      return;
    }
    if (Number(discount || 0) > subtotal + Number(shippingValue || 0)) {
      setErrorMessage('O desconto informado deixa o total negativo.');
      return;
    }

    setGeneratingPdf(true);

    const payload = {
      client_id: selectedClientId,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      payment_condition: paymentCondition,
      shipping_type: shippingType,
      desconto: Number(discount || 0),
      valor_frete: Number(shippingValue || 0),
      observations: observations || 'Proposta comercial padrão válida por 10 dias.',
    };

    try {
      const response = await api.post('/quotes/generate', payload, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const clientName = clients.find((c) => c.id === selectedClientId)?.razao_social.toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.setAttribute('download', `orcamento_aulevi_${clientName || 'nexus'}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const quotesRes = await api.get('/quotes');
      setQuotes(quotesRes.data);
      setSuccessMessage('Orçamento salvo como pendente e PDF gerado com sucesso.');
      setItems([]);
      setObservations('');
      setDiscount(0);
      setShippingValue(0);
      setSelectedClientId('');
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro técnico ao salvar o orçamento e compilar o PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  if (loadingData) {
    return <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Carregando entidades e catalogos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="nexus-page-header">
        <button onClick={onBack} className="nexus-back-button">
          <ArrowLeft size={16} /> Voltar ao menu
        </button>
        <h2 className="nexus-title">Painel de Orçamentos</h2>
      </div>

      {successMessage && (
        <div className="nexus-alert-success flex items-center gap-2">
          <FileCheck size={16} className="text-green-600" /> [SUCESSO]: {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="nexus-alert-error">
          [ALERTA]: {errorMessage}
        </div>
      )}

      <form onSubmit={handleEmitirOrcamento} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="relative z-30 lg:col-span-1 space-y-6">
          <div className="nexus-panel relative z-20 space-y-4">
            <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">1. Categoria</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['LSF', 'MM', 'CHALE'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleCategoryChange(option)}
                  className={`rounded-xl border p-2 text-xs font-extrabold uppercase transition ${category === option ? 'border-orange-400 bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border-slate-200 bg-white/80 text-slate-700 hover:border-orange-300 hover:text-orange-600'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="nexus-panel relative z-20 space-y-4">
            <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">2. Cliente</h3>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Buscar por Razão Social ou CNPJ</label>
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Digite parte do nome ou CNPJ..."
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
              <div className="mt-1 text-[10px] font-mono uppercase text-gray-500">
                {filteredClients.length} de {clients.length} clientes encontrados
              </div>
            </div>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-medium uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            >
              <option value="">-- Selecione o Cliente --</option>
              {clientOptions.map((client) => (
                <option key={client.id} value={client.id}>{client.razao_social} ({client.cnpj})</option>
              ))}
            </select>
          </div>

          <div className="nexus-panel relative z-50 space-y-4 overflow-visible">
            <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">3. Regras Comerciais</h3>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Condição de Pagamento</label>
              <CommercialSelect
                options={paymentOptions}
                value={paymentCondition}
                onChange={setPaymentCondition}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Tipo de Frete</label>
              <CommercialSelect
                options={shippingOptions}
                value={shippingType}
                onChange={setShippingType}
              />
            </div>
          </div>

          <div className="nexus-panel relative z-0 space-y-4">
            <h3 className="border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">4. Itens</h3>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Buscar por Código ou Descrição</label>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Digite código ou descrição do item..."
                className="mb-3 w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
              <div className="mb-2 text-[10px] font-mono uppercase text-gray-500">
                {filteredProducts.length} de {productsByCategory.length} itens da categoria {category}
              </div>
              <label className="block text-xs font-bold uppercase mb-1">Produto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-medium uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              >
                <option value="">-- Selecione o Produto --</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    [{product.codigo}] {product.descricao} - {formatCurrency(Number(product.preco))}/{product.unidade_medida}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-mono outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="nexus-secondary-button w-full"
            >
              <Plus size={16} /> Inserir Item
            </button>
          </div>
        </div>

        <div className="relative z-10 lg:col-span-2 space-y-6">
          <div className="nexus-panel flex min-h-[400px] flex-col justify-between">
            <div>
              <h3 className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-sm font-extrabold uppercase text-slate-900">
                <span>Composição do Orçamento</span>
                <span className="font-mono text-xs text-gray-500">ITENS: {items.length}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-600">
                      <th className="pb-2">Código</th>
                      <th className="pb-2">Descrição</th>
                      <th className="pb-2 text-center">Qtd</th>
                      <th className="pb-2 text-right">Unitário</th>
                      <th className="pb-2 text-right">Subtotal</th>
                      <th className="pb-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b text-sm font-medium">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center font-mono text-xs text-gray-400 uppercase">Nenhum item orçado até o momento.</td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.product_id} className="hover:bg-orange-50/50">
                          <td className="py-2 font-mono text-xs">{item.codigo}</td>
                          <td className="py-2 uppercase font-bold text-xs">{item.descricao}</td>
                          <td className="py-2 text-center font-mono">{item.quantity}</td>
                          <td className="py-2 text-right font-mono text-xs">{formatCurrency(item.price_unit)}</td>
                          <td className="py-2 text-right font-mono text-xs font-bold">{formatCurrency(item.quantity * item.price_unit)}</td>
                          <td className="py-2 text-center">
                            <button type="button" onClick={() => handleRemoveItem(index)} className="text-black hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Desconto</label>
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-mono outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Valor do Frete</label>
                  <input type="number" min="0" value={shippingValue} onChange={(e) => setShippingValue(Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm font-mono outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Observações Comerciais</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Proposta valida por 10 dias."
                  className="h-16 w-full resize-none rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-orange-200/70 bg-orange-50/60 p-4 md:flex-row md:items-center">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Subtotal: {formatCurrency(subtotal)}</div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Desconto: {formatCurrency(Number(discount || 0))}</div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Frete: {formatCurrency(Number(shippingValue || 0))}</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-black">{formatCurrency(totalBudget)}</div>
                </div>
                <button
                  type="submit"
                  disabled={generatingPdf || items.length === 0}
                  className="nexus-primary-button w-full px-6 py-3 md:w-auto"
                >
                  {generatingPdf ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Salvar & Emitir PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="nexus-panel">
            <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-extrabold uppercase text-slate-900">Histórico Recente</h3>
            <div className="divide-y divide-gray-200">
              {quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="py-3 flex items-center justify-between gap-4 text-xs font-mono">
                  <span className="font-black">{quote.numero_orcamento}</span>
                  <span className="uppercase">{quote.status}</span>
                  <span>{formatCurrency(Number(quote.total))}</span>
                </div>
              ))}
              {quotes.length === 0 && (
                <div className="py-4 text-center text-xs font-mono uppercase text-gray-500">Nenhum orçamento emitido.</div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
