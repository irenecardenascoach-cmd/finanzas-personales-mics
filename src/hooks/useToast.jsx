import { createContext, useContext, useState, useCallback } from 'react'
const ToastCtx = createContext(null)
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null)
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }, [])
  return <ToastCtx.Provider value={{ toast, showToast }}>{children}</ToastCtx.Provider>
}
export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast outside ToastProvider')
  return ctx
}
