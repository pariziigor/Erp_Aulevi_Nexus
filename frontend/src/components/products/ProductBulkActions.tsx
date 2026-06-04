import { FileDown, Loader2, Upload } from 'lucide-react';
import { LoadingButton } from '../shared/FormComponents';

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
	      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
	        <button type="button" onClick={onDownloadTemplate} className="nexus-secondary-button w-full sm:w-auto">
	          <FileDown size={16} /> Modelo Excel
	        </button>
        <LoadingButton
          type="button"
          onClick={onExportProducts}
          isLoading={exporting}
          loadingText="Exportando..."
          variant="secondary"
	          className="w-full rounded-full px-4 py-2 text-xs font-bold uppercase sm:w-auto"
	        >
	          Exportar Excel
	        </LoadingButton>
	        <label className="nexus-primary-button w-full cursor-pointer sm:w-auto">
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
