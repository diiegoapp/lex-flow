import { FileSpreadsheet, FileSearch } from 'lucide-react';
import { TabType } from '../types';

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      id: 'spreadsheet',
      label: 'Planilha',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      description: 'Processamento em lote via .xlsx',
    },
    {
      id: 'single',
      label: 'Processo Avulso',
      icon: <FileSearch className="w-4 h-4" />,
      description: 'Consulta individual por CNJ',
    },
  ];

  return (
    <div className="flex gap-2 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}>
            {tab.icon}
          </span>
          <div className="text-left">
            <div className="font-semibold">{tab.label}</div>
            <div className={`text-xs hidden sm:block ${activeTab === tab.id ? 'text-blue-100' : 'text-slate-500'}`}>
              {tab.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
