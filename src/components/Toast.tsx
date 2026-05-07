'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ToastKind = 'success' | 'error';
type Toast = { id: number; kind: ToastKind; message: string };

type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((kind: ToastKind, message: string) => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), kind, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={() => setToasts((p) => p.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  const cls =
    toast.kind === 'success'
      ? 'bg-emerald-600 text-white'
      : 'bg-rose-600 text-white';

  return (
    <div className={`pointer-events-auto rounded-md px-4 py-2 text-sm shadow-lg ${cls}`}>{toast.message}</div>
  );
}
