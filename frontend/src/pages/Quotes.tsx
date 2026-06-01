import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, Download, FileCheck, Loader2, Plus, Trash2 } from 'lucide-react';

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

export const Quotes: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [category, setCategory] = useState<'LSF' | 'MM' | 'CHALE'>('LSF');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
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

  function handleCategoryChange(nextCategory: 'LSF' | 'MM' | 'CHALE') {
    setCategory(nextCategory);
    setSelectedProductId('');
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
      setErrorMessage('Selecione um cliente corporativo valido.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('O orcamento precisa conter pelo menos 1 item.');
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
      observations: observations || 'Proposta comercial padrao valida por 10 dias.',
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
      setSuccessMessage('Orcamento salvo como pendente e PDF gerado com sucesso.');
      setItems([]);
      setObservations('');
      setDiscount(0);
      setShippingValue(0);
      setSelectedClientId('');
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro tecnico ao salvar o orcamento e compilar o PDF.');
    } finally {
      setGeneratingPdf(false);
    }
  }

  if (loadingData) {
    return <div className="text-xs font-mono uppercase text-center py-12">Carregando entidades e catalogos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b-2 border-black pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-wider hover:underline">
          <ArrowLeft size={16} /> Voltar ao Menu
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight">Painel de Orcamentos</h2>
      </div>

      {successMessage && (
        <div className="border-2 border-black bg-green-50 p-4 text-xs font-mono uppercase text-black flex items-center gap-2">
          <FileCheck size={16} className="text-green-600" /> [SUCESSO]: {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="border-2 border-black bg-red-50 p-4 text-xs font-mono uppercase text-black">
          [ALERTA]: {errorMessage}
        </div>
      )}

      <form onSubmit={handleEmitirOrcamento} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">1. Categoria</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['LSF', 'MM', 'CHALE'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleCategoryChange(option)}
                  className={`border-2 border-black p-2 text-xs font-black uppercase ${category === option ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">2. Cliente</h3>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm bg-white font-medium focus:outline-none uppercase"
            >
              <option value="">-- Selecione o Cliente --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.razao_social} ({client.cnpj})</option>
              ))}
            </select>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">3. Regras Comerciais</h3>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Condicao de Pagamento</label>
              <select
                value={paymentCondition}
                onChange={(e) => setPaymentCondition(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs bg-white font-black uppercase focus:outline-none"
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Tipo de Frete</label>
              <select
                value={shippingType}
                onChange={(e) => setShippingType(e.target.value)}
                className="w-full border-2 border-black p-2 text-xs bg-white font-black uppercase focus:outline-none"
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">4. Itens</h3>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Produto</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full border-2 border-black p-2 text-sm bg-white font-medium focus:outline-none uppercase"
              >
                <option value="">-- Selecione o Produto --</option>
                {productsByCategory.map((product) => (
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
                className="w-full border-2 border-black p-2 text-sm focus:outline-none font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full border-2 border-black bg-gray-200 p-2 text-xs font-black uppercase tracking-wider hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Inserir Item
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-md font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
                <span>Composicao do Orcamento</span>
                <span className="font-mono text-xs text-gray-500">ITENS: {items.length}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-black text-xs font-black uppercase text-gray-600">
                      <th className="pb-2">Codigo</th>
                      <th className="pb-2">Descricao</th>
                      <th className="pb-2 text-center">Qtd</th>
                      <th className="pb-2 text-right">Unitario</th>
                      <th className="pb-2 text-right">Subtotal</th>
                      <th className="pb-2 text-center">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b text-sm font-medium">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center font-mono text-xs text-gray-400 uppercase">Nenhum item orcado ate o momento.</td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.product_id} className="hover:bg-gray-50">
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

            <div className="border-t-2 border-black pt-4 mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Desconto</label>
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-full border-2 border-black p-2 text-sm focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1">Valor do Frete</label>
                  <input type="number" min="0" value={shippingValue} onChange={(e) => setShippingValue(Number(e.target.value))} className="w-full border-2 border-black p-2 text-sm focus:outline-none font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1">Observacoes Comerciais</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Proposta valida por 10 dias."
                  className="w-full border-2 border-black p-2 text-xs focus:outline-none h-16 resize-none"
                />
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-100 border-2 border-black p-4 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Subtotal: {formatCurrency(subtotal)}</div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Desconto: {formatCurrency(Number(discount || 0))}</div>
                  <div className="text-xs font-black uppercase tracking-wider text-gray-600">Frete: {formatCurrency(Number(shippingValue || 0))}</div>
                  <div className="text-3xl font-black font-mono tracking-tight text-black">{formatCurrency(totalBudget)}</div>
                </div>
                <button
                  type="submit"
                  disabled={generatingPdf || items.length === 0}
                  className="w-full md:w-auto border-2 border-black bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
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

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4">Historico Recente</h3>
            <div className="divide-y divide-gray-200">
              {quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="py-3 flex items-center justify-between gap-4 text-xs font-mono">
                  <span className="font-black">{quote.numero_orcamento}</span>
                  <span className="uppercase">{quote.status}</span>
                  <span>{formatCurrency(Number(quote.total))}</span>
                </div>
              ))}
              {quotes.length === 0 && (
                <div className="py-4 text-center text-xs font-mono uppercase text-gray-500">Nenhum orcamento emitido.</div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
