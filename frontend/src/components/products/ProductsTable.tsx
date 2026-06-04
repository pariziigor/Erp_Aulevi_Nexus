import type { Product } from './types';
import { SkeletonRow } from '../shared/Skeleton';

interface ProductsTableProps {
  loading: boolean;
  products: Product[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProductsTable({ loading, products }: ProductsTableProps) {
  return (
    <div className="nexus-table-wrap nexus-table-scroll">
      <table className="w-full min-w-[760px] text-left">
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
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonRow key={index} columns={5} />
            ))
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center font-mono text-xs uppercase text-gray-500">
                Nenhum produto correspondente aos filtros de busca.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} className="row-fade transition-colors hover:bg-orange-50/50">
	                <td className="p-3 font-mono text-xs font-bold whitespace-nowrap">{product.codigo}</td>
	                <td className="p-3">
	                  <div className="line-clamp-2 break-words font-bold uppercase">{product.descricao}</div>
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
