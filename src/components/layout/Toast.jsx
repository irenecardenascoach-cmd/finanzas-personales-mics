import { useToast } from '@/hooks/useToast'
export default function Toast() {
  const { toast } = useToast()
  if (!toast) return null
  const bg = toast.type==='error'?'var(--red)':toast.type==='warn'?'var(--yellow)':'var(--text-1)'
  return (
    <div className="fade-in" style={{
      position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',
      background:bg,color:'var(--bg-card)',padding:'11px 22px',
      borderRadius:'100px',fontSize:'13px',fontFamily:'var(--font)',fontWeight:500,
      zIndex:999,whiteSpace:'nowrap',boxShadow:'var(--sh-lg)',
    }}>{toast.msg}</div>
  )
}
