import { Search, AlertCircle } from 'lucide-react';

interface NotFoundMessageProps {
  processNumber: string;
  tribunal: string;
  onTryAgain: () => void;
}

export default function NotFoundMessage({ processNumber, tribunal, onTryAgain }: NotFoundMessageProps) {
  return (
    <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-6 animate-scaleIn">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500/10 flex-shrink-0">
          <Search className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-amber-300">Processo não encontrado</p>
          <p className="text-sm text-amber-200/80 mt-1">
            Não foi possível localizar o processo <span className="font-mono text-amber-100">{processNumber}</span> no{' '}
            <span className="font-semibold">{tribunal}</span>.
          </p>
          <div className="mt-4 space-y-2 text-sm text-amber-200/70">
            <p>Possíveis motivos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Número CNJ inválido ou incorreto</li>
              <li>Processo ainda não foi registrado no sistema</li>
              <li>Tribunal selecionado não é o correto</li>
              <li>Processo foi extinto ou arquivado</li>
            </ul>
          </div>
          <button
            onClick={onTryAgain}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-sm font-medium transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            Verificar novamente
          </button>
        </div>
      </div>
    </div>
  );
}
