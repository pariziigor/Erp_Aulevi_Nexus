import type { Product } from './types';

interface ProductsTableProps {
  loading: boolean;
  products: Product[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProductsTable({ loading, products }: ProductsTableProps) {
  if (loading) {
    return (
      <div className="nexus-panel py-12 text-center text-xs font-semibold uppercase text-slate-500">
        Sincronizando catalogo com o banco central...
      </div>
    );
  }

  return (
    <div className="nexus-table-wrap">
      <table className="w-full text-left">
        <thead>
          <tr className="nexus-table-head">
            <th className="w-32 p-3">Código</th>
            <th className="p-3">Item / Descrição</th>
            <th className="w-40 p-3">Categoria</th>
            <th className="w-28 p-3 text-right">Preço Unit.</th>
            <th className="w-24 p-3 text-center">Unidade</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {products.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center font-mono text-xs uppercase text-gray-500">
                Nenhum produto correspondente aos filtros de busca.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-orange-50/50">
                <td className="p-3 font-mono text-xs font-bold">{product.codigo}</td>
                <td className="p-3">
                  <div className="font-bold uppercase">{product.descricao}</div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {product.is_active ? 'Ativo no catalogo' : 'Inativo'}
                  </div>
                </td>
                <td className="p-3 text-xs">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 font-bold uppercase text-slate-600">
                    {product.categoria}
                  </span>
                </td>
                <td className="p-3 text-right font-mono font-bold text-slate-950">
                  {currencyFormatter.format(Number(product.preco))}
                </td>
                <td className="p-3 text-center font-mono text-xs font-medium uppercase">
                  {product.unidade_medida}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

