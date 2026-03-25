'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

let toastQueue = [];
let listeners = [];

export function showToast(message, type = 'success') {
  const id = Date.now();
  toastQueue = [...toastQueue, { id, message, type }];
  listeners.forEach(fn => fn([...toastQueue]));
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(fn => fn([...toastQueue]));
  }, 3500);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(fn => fn !== setToasts); };
  }, []);

  const dismiss = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    setToasts([...toastQueue]);
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />
  };
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-white shadow-xl text-sm max-w-xs ${colors[t.type] || colors.success}`}>
          {icons[t.type] || icons.success}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
