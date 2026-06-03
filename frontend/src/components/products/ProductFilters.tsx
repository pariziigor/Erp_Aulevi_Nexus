import { Filter, Search } from 'lucide-react';

interface ProductFiltersProps {
  search: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function ProductFilters({
  search,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
}: ProductFiltersProps) {
  return (
    <div className="nexus-filter-bar md:grid-cols-3">
      <div className="relative md:col-span-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nome do insumo ou codigo..."
          className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 p-3 pl-10 text-sm font-bold uppercase outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        >
          <option value="ALL">Todas as Categorias</option>
          <option value="LSF">Light Steel Frame (LSF)</option>
          <option value="MM">Madeiramento Metálico (MM)</option>
          <option value="CHALE">Chalés</option>
        </select>
      </div>
    </div>
  );
}

