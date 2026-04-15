import { useEffect, useRef } from 'react';
import { Loader2, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { LogEntry, LogLevel } from '../types';

interface ProgressAreaProps {
  progress: number;
  logs: LogEntry[];
  isComplete: boolean;
  hasError: boolean;
}

const levelConfig: Record<LogLevel, { icon: React.ReactNode; color: string; bg: string }> = {
  info: {
    icon: <Info className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  success: {
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  error: {
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  warning: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
};

export default function ProgressArea({ progress, logs, isComplete, hasError }: ProgressAreaProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const statusColor = hasError ? 'from-red-500 to-red-600' : isComplete ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-violet-600';

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isComplete && !hasError && (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            )}
            {isComplete && !hasError && (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            {hasError && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-medium text-slate-200">
              {hasError ? 'Erro no processamento' : isComplete ? 'Processamento concluído' : 'Processando...'}
            </span>
          </div>
          <span className={`text-sm font-bold tabular-nums ${hasError ? 'text-red-400' : isComplete ? 'text-emerald-400' : 'text-blue-400'}`}>
            {progress}%
          </span>
        </div>

        <div className="relative h-2 rounded-full bg-slate-700/60 overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${statusColor} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
          {!isComplete && !hasError && progress > 0 && (
            <div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"
              style={{ left: `${Math.max(0, progress - 15)}%` }}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/60 border border-slate-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/30">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Log de Status</span>
          <span className="text-xs text-slate-600">{logs.length} entradas</span>
        </div>
        <div className="h-48 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {logs.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-slate-600">Aguardando logs...</span>
            </div>
          )}
          {logs.map((log) => {
            const config = levelConfig[log.level];
            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-lg ${config.bg} animate-fadeIn`}
              >
                <span className={`mt-0.5 flex-shrink-0 ${config.color}`}>{config.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium ${config.color}`}>{log.message}</span>
                </div>
                <span className="text-[10px] text-slate-600 flex-shrink-0 tabular-nums">{log.timestamp}</span>
              </div>
            );
          })}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
