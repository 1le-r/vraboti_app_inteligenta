import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const toast = useCallback((text) => {
    setMsg({ text, id: Date.now() });
    setTimeout(() => setMsg((m) => (m && m.text === text ? null : m)), 2600);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {msg && <div className="toast" key={msg.id} role="status">{msg.text}</div>}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
