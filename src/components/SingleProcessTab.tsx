import { FileSearch, ChevronDown } from 'lucide-react';
import { Tribunal } from '../types';

interface SingleProcessTabProps {
  processNumber: string;
  tribunal: Tribunal;
  onProcessNumberChange: (value: string) => void;
  onTribunalChange: (value: Tribunal) => void;
}

const tribunais: { value: Tribunal; label: string; description: string }[] = [
  { value: 'STJ', label: 'STJ', description: 'Superior Tribunal de Justiça' },
  { value: 'STF', label: 'STF', description: 'Supremo Tribunal Federal' },
  { value: 'TNU', label: 'TNU', description: 'Turma Nacional de Uniformização' },
];

const formatCNJ = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 7) return digits;
  if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`;
  if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`;
  if (digits.length <= 17) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`;
  if (digits.length <= 19) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 17)}.${digits.slice(17)}`;
  const d = digits.slice(0, 20);
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 17)}.${d.slice(17, 19)}.${d.slice(19)}`;
};

export default function SingleProcessTab({
  processNumber,
  tribunal,
  onProcessNumberChange,
  onTribunalChange,
}: SingleProcessTabProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onProcessNumberChange(formatCNJ(e.target.value));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Número CNJ do Processo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <FileSearch className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={processNumber}
            onChange={handleInputChange}
            placeholder="0000000-00.0000.0.00.0000"
            maxLength={25}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          {processNumber && (
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <span className="text-xs text-slate-500">{processNumber.replace(/\D/g, '').length}/20</span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-600">Formato: NNNNNNN-DD.AAAA.J.TT.OOOO</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Tribunal
        </label>
        <div className="grid grid-cols-3 gap-2">
          {tribunais.map((t) => (
            <button
              key={t.value}
              onClick={() => onTribunalChange(t.value)}
              className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all duration-200 ${
                tribunal === t.value
                  ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-violet-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              {tribunal === t.value && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400" />
              )}
              <span className={`text-base font-bold ${tribunal === t.value ? 'text-white' : 'text-slate-300'}`}>
                {t.label}
              </span>
              <span className={`text-[10px] text-center leading-tight ${tribunal === t.value ? 'text-blue-300' : 'text-slate-600'}`}>
                {t.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden">
        <div className="relative">
          <select
            value={tribunal}
            onChange={(e) => onTribunalChange(e.target.value as Tribunal)}
            className="w-full px-4 py-3.5 pr-10 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            {tribunais.map((t) => (
              <option key={t.value} value={t.value} className="bg-slate-900">
                {t.label} — {t.description}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
