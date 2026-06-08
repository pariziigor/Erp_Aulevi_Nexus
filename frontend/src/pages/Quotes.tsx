import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { ArrowLeft, FileCheck } from 'lucide-react';
import { QuoteCompositionPanel } from '../components/quotes/QuoteCompositionPanel';
import { CategorySelector, ClientSelector, CommercialRules, ProductSelector } from '../components/quotes/QuoteSidebar';
import { RecentQuotesPanel } from '../components/quotes/RecentQuotesPanel';
import type { ClientOption, CommercialOption, ProductOption, QuoteItem, QuoteSummary } from '../components/quotes/types';

export const Quotes: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [quotes, setQuotes] = useState<QuoteSummary[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<CommercialOption[]>([]);
  const [shippingOptions, setShippingOptions] = useState<CommercialOption[]>([]);
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
        const [clientsRes, productsRes, quotesRes, paymentRes, shippingRes] = await Promise.all([
          api.get('/clients'),
          api.get('/products'),
          api.get('/quotes'),
          api.get('/commercial-options/payment-conditions'),
          api.get('/commercial-options/shipping-types'),
        ]);
        setClients(clientsRes.data);
        setProducts(productsRes.data);
        setQuotes(quotesRes.data);
        setPaymentOptions(paymentRes.data);
        setShippingOptions(shippingRes.data);
        setPaymentCondition(paymentRes.data[0]?.code || '');
        setShippingType(shippingRes.data[0]?.code || '');
      } catch (err) {
        console.error('Erro ao carregar dados para orçamentos', err);
        setErrorMessage('Falha ao sincronizar clientes, produtos ou histórico.');
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

    const product = products.find((item) => item.id === selectedProductId);
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
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
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

      const clientName = clients.find((client) => client.id === selectedClientId)?.razao_social.toLowerCase().replace(/[^a-z0-9]/g, '_');
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
    return <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">Carregando entidades e catálogos...</div>;
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
          <CategorySelector category={category} onChange={handleCategoryChange} />
          <ClientSelector
            clients={clients}
            clientOptions={clientOptions}
            clientSearch={clientSearch}
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
            onSearchChange={setClientSearch}
          />
          <CommercialRules
            paymentOptions={paymentOptions.map((option) => ({ value: option.code, label: option.label }))}
            paymentCondition={paymentCondition}
            shippingOptions={shippingOptions.map((option) => ({ value: option.code, label: option.label }))}
            shippingType={shippingType}
            onPaymentChange={setPaymentCondition}
            onShippingChange={setShippingType}
          />
          <ProductSelector
            category={category}
            filteredProductsCount={filteredProducts.length}
            productsByCategoryCount={productsByCategory.length}
            productOptions={productOptions}
            productSearch={productSearch}
            quantityInput={quantityInput}
            selectedProductId={selectedProductId}
            formatCurrency={formatCurrency}
            onAddItem={handleAddItem}
            onProductChange={setSelectedProductId}
            onQuantityChange={setQuantityInput}
            onSearchChange={setProductSearch}
          />
        </div>

        <div className="relative z-10 lg:col-span-2 space-y-6">
          <QuoteCompositionPanel
            discount={discount}
            generatingPdf={generatingPdf}
            items={items}
            observations={observations}
            shippingValue={shippingValue}
            subtotal={subtotal}
            totalBudget={totalBudget}
            formatCurrency={formatCurrency}
            onDiscountChange={setDiscount}
            onObservationsChange={setObservations}
            onRemoveItem={handleRemoveItem}
            onShippingValueChange={setShippingValue}
          />
          <RecentQuotesPanel quotes={quotes} formatCurrency={formatCurrency} />
        </div>
      </form>
    </div>
  );
};
