import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';

interface SpreadsheetTabProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
}

export default function SpreadsheetTab({ onFileSelect, selectedFile, onClearFile }: SpreadsheetTabProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.xlsx')) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/10">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatFileSize(selectedFile.size)} · Planilha Excel</p>
        </div>
        <button
          onClick={onClearFile}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        isDragging
          ? 'border-blue-500 bg-blue-500/5 scale-[1.01]'
          : 'border-slate-600/50 bg-slate-800/20 hover:border-blue-500/50 hover:bg-blue-500/5'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        className={`flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-200 ${
          isDragging ? 'bg-blue-500/20' : 'bg-slate-700/50'
        }`}
      >
        {isDragging ? (
          <Upload className="w-8 h-8 text-blue-400 animate-bounce" />
        ) : (
          <FileSpreadsheet className="w-8 h-8 text-slate-400" />
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-200">
          {isDragging ? 'Solte o arquivo aqui' : 'Arraste e solte sua planilha'}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          ou <span className="text-blue-400 hover:text-blue-300">clique para selecionar</span> · Apenas .xlsx
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        <span className="text-xs text-slate-400">Formato: número CNJ por linha</span>
      </div>
    </div>
  );
}
