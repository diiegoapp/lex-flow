import {
  AlertCircle,
  CheckCircle,
  FileText,
  Briefcase,
  Scale,
  Users,
  BookOpen,
  Clock,
  Tag,
  Download,
} from 'lucide-react';
import { ProcessResult } from '../types';

interface ResultCardProps {
  result: ProcessResult;
  arquivoUrl?: string | null;
}

export default function ResultCard({ result, arquivoUrl }: ResultCardProps) {
  // Support both flat result and result nested under `dados`
  const d: ProcessResult = (result as any).dados ?? result;

  if (d.erro) {
    return (
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4 animate-scaleIn">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-300">Erro na Consulta</p>
            <p className="text-sm text-red-200/80 mt-1">{d.numero_cnj || 'Processo'}</p>
            <p className="text-xs text-red-400/70 mt-2">{d.erro}</p>
          </div>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    const url = arquivoUrl ?? (result as any).arquivo_url;
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const downloadUrl = arquivoUrl ?? (result as any).arquivo_url;

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 animate-scaleIn">
      <div className="flex items-start gap-3 p-4 border-b border-slate-700/30 bg-slate-800/20">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-300">Processo Encontrado</p>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{d.numero_cnj}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300 flex-shrink-0">
          {d.tribunal}
        </span>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {d.classe && (
            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classe</p>
              </div>
              <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">{d.classe}</p>
            </div>
          )}
          {d.orgao_julgador && (
            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <Scale className="w-4 h-4 text-cyan-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órgão Julgador</p>
              </div>
              <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">
                {d.orgao_julgador}
              </p>
            </div>
          )}
          {d.relator && (
            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-teal-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Relator</p>
              </div>
              <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">{d.relator}</p>
            </div>
          )}
          {d.assunto && (
            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assunto</p>
              </div>
              <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">{d.assunto}</p>
            </div>
          )}
        </div>

        {d.ultima_fase && (
          <div className="group pt-2 border-t border-slate-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Última Fase</p>
            </div>
            <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors">{d.ultima_fase}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {d.inss_recorrente && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 hover:bg-blue-500/15 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              INSS Recorrente
            </span>
          )}
          {d.tema_sugerido && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300">
              <Tag className="w-3.5 h-3.5" />
              {d.tema_sugerido}
            </div>
          )}
          {d.subtema_sugerido && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-xs font-medium text-slate-300">
              <Tag className="w-3.5 h-3.5" />
              {d.subtema_sugerido}
            </div>
          )}
        </div>

        {downloadUrl && (
          <div className="pt-2 border-t border-slate-700/30">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 hover:text-emerald-200 text-sm font-medium transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Baixar em Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
