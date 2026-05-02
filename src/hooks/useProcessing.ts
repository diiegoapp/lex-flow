import { useState, useCallback } from 'react';
import { ProcessingState, LogEntry, LogLevel } from '../types';

const generateId = () => Math.random().toString(36).slice(2);
const getTimestamp = () =>
  new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const initialState: ProcessingState = {
  isProcessing: false,
  progress: 0,
  logs: [],
  isComplete: false,
  hasError: false,
};

export function useProcessing() {
  const [processing, setProcessing] = useState<ProcessingState>(initialState);

  const pushLog = useCallback((message: string, level: LogLevel): LogEntry => ({
    id: generateId(),
    timestamp: getTimestamp(),
    message,
    level,
  }), []);

  const addLog = useCallback((message: string, level: LogLevel) => {
    setProcessing((prev) => ({
      ...prev,
      logs: [...prev.logs, pushLog(message, level)],
    }));
  }, [pushLog]);

  const setProgress = useCallback((progress: number) => {
    setProcessing((prev) => ({ ...prev, progress }));
  }, []);

  const start = useCallback(() => {
    setProcessing({ ...initialState, isProcessing: true });
  }, []);

  const complete = useCallback((hasError = false) => {
    setProcessing((prev) => ({
      ...prev,
      isProcessing: false,
      isComplete: true,
      hasError,
    }));
  }, []);

  const reset = useCallback(() => {
    setProcessing(initialState);
  }, []);

  return { processing, addLog, setProgress, start, complete, reset };
}
