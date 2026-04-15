import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }> = {
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-300',
    borderColor: 'border-red-500/20',
  },
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/20',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-300',
    borderColor: 'border-blue-500/20',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/20',
  },
};

export default function Toast({ id, message, type, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className="animate-slideInRight">
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${config.bgColor} ${config.borderColor} pointer-events-auto`}
      >
        <span className={`mt-0.5 flex-shrink-0 ${config.textColor}`}>{config.icon}</span>
        <p className={`text-sm font-medium flex-1 ${config.textColor}`}>{message}</p>
        <button
          onClick={() => onClose(id)}
          className={`mt-0.5 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ${config.textColor}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
