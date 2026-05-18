import { useToast } from '@/hooks/useToast'

export default function Toast() {
  const { toast } = useToast()
  if (!toast) return null

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--text-primary)',
      color: 'var(--bg-card)',
      padding: '12px 24px',
      borderRadius: '100px',
      fontSize: '13px',
      fontFamily: 'var(--font)',
      fontWeight: 500,
      zIndex: 999,
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-lg)',
      animation: 'fadeIn 0.25s ease both',
    }}>
      {toast.mensaje}
    </div>
  )
}
