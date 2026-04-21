import { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import SpreadsheetTab from './components/SpreadsheetTab';
import SingleProcessTab from './components/SingleProcessTab';
import ProgressArea from './components/ProgressArea';
import ResultArea from './components/ResultArea';
import ResultCard from './components/ResultCard';
import NotFoundMessage from './components/NotFoundMessage';
import ToastContainer, { ToastMessage } from './components/ToastContainer';
import { TabType, Tribunal, LogEntry, ProcessingState, ProcessResult, ConsultaResponse, PlanilhaResponse } from './types';
import { Play, ChevronRight } from 'lucide-react';

const generateId = () => Math.random().toString(36).slice(2);
const getTimestamp = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const API_BASE_URL = 'http://82.197.67.129:3001';

const addLog = (logs: LogEntry[], message: string, level: LogEntry['level']) => [
  ...logs,
  { id: generateId(), timestamp: getTimestamp(), message, level },
];

const initialProcessingState: ProcessingState = {
  isProcessing: false,
  progress: 0,
  logs: [],
  isComplete: false,
  hasError: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('spreadsheet');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processNumber, setProcessNumber] = useState('');
  const [tribunal, setTribunal] = useState<Tribunal>('STJ');
  const [processing, setProcessing] = useState<ProcessingState>(initialProcessingState);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<ProcessResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const canProcess = activeTab === 'spreadsheet' ? !!selectedFile : processNumber.replace(/\D/g, '').length >= 20;

  const processSingleConsulta = useCallback(async () => {
    if (!canProcess) return;

    clearTimeouts();
    abortControllerRef.current = new AbortController();
    setShowResult(false);
    setResultData(null);
    setDownloadUrl(null);
    setProcessing({ isProcessing: true, progress: 0, logs: [], isComplete: false, hasError: false });

    try {
      setProcessing((prev) => ({
        ...prev,
        logs: addLog(prev.logs, 'Conectando ao servidor...', 'info'),
      }));

      const response = await fetch(`${API_BASE_URL}/consulta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_cnj: processNumber.replace(/\D/g, ''),
          tribunal,
        }),
        signal: abortControllerRef.current.signal,
      });

      setProcessing((prev) => ({
        ...prev,
        progress: 50,
        logs: addLog(prev.logs, 'Consultando tribunal...', 'info'),
      }));

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: ConsultaResponse = await response.json();

      if (data.sucesso && data.dados) {
        setProcessing((prev) => ({
          ...prev,
          progress: 100,
          logs: addLog(prev.logs, 'Processo encontrado com sucesso!', 'success'),
        }));
        setResultData(data.dados);
        if (data.arquivo_url) setDownloadUrl(data.arquivo_url);
        addToast('Processo consultado com sucesso!', 'success');
        setTimeout(() => {
          setProcessing((prev) => ({ ...prev, isProcessing: false, isComplete: true }));
          setShowResult(true);
        }, 500);
      } else if (!data.sucesso && data.erro?.includes('não encontrado')) {
        setProcessing((prev) => ({
          ...prev,
          isProcessing: false,
          isComplete: true,
          logs: addLog(prev.logs, 'Processo não encontrado no tribunal', 'warning'),
        }));
        const notFoundResult: ProcessResult = {
          tribunal,
          numero_cnj: processNumber,
          erro: data.erro,
        };
        setResultData(notFoundResult);
        addToast('Processo não encontrado', 'warning');
        setTimeout(() => {
          setShowResult(true);
        }, 300);
      } else {
        throw new Error(data.erro || 'Não foi possível consultar o processo');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMsg = err.message || 'Erro ao consultar o processo';
        setProcessing((prev) => ({
          ...prev,
          isProcessing: false,
          hasError: true,
          logs: addLog(prev.logs, errorMsg, 'error'),
        }));
        addToast(errorMsg, 'error');
      }
    }
  }, [canProcess, processNumber, tribunal]);

  const processSpreadsheet = useCallback(async () => {
    if (!selectedFile) return;

    clearTimeouts();
    abortControllerRef.current = new AbortController();
    setShowResult(false);
    setResultData(null);
    setDownloadUrl(null);
    setProcessedCount(0);
    setTotalCount(0);
    setProcessing({ isProcessing: true, progress: 0, logs: [], isComplete: false, hasError: false });

    try {
      const formData = new FormData();
      formData.append('arquivo', selectedFile);

      setProcessing((prev) => ({
        ...prev,
        logs: addLog(prev.logs, `Carregando arquivo: ${selectedFile.name}`, 'info'),
      }));

      const response = await fetch(`${API_BASE_URL}/processar-planilha`, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: PlanilhaResponse = await response.json();

      if (data.sucesso) {
        setTotalCount(data.total_processados || 0);
        setProcessedCount(data.total_processados || 0);

        setProcessing((prev) => ({
          ...prev,
          progress: 100,
          logs: [
            ...addLog(prev.logs, `Total processados: ${data.total_processados || 0}`, 'info'),
          ],
        }));

        if (data.total_sucesso && data.total_sucesso > 0) {
          setProcessing((prev) => ({
            ...prev,
            logs: addLog(prev.logs, `Processos com sucesso: ${data.total_sucesso}`, 'success'),
          }));
          addToast(`${data.total_sucesso} processo(s) processado(s) com sucesso!`, 'success');
        }

        if (data.total_erro && data.total_erro > 0) {
          setProcessing((prev) => ({
            ...prev,
            logs: addLog(prev.logs, `Processos com erro: ${data.total_erro}`, 'warning'),
          }));
        }

        setDownloadUrl(data.arquivo_url || null);

        setTimeout(() => {
          setProcessing((prev) => ({ ...prev, isProcessing: false, isComplete: true }));
          setShowResult(true);
        }, 500);
      } else {
        throw new Error(data.erro || 'Erro ao processar planilha');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errorMsg = err.message || 'Erro ao processar planilha';
        setProcessing((prev) => ({
          ...prev,
          isProcessing: false,
          hasError: true,
          logs: addLog(prev.logs, errorMsg, 'error'),
        }));
        addToast(errorMsg, 'error');
      }
    }
  }, [selectedFile]);

  const handleProcess = useCallback(() => {
    if (activeTab === 'single') {
      processSingleConsulta();
    } else {
      processSpreadsheet();
    }
  }, [activeTab, processSingleConsulta, processSpreadsheet]);

  const handleReset = () => {
    clearTimeouts();
    abortControllerRef.current?.abort();
    setSelectedFile(null);
    setProcessNumber('');
    setTribunal('STJ');
    setProcessing(initialProcessingState);
    setShowResult(false);
    setResultData(null);
    setDownloadUrl(null);
    setProcessedCount(0);
    setTotalCount(0);
  };

  const handleTabChange = (tab: TabType) => {
    handleReset();
    setActiveTab(tab);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `lexflow_resultado_${Date.now()}.xlsx`;
      a.click();
    }
  };

  const showProgress = processing.isProcessing || processing.isComplete || processing.hasError;

  return (
    <div className="min-h-screen bg-[#080c18] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        <Header />

        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Nova Consulta</h2>
            <p className="text-sm text-slate-500">Selecione o modo de consulta e configure os parâmetros abaixo.</p>
          </div>

          <div className="rounded-2xl bg-slate-800/20 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <div className="p-5 space-y-5">
              <TabNav activeTab={activeTab} onTabChange={handleTabChange} />

              <div className="min-h-[160px]">
                {activeTab === 'spreadsheet' ? (
                  <SpreadsheetTab
                    onFileSelect={setSelectedFile}
                    selectedFile={selectedFile}
                    onClearFile={() => setSelectedFile(null)}
                  />
                ) : (
                  <SingleProcessTab
                    processNumber={processNumber}
                    tribunal={tribunal}
                    onProcessNumberChange={setProcessNumber}
                    onTribunalChange={setTribunal}
                  />
                )}
              </div>

              <button
                onClick={handleProcess}
                disabled={!canProcess || processing.isProcessing}
                className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl text-base font-semibold transition-all duration-200 ${
                  canProcess && !processing.isProcessing
                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                    : 'bg-slate-700/40 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                {processing.isProcessing ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Processar
                    <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
                  </>
                )}
              </button>
            </div>
          </div>

          {showProgress && (
            <div className="rounded-2xl bg-slate-800/20 border border-slate-700/50 backdrop-blur-sm overflow-hidden animate-slideUp">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/30">
                <h3 className="text-sm font-semibold text-slate-200">Progresso da Consulta</h3>
              </div>
              <div className="p-5">
                <ProgressArea
                  progress={processing.progress}
                  logs={processing.logs}
                  isComplete={processing.isComplete}
                  hasError={processing.hasError}
                  processedCount={processedCount}
                  totalCount={totalCount}
                />
              </div>
            </div>
          )}

          {showResult && activeTab === 'single' && resultData && (
            <div
              className={`rounded-2xl backdrop-blur-sm overflow-hidden animate-slideUp ${
                resultData.erro
                  ? 'bg-slate-800/20 border border-amber-500/20'
                  : 'bg-slate-800/20 border border-emerald-500/20'
              }`}
            >
              <div
                className={`px-5 py-4 border-b backdrop-blur-sm ${
                  resultData.erro
                    ? 'border-amber-500/10 bg-amber-500/5'
                    : 'border-emerald-500/10 bg-emerald-500/5'
                }`}
              >
                <h3
                  className={`text-sm font-semibold ${
                    resultData.erro ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {resultData.erro ? 'Resultado da Busca' : 'Resultado da Consulta'}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {resultData.erro ? (
                  <NotFoundMessage
                    processNumber={resultData.numero_cnj}
                    tribunal={resultData.tribunal}
                    onTryAgain={handleReset}
                  />
                ) : (
                  <>
                    <ResultCard result={resultData} />
                    {downloadUrl && (
                      <ResultArea
                        fileName={`resultado_${resultData.numero_cnj.replace(/\D/g, '').slice(0, 7)}.xlsx`}
                        processedCount={1}
                        onDownload={handleDownload}
                        onReset={handleReset}
                      />
                    )}
                  </>
                )}
                {!downloadUrl && (
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all duration-200"
                  >
                    Nova Consulta
                  </button>
                )}
              </div>
            </div>
          )}

          {showResult && activeTab === 'spreadsheet' && downloadUrl && (
            <div className="rounded-2xl bg-slate-800/20 border border-emerald-500/20 backdrop-blur-sm overflow-hidden animate-slideUp">
              <div className="px-5 py-4 border-b border-emerald-500/10 bg-emerald-500/5">
                <h3 className="text-sm font-semibold text-emerald-300">Resultado Disponível</h3>
              </div>
              <div className="p-5">
                <ResultArea
                  fileName={`resultado_${selectedFile?.name || 'planilha.xlsx'}`}
                  processedCount={processing.logs.length}
                  onDownload={handleDownload}
                  onReset={handleReset}
                />
              </div>
            </div>
          )}
        </main>

        <footer className="max-w-2xl mx-auto px-4 pb-8 mt-4">
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-600">LexFlow © 2026</span>
            <span className="text-xs text-slate-700">·</span>
            <span className="text-xs text-slate-600">STJ · STF · TNU</span>
            <span className="text-xs text-slate-700">·</span>
            <span className="text-xs text-slate-600">Consulta Processual Automatizada</span>
          </div>
        </footer>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
