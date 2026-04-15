import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { ProcessResult } from '../types';

interface ResultCardProps {
  result: ProcessResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  if (result.erro) {
    return (
      <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-red-300">Erro na Consulta</p>
            <p className="text-sm text-red-200/80 mt-1">{result.numero_cnj || 'Processo'}</p>
            <p className="text-xs text-red-400/70 mt-2">{result.erro}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-200">
      <div className="flex items-start gap-3 p-4 border-b border-slate-700/30 bg-slate-800/20">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-emerald-300">Processo Encontrado</p>
          <p className="text-xs text-slate-400 mt-0.5">{result.numero_cnj}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-700/60 text-xs font-semibold text-slate-300 flex-shrink-0">
          {result.tribunal}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {result.classe && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Classe</p>
              <p className="text-sm text-slate-200 mt-1">{result.classe}</p>
            </div>
          )}
          {result.orgao_julgador && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órgão Julgador</p>
              <p className="text-sm text-slate-200 mt-1">{result.orgao_julgador}</p>
            </div>
          )}
          {result.relator && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Relator</p>
              <p className="text-sm text-slate-200 mt-1">{result.relator}</p>
            </div>
          )}
          {result.assunto && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assunto</p>
              <p className="text-sm text-slate-200 mt-1">{result.assunto}</p>
            </div>
          )}
        </div>

        {result.ultima_fase && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Última Fase</p>
            <p className="text-sm text-slate-200 mt-1">{result.ultima_fase}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {result.inss_recorrente && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300">
              <FileText className="w-3 h-3" />
              INSS Recorrente
            </span>
          )}
          {result.tema_sugerido && (
            <div className="text-xs">
              <span className="text-slate-400">Tema: </span>
              <span className="text-slate-200 font-medium">{result.tema_sugerido}</span>
            </div>
          )}
          {result.subtema_sugerido && (
            <div className="text-xs">
              <span className="text-slate-400">Subtema: </span>
              <span className="text-slate-200 font-medium">{result.subtema_sugerido}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
