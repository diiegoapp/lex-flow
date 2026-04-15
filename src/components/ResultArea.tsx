import { Download, FileSpreadsheet, CheckCircle, RotateCcw } from 'lucide-react';

interface ResultAreaProps {
  fileName: string;
  processedCount: number;
  onDownload: () => void;
  onReset: () => void;
}

export default function ResultArea({ fileName, processedCount, onDownload, onReset }: ResultAreaProps) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-slate-800/40 border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Consulta finalizada com sucesso!</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {processedCount} processo{processedCount !== 1 ? 's' : ''} processado{processedCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700/60 flex-shrink-0">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{fileName}</p>
          <p className="text-xs text-slate-500 mt-0.5">Planilha Excel com resultados</p>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Baixar
        </button>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all duration-200"
      >
        <RotateCcw className="w-4 h-4" />
        Nova Consulta
      </button>
    </div>
  );
}
