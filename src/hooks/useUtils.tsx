import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = `${e.ctrlKey ? 'ctrl+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key.toLowerCase()}`;
    if (shortcuts[key]) {
      e.preventDefault();
      shortcuts[key]();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

import { useState, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>(null!);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} onClick={() => removeToast(toast.id)} style={{
            padding: '12px 20px', borderRadius: 10, color: '#fff', cursor: 'pointer',
            animation: 'slideInRight 0.3s ease',
            fontSize: 14, fontWeight: 500, minWidth: 280, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444'
              : toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
          }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
