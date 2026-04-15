export type TabType = 'spreadsheet' | 'single';

export type Tribunal = 'STJ' | 'STF' | 'TNU';

export type LogLevel = 'info' | 'success' | 'error' | 'warning';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: LogLevel;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  logs: LogEntry[];
  isComplete: boolean;
  hasError: boolean;
  resultFileName?: string;
}

export interface ProcessResult {
  tribunal: string;
  numero_cnj: string;
  classe?: string;
  orgao_julgador?: string;
  relator?: string;
  assunto?: string;
  ultima_fase?: string;
  inss_recorrente?: boolean;
  tema_sugerido?: string;
  subtema_sugerido?: string;
  erro?: string;
}

export interface ConsultaResponse {
  sucesso: boolean;
  dados?: ProcessResult;
  erro?: string;
  arquivo_url?: string;
  total_processados?: number;
  total_sucesso?: number;
  total_erro?: number;
}

export interface PlanilhaResponse {
  sucesso: boolean;
  arquivo_url?: string;
  total_processados?: number;
  total_sucesso?: number;
  total_erro?: number;
  erro?: string;
}
