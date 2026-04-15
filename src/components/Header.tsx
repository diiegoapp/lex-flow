import { Scale, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-slate-700/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-violet-900/20 to-blue-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
          <Scale className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">LexFlow</h1>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Auto</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-0.5 tracking-wide">Consulta Processual Automatizada</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">STJ · STF · TNU</span>
          </div>
        </div>
      </div>
    </header>
  );
}
