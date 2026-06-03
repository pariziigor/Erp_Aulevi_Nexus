import { Download, FileDown, Loader2, Upload } from 'lucide-react';

interface ProductBulkActionsProps {
  exporting: boolean;
  importing: boolean;
  onDownloadTemplate: () => void;
  onExportProducts: () => void;
  onImportProducts: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductBulkActions({
  exporting,
  importing,
  onDownloadTemplate,
  onExportProducts,
  onImportProducts,
}: ProductBulkActionsProps) {
  return (
    <div className="nexus-panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="text-sm font-extrabold uppercase text-slate-900">Carga e exportação de produtos</h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Planilha Excel com colunas: codigo, descricao, categoria, unidade_medida, preco, is_active.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={onDownloadTemplate} className="nexus-secondary-button">
          <FileDown size={16} /> Modelo Excel
        </button>
        <button type="button" onClick={onExportProducts} disabled={exporting} className="nexus-secondary-button">
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Exportar Excel
        </button>
        <label className="nexus-primary-button cursor-pointer">
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Importar Excel
          <input
            type="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={onImportProducts}
            disabled={importing}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

