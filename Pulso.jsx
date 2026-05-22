import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { fmt, fmtCompact, monthProgress } from '@/utils/formatters'

const Ring = ({ pct, size=90, stroke=8, color='var(--accent)', label, sub }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct,100) / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset 1s ease' }}/>
      <text x={size/2} y={size/2-5} textAnchor="middle"
        style={{ fontFamily:'var(--font)', fontSize:'9px', fill:'var(--text-3)' }}>{label}</text>
      <text x={size/2} y={size/2+9} textAnchor="middle"
        style={{ fontFamily:'var(--font)', fontSize:'14px', fontWeight:700, fill:'var(--text-1)' }}>{sub}</text>
    </svg>
  )
}

const RuleBar = ({ label, spent, target, color }) => {
  const pct = target > 0 ? Math.min((spent/target)*100, 100) : 0
  const over = spent > target
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
        <span style={{ fontSize:'12px', color:'var(--text-2)', fontWeight:500 }}>{label}</span>
        <span style={{ fontSize:'12px', fontWeight:700, color: over ? 'var(--red)' : 'var(--text-2)' }}>
          {fmtCompact(spent)} / {fmtCompact(target)}
        </span>
      </div>
      <div style={{ height:'7px', background:'var(--border)', borderRadius:'100px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background: over ? 'var(--red)' : color, borderRadius:'100px', transition:'width 1s ease' }}/>
      </div>
    </div>
  )
}

// Quick income entry inline on Pulso
const QuickIncomeForm = ({ onAdd, onClose }) => {
  const [amount, setAmount] = useState('')
  const [desc, setDesc]     = useState('')
  const submit = () => {
    const v = parseFloat(amount)
    if (!v || v <= 0) return
    onAdd(v, desc || 'Ingreso del mes')
    setAmount(''); setDesc('')
  }
  return (
    <div className="pop" style={{
      background:'var(--green-soft)', borderRadius:'var(--r)',
      padding:'14px', border:'1.5px solid var(--green)', marginBottom:'12px',
    }}>
      <p style={{ fontSize:'12px', fontWeight:700, color:'var(--green)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'.06em' }}>
        Registrar ingreso
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        <input
          autoFocus type="number" placeholder="Monto (ej: 800000)"
          value={amount} onChange={e => setAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ padding:'11px 14px', border:'1.5px solid var(--green)', borderRadius:'var(--r-sm)', fontSize:'18px', fontWeight:700, background:'white', outline:'none', color:'var(--text-1)' }}
        />
        <input
          type="text" placeholder="Descripción (ej: Cliente Relation Line)"
          value={desc} onChange={e => setDesc(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          style={{ padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'13px', background:'white', outline:'none', color:'var(--text-1)' }}
        />
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={submit} style={{
            flex:2, padding:'12px', background:'var(--green)', color:'white',
            borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'14px', border:'none',
          }}>✓ Confirmar ingreso</button>
          <button onClick={onClose} style={{
            flex:1, padding:'12px', border:'1px solid var(--border)',
            borderRadius:'var(--r-sm)', color:'var(--text-3)', background:'transparent',
          }}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

export default function Pulso() {
  const {
    profile, totalIncome, totalExpense, effectiveIncome, balance,
    rule50, rule30, rule20, investmentCapital,
    survivalMonths, stressMode, setStressMode,
    addMovement, currentMonthMovements,
  } = useStore()
  const { showToast }       = useToast()
  const [showIncome, setShowIncome] = useState(false)

  const expPct = effectiveIncome > 0 ? Math.round((totalExpense / effectiveIncome) * 100) : 0
  const bColor = balance >= 0 ? 'var(--green)' : 'var(--red)'

  const insight = (() => {
    if (stressMode)            return `⚠️ Simulación -30%: tu flujo quedaría en ${fmt(effectiveIncome - totalExpense)}. Prepara un plan B.`
    if (totalIncome === 0)     return `Hola ${profile?.name?.split(' ')[0]}. Toca "+ Ingreso" para registrar lo que entraste este mes y activar el análisis.`
    if (balance < 0)           return `${profile?.name?.split(' ')[0]}, los gastos superan los ingresos. Revisa los gastos hormiga antes de fin de mes.`
    if (expPct > 50)           return `Atención: llevas un ${expPct}% de tus ingresos en gastos. El límite saludable es 50%. Congela el estilo de vida.`
    if (investmentCapital > 0) return `Excelente. Tienes ${fmt(investmentCapital)} disponibles para invertir. No los conviertas en consumo.`
    return `${profile?.name?.split(' ')[0]}, todo en orden. Línea base congelada. Acumula capital este mes.`
  })()

  const handleAddIncome = (amount, description) => {
    addMovement({ type:'income', amount, category:'cliente', description })
    showToast(`+${fmt(amount)} registrado ✓`)
    setShowIncome(false)
  }

  const exportCSV = () => {
    const header = 'Fecha,Descripción,Categoría,Tipo,Monto\n'
    const rows   = currentMonthMovements.map(m =>
      `${m.date},"${m.description||''}",${m.category||''},${m.type},${m.amount}`).join('\n')
    const summary = `\n\nRESUMEN\nIngresos,${totalIncome}\nGastos,${totalExpense}\nBalance,${balance}\nCapital Inversión,${investmentCapital}\nMeses supervivencia,${survivalMonths}`
    const blob = new Blob([header+rows+summary], { type:'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href:url, download:`mindset-finance.csv` })
    a.click(); URL.revokeObjectURL(url)
    showToast('Informe exportado ✓')
  }

  return (
    <div style={{ paddingBottom:'32px' }}>
      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 16px 14px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
        <div>
          <p style={{ fontSize:'10px', fontWeight:700, color:'var(--accent)', letterSpacing:'.1em', textTransform:'uppercase' }}>Mindset Finance</p>
          <p style={{ fontSize:'22px', fontWeight:900, letterSpacing:'-.5px' }}>{profile?.name?.split(' ')[0]}</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => { setStressMode(!stressMode); showToast(stressMode ? 'Modo normal' : 'Simulando -30%', 'warn') }} style={{
            padding:'7px 11px', borderRadius:'100px',
            border:`1.5px solid ${stressMode ? 'var(--red)' : 'var(--border)'}`,
            background: stressMode ? 'var(--red-soft)' : 'transparent',
            color: stressMode ? 'var(--red)' : 'var(--text-3)',
            fontSize:'11px', fontWeight:700,
          }}>{stressMode ? '🔥 Estrés' : '⚡ Simular'}</button>
          <button onClick={exportCSV} style={{
            padding:'7px 11px', borderRadius:'100px', border:'1.5px solid var(--border)',
            fontSize:'11px', fontWeight:700, color:'var(--text-2)',
          }}>↓ CSV</button>
        </div>
      </div>

      {/* Insight */}
      <div className="fade-up" style={{
        margin:'14px 16px', padding:'14px 16px', borderRadius:'var(--r)',
        background: balance < 0 ? 'var(--red-soft)' : expPct > 50 ? 'var(--yellow-soft)' : 'var(--accent-soft)',
        borderLeft:`3px solid ${balance < 0 ? 'var(--red)' : expPct > 50 ? 'var(--yellow)' : 'var(--accent)'}`,
      }}>
        <p style={{ fontSize:'13px', lineHeight:1.6, color:'var(--text-1)' }}>{insight}</p>
      </div>

      {/* Quick income form */}
      <div style={{ padding:'0 16px' }}>
        {showIncome
          ? <QuickIncomeForm onAdd={handleAddIncome} onClose={() => setShowIncome(false)} />
          : (
            <button onClick={() => setShowIncome(true)} style={{
              width:'100%', padding:'12px', marginBottom:'12px',
              border:'1.5px dashed var(--green)', borderRadius:'var(--r)',
              background:'transparent', color:'var(--green)',
              fontSize:'13px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
            }}>
              <span style={{ fontSize:'18px' }}>+</span> Registrar ingreso de este mes
            </button>
          )
        }
      </div>

      {/* Balance row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', padding:'0 16px 12px' }}>
        <div style={{ background:'var(--green-soft)', borderRadius:'var(--r)', padding:'14px' }}>
          <p style={{ fontSize:'10px', fontWeight:700, color:'var(--green)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'6px' }}>Ingresos</p>
          <p style={{ fontSize:'24px', fontWeight:900, color:'var(--green)' }}>{fmtCompact(totalIncome)}</p>
          <p style={{ fontSize:'11px', color:'var(--green)', opacity:.6, marginTop:'3px' }}>
            {currentMonthMovements.filter(m => m.type === 'income').length} movimiento(s)
          </p>
        </div>
        <div style={{ background: expPct > 50 ? 'var(--red-soft)' : 'var(--bg-card)', borderRadius:'var(--r)', padding:'14px', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:'10px', fontWeight:700, color: expPct > 50 ? 'var(--red)' : 'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'6px' }}>Gastos</p>
          <p style={{ fontSize:'24px', fontWeight:900, color: expPct > 50 ? 'var(--red)' : 'var(--text-1)' }}>{fmtCompact(totalExpense)}</p>
          <p style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'3px' }}>{expPct}% de ingresos</p>
        </div>
      </div>

      {/* Net balance */}
      <div style={{ margin:'0 16px 12px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontSize:'10px', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'4px' }}>Balance neto</p>
          <p style={{ fontSize:'32px', fontWeight:900, color:bColor, letterSpacing:'-1px' }}>
            {balance >= 0 ? '+' : ''}{fmtCompact(Math.abs(balance))}
          </p>
        </div>
        <Ring pct={monthProgress()} label="mes" sub={`${monthProgress()}%`} />
      </div>

      {/* 50/30/20 */}
      <div style={{ margin:'0 16px 12px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)' }}>
        <p style={{ fontSize:'10px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'14px' }}>Regla 50 / 30 / 20</p>
        <RuleBar label="50% Estilo de vida" spent={totalExpense} target={rule50} color="var(--green)" />
        <RuleBar label="30% Reinversión"    spent={rule30}       target={rule30} color="var(--blue)" />
        <RuleBar label="20% Inversión"      spent={rule20}       target={rule20} color="var(--purple)" />
        {expPct > 50 && (
          <p style={{ fontSize:'12px', color:'var(--red)', background:'var(--red-soft)', padding:'8px 12px', borderRadius:'var(--r-sm)', marginTop:'8px', fontWeight:500 }}>
            ⚠ Gastos superan el 50%. Congela nuevos gastos de estilo de vida.
          </p>
        )}
      </div>

      {/* Investment capital */}
      <div style={{ margin:'0 16px 12px', borderRadius:'var(--r)', padding:'18px', background:'linear-gradient(135deg,#1A1814 0%,#3a2d1a 100%)' }}>
        <p style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:'6px' }}>Capital para Inversión</p>
        <p style={{ fontSize:'34px', fontWeight:900, color:'#F0DEC4', letterSpacing:'-1px' }}>{fmtCompact(investmentCapital)}</p>
        <p style={{ fontSize:'12px', color:'rgba(255,255,255,.4)', marginTop:'4px' }}>Excedente sobre línea base congelada</p>
        <div style={{ marginTop:'12px', height:'4px', background:'rgba(255,255,255,.12)', borderRadius:'100px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${effectiveIncome > 0 ? Math.min(investmentCapital / effectiveIncome * 100, 100) : 0}%`, background:'var(--accent-soft)', borderRadius:'100px', transition:'width 1s ease' }} />
        </div>
      </div>

      {/* Survival */}
      <div style={{ margin:'0 16px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'14px' }}>
        <span style={{ fontSize:'30px' }}>🛡️</span>
        <div>
          <p style={{ fontSize:'10px', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em' }}>Fondo de supervivencia</p>
          <p style={{ fontSize:'22px', fontWeight:900 }}>
            {survivalMonths} <span style={{ fontSize:'13px', fontWeight:400, color:'var(--text-3)' }}>meses asegurados</span>
          </p>
        </div>
      </div>
    </div>
  )
}
