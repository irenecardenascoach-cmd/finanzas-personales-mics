import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'

export default function Auth() {
  const { signup, login } = useStore()
  const { showToast }     = useToast()
  const [mode, setMode]   = useState('login') // login | signup
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) { showToast('Completa todos los campos', 'error'); return }
    setLoading(true)

    if (mode === 'signup') {
      if (!form.name) { showToast('Ingresa tu nombre', 'error'); setLoading(false); return }
      if (form.password !== form.confirm) { showToast('Las contraseñas no coinciden', 'error'); setLoading(false); return }
      if (form.password.length < 6) { showToast('Mínimo 6 caracteres', 'error'); setLoading(false); return }
      const result = signup(form.email.trim().toLowerCase(), form.password, form.name.trim())
      if (!result.ok) { showToast(result.error, 'error'); setLoading(false); return }
      showToast(`Bienvenida, ${form.name.split(' ')[0]} ✓`)
    } else {
      const result = login(form.email.trim().toLowerCase(), form.password)
      if (!result.ok) { showToast(result.error, 'error'); setLoading(false); return }
      showToast('Bienvenida de nuevo ✓')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      background:'var(--bg)', padding:'0 24px',
    }}>
      {/* Header */}
      <div style={{ paddingTop:'64px', paddingBottom:'40px', textAlign:'center' }}>
        <p style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:'14px' }}>
          Mindset Finance
        </p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'40px', lineHeight:1.1, color:'var(--text-1)' }}>
          {mode === 'login' ? <>Bienvenida<br/><em>de vuelta.</em></> : <>Empieza a<br/><em>crecer.</em></>}
        </h1>
      </div>

      {/* Mode tabs */}
      <div style={{ display:'flex', background:'var(--border)', borderRadius:'var(--r)', padding:'3px', gap:'2px', marginBottom:'24px' }}>
        {[['login','Iniciar sesión'],['signup','Crear cuenta']].map(([v,l]) => (
          <button key={v} onClick={() => setMode(v)} style={{
            flex:1, padding:'11px', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'13px',
            background: mode===v ? 'var(--bg-card)' : 'transparent',
            color: mode===v ? 'var(--text-1)' : 'var(--text-3)',
            border:'none', boxShadow: mode===v ? 'var(--sh-sm)' : 'none',
            transition:'all var(--t)',
          }}>{l}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display:'flex', flexDirection:'column', gap:'14px', flex:1 }}>
        {mode === 'signup' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'12px', fontWeight:600, color:'var(--text-2)', letterSpacing:'.05em', textTransform:'uppercase' }}>Nombre</label>
            <input
              type="text" placeholder="Tu nombre completo" value={form.name}
              onChange={e => set('name', e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <label style={{ fontSize:'12px', fontWeight:600, color:'var(--text-2)', letterSpacing:'.05em', textTransform:'uppercase' }}>Correo electrónico</label>
          <input
            type="email" placeholder="tu@correo.com" value={form.email}
            onChange={e => set('email', e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor='var(--accent)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <label style={{ fontSize:'12px', fontWeight:600, color:'var(--text-2)', letterSpacing:'.05em', textTransform:'uppercase' }}>Contraseña</label>
          <input
            type="password" placeholder="Mínimo 6 caracteres" value={form.password}
            onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSubmit()}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor='var(--accent)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </div>

        {mode === 'signup' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            <label style={{ fontSize:'12px', fontWeight:600, color:'var(--text-2)', letterSpacing:'.05em', textTransform:'uppercase' }}>Confirmar contraseña</label>
            <input
              type="password" placeholder="Repite tu contraseña" value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSubmit()}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor='var(--accent)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding:'28px 0 52px' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width:'100%', padding:'18px', background:'var(--text-1)',
            color:'var(--bg-card)', border:'none', borderRadius:'var(--r-lg)',
            fontSize:'16px', fontWeight:700, letterSpacing:'.03em',
            opacity: loading ? .6 : 1, transition:'opacity var(--t)',
          }}
        >
          {loading ? '...' : mode === 'login' ? 'Entrar →' : 'Crear cuenta →'}
        </button>
        <p style={{ textAlign:'center', marginTop:'14px', fontSize:'11px', color:'var(--text-3)', lineHeight:1.5 }}>
          Tus datos se guardan localmente en este dispositivo.{'\n'}No se envían a ningún servidor externo.
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  padding:'14px 16px',
  border:'1.5px solid var(--border)',
  borderRadius:'var(--r)',
  fontSize:'15px',
  background:'var(--bg-card)',
  color:'var(--text-1)',
  outline:'none',
  transition:'border-color var(--t)',
  width:'100%',
}
