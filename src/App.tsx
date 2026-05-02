import { useState, useCallback } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import SpreadsheetTab from './components/SpreadsheetTab';
import SingleProcessTab from './components/SingleProcessTab';
import ProgressArea from './components/ProgressArea';
import ResultArea from './components/ResultArea';
import ResultCard from './components/ResultCard';
import NotFoundMessage from './components/NotFoundMessage';
import ToastContainer from './components/ToastContainer';
import { TabType, Tribunal, ProcessResult, ConsultaResponse, IniciarPlanilhaResponse, StatusResponse } from './types';
import { useApi } from './hooks/useApi';
import { useProcessing } from './hooks/useProcessing';
import { useToast } from './hooks/useToast';
import { Play, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('spreadsheet');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processNumber, setProcessNumber] = useState('');
  const [tribunal, setTribunal] = useState<Tribunal>('STJ');
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<ProcessResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const { request, abort, normalizeUrl } = useApi();
  const { processing, addLog, setProgress, start, complete, reset: resetProcessing } = useProcessing();
  const { toasts, addToast, removeToast } = useToast();

  const canProcess =
    activeTab === 'spreadsheet'
      ? !!selectedFile
      : processNumber.replace(/\D/g, '').length >= 20;

  const processSingleConsulta = useCallback(async () => {
    if (!canProcess) return;

    start();
    setShowResult(false);
    setResultData(null);
    setDownloadUrl(null);

    try {
      addLog('Conectando ao servidor...', 'info');

      const data = await request<ConsultaResponse>('/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_cnj: processNumber.replace(/\D/g, ''),
          tribunal,
        }),
      });

      setProgress(50);
      addLog('Consultando tribunal...', 'info');

      if (data.sucesso && data.dados) {
        setProgress(100);
        addLog('Processo encontrado com sucesso!', 'success');
        setResultData(data.dados);

        if (data.arquivo_url) {
          setDownloadUrl(normalizeUrl(data.arquivo_url));
        }

        addToast('Processo consultado com sucesso!', 'success');
        setTimeout(() => {
          complete(false);
          setShowResult(true);
        }, 500);
      } else if (!data.sucesso && data.erro?.includes('não encontrado')) {
        addLog('Processo não encontrado no tribunal', 'warning');
        setResultData({ tribunal, numero_cnj: processNumber, erro: data.erro });
        addToast('Processo não encontrado', 'warning');
        complete(false);
        setTimeout(() => setShowResult(true), 300);
      } else {
        throw new Error(data.erro || 'Não foi possível consultar o processo');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const msg = err.message || 'Erro ao consultar o processo';
        addLog(msg, 'error');
        addToast(msg, 'error');
        complete(true);
      }
    }
  }, [canProcess, processNumber, tribunal, request, normalizeUrl, addLog, setProgress, start, complete, addToast]);

  const processSpreadsheet = useCallback(async () => {
    if (!selectedFile) return;

    start();
    setShowResult(false);
    setResultData(null);
    setDownloadUrl(null);
    setProcessedCount(0);
    setTotalCount(0);

    try {
      const formData = new FormData();
      formData.append('arquivo', selectedFile);

      addLog(`Carregando arquivo: ${selectedFile.name}`, 'info');

      const { job_id } = await request<IniciarPlanilhaResponse>('/iniciar-planilha', {
        method: 'POST',
        body: formData,
      });

      addLog('Job iniciado. Aguardando processamento...', 'info');

      const poll = () => {
        setTimeout(async () => {
          try {
            const status = await request<StatusResponse>(`/status/${job_id}`);

            if (status.mensagem) {
              addLog(status.mensagem, 'info');
            }

            if (status.progresso !== undefined) {
              setProgress(status.progresso);
            }

            if (status.total_processados !== undefined) {
              setProcessedCount(status.total_processados);
              setTotalCount(status.total_processados);
            }

            if (status.status === 'concluido') {
              const total = status.total_processados ?? 0;
              setTotalCount(total);
              setProcessedCount(total);
              setProgress(100);
              addLog(`Total processados: ${total}`, 'info');

              if (status.total_sucesso && status.total_sucesso > 0) {
                addLog(`Processos com sucesso: ${status.total_sucesso}`, 'success');
                addToast(`${status.total_sucesso} processo(s) processado(s) com sucesso!`, 'success');
              }

              if (status.total_erro && status.total_erro > 0) {
                addLog(`Processos com erro: ${status.total_erro}`, 'warning');
              }

              setDownloadUrl(status.arquivo_url ? normalizeUrl(status.arquivo_url) : null);

              setTimeout(() => {
                complete(false);
                setShowResult(true);
              }, 500);
            } else if (status.status === 'erro') {
              throw new Error(status.erro || 'Erro ao processar planilha');
            } else {
              poll();
            }
          } catch (err: unknown) {
            if (err instanceof Error && err.name !== 'AbortError') {
              const msg = err.message || 'Erro ao processar planilha';
              addLog(msg, 'error');
              addToast(msg, 'error');
              complete(true);
            }
          }
        }, 5000);
      };

      poll();
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const msg = err.message || 'Erro ao processar planilha';
        addLog(msg, 'error');
        addToast(msg, 'error');
        complete(true);
      }
    }
  }, [selectedFile, request, normalizeUrl, addLog, setProgress, start, complete, addToast]);

  const handleProcess = useCallback(() => {
    if (activeTab === 'single') {
      processSingleConsulta();
    } else {
      processSpreadsheet();
    }
  }, [activeTab, processSingleConsulta, processSpreadsheet]);

  const handleReset = useCallback(() => {
    abort();
    setSelectedFile(null);
    setProcessNumber('');
    setTribunal('STJ');
    resetProcessing();
    setShowResult(false);
    setResultData(null);
    setDownloadUrl(null);
    setProcessedCount(0);
    setTotalCount(0);
  }, [abort, resetProcessing]);

  const handleTabChange = useCallback((tab: TabType) => {
    handleReset();
    setActiveTab(tab);
  }, [handleReset]);

  const handleDownload = useCallback(() => {
    if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  }, [downloadUrl]);

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
                    <ResultCard result={resultData} arquivoUrl={downloadUrl} />
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
