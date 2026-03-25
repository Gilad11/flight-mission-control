'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error: <AlertCircle size={18} className="text-red-500 shrink-0" />,
  info: <Info size={18} className="text-blue-500 shrink-0" />,
};

const COLORS = {
  success: 'bg-white dark:bg-slate-800 border-green-200 dark:border-green-700 text-green-900 dark:text-green-100',
  error: 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-700 text-red-900 dark:text-red-100',
  info: 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[220px] max-w-xs ${COLORS[toast.type]}`}
            style={{ animation: 'toastSlideIn 0.2s ease' }}
          >
            {ICONS[toast.type]}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
