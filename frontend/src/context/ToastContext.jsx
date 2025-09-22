import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext({ addToast: () => {}, removeToast: () => {} });

let idSeq = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // { id, type, message }

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, { type = 'info', timeout = 3500 } = {}) => {
    const id = idSeq++;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (timeout > 0) {
      setTimeout(() => removeToast(id), timeout);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({ addToast, removeToast, toasts }), [addToast, removeToast, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  return useContext(ToastContext);
}

export function Toasts() {
  const { toasts, removeToast } = useToast();
  return (
  <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)} style={{ cursor: 'pointer' }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
