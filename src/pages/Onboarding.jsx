import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'

const Field = ({ label, hint, ...props }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
    <label style={{ fontSize:'12px', fontWeight:600, color:'var(--text-2)', letterSpacing:'.05em', textTransform:'uppercase' }}>{label}</label>
    {hint && <p style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'-2px' }}>{hint}</p>}
    <input {...props} style={{
      padding:'14px 16px', border:'1.5px solid var(--border)', borderRadius:'var(--r)',
      fontSize:'16px', background:'var(--bg-card)', color:'var(--text-1)', outline:'none',
      transition:'border-color var(--t)',
      ...props.style,
    }}
    onFocus={e => e.target.style.borderColor='var(--accent)'}
    onBlur={e => e.target.style.borderColor='var(--border)'}
    />
  </div>
)

export default function Onboarding() {
  const { saveProfile } = useStore()
  const { showToast }   = useToast()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', monthlyIncome: '', fixedExpenses: '',
    goalName: 'Cama + Colchón', goalTarget: '',
  })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleStart = () => {
    if (!form.name || !form.monthlyIncome || !form.fixedExpenses) {
      showToast('Completa todos los campos', 'error'); return
    }
    saveProfile({
      name:          form.name.trim(),
      monthlyIncome: parseFloat(form.monthlyIncome) || 0,
      fixedExpenses: parseFloat(form.fixedExpenses) || 0,
      goalName:      form.goalName || 'Meta de ahorro',
      goalTarget:    parseFloat(form.goalTarget) || 1500000,
    })
  }

  return (
    <div style={{
      minHeight:'100dvh', display:'flex', flexDirection:'column',
      background:'var(--bg)', padding:'0 24px',
    }}>
      {/* Header */}
      <div style={{ paddingTop:'60px', paddingBottom:'32px' }}>
        <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'.1em', color:'var(--accent)', textTransform:'uppercase', marginBottom:'12px' }}>
          Mindset Finance
        </p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'38px', lineHeight:1.15, color:'var(--text-1)' }}>
          Toma el<br/><em>control</em> de<br/>tu dinero.
        </h1>
        <p style={{ marginTop:'14px', fontSize:'14px', color:'var(--text-2)', lineHeight:1.6 }}>
          Configura tu línea base. Será la referencia fija para medir tu crecimiento.
        </p>
      </div>

      {/* Form */}
      <div style={{ display:'flex', flexDirection:'column', gap:'18px', flex:1 }}>
        <Field
          label="Tu nombre"
          placeholder="María"
          value={form.name}
          onChange={e => set('name', e.target.value)}
        />
        <Field
          label="Ingresos mensuales promedio"
          hint="En USD o en la moneda que uses habitualmente"
          type="number"
          placeholder="800"
          value={form.monthlyIncome}
          onChange={e => set('monthlyIncome', e.target.value)}
        />
        <Field
          label="Gastos fijos operativos actuales"
          hint="Arriendo, colegio, internet, suscripciones — todo lo fijo"
          type="number"
          placeholder="1200000"
          value={form.fixedExpenses}
          onChange={e => set('fixedExpenses', e.target.value)}
        />

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'18px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <p style={{ fontSize:'12px', fontWeight:600, color:'var(--text-2)', letterSpacing:'.05em', textTransform:'uppercase' }}>Meta principal de ahorro</p>
          <Field
            label="Nombre de la meta"
            placeholder="Cama + Colchón"
            value={form.goalName}
            onChange={e => set('goalName', e.target.value)}
          />
          <Field
            label="Monto objetivo (COP)"
            type="number"
            placeholder="1500000"
            value={form.goalTarget}
            onChange={e => set('goalTarget', e.target.value)}
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'24px 0 48px' }}>
        <button
          onClick={handleStart}
          style={{
            width:'100%', padding:'18px', background:'var(--text-1)',
            color:'var(--bg-card)', border:'none', borderRadius:'var(--r-lg)',
            fontSize:'16px', fontWeight:700, letterSpacing:'.03em',
          }}
        >
          Comenzar →
        </button>
        <p style={{ textAlign:'center', marginTop:'12px', fontSize:'11px', color:'var(--text-3)' }}>
          Tus datos se guardan localmente en tu navegador.
        </p>
      </div>
    </div>
  )
}
