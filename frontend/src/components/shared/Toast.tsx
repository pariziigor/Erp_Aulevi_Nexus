/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toasts: Toast[];
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (message: string, type: ToastType, duration = 3500) => {
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      window.setTimeout(() => removeToast(id), duration);
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-[calc(100vw-2rem)] space-y-2 sm:w-auto">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} index={index} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
}

function ToastItem({ toast, onRemove, index }: ToastItemProps) {
  const icons = {
    success: <Check className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50/95 border-green-200',
    error: 'bg-red-50/95 border-red-200',
    warning: 'bg-yellow-50/95 border-yellow-200',
    info: 'bg-blue-50/95 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div
      className={`toast-slide-in pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg shadow-slate-900/10 backdrop-blur-sm transition-all duration-300 sm:min-w-[300px] sm:max-w-[450px] ${bgColors[toast.type]}`}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="mt-0.5 flex-shrink-0">{icons[toast.type]}</div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${textColors[toast.type]}`}>{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
	        className="no-hover-lift flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600"
        aria-label="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  );
}
