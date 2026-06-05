import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';
import { useUiStore } from '../../store/uiStore.js';

function ToastItem({ id, message, type, duration, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-900 border-green-700 text-green-100',
    error: 'bg-red-900 border-red-700 text-red-100',
    warning: 'bg-yellow-900 border-yellow-700 text-yellow-100',
    info: 'bg-blue-900 border-blue-700 text-blue-100',
  };

  const typeIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        border backdrop-blur-sm
        ${typeStyles[type] || typeStyles.info}
        animate-in slide-in-from-right duration-300
      `}
      role="alert"
    >
      {typeIcons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-3 pointer-events-none z-50">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
}
