import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { fmt } from '@/utils/formatters'

const GOAL_COLORS = ['#C4873A','#3A8F5C','#3A6EC4','#7C3AC4','#C43A3A','#C4A83A','#3AABC4','#C43A8F']
const GOAL_ICONS  = ['🛏️','✈️','💻','🏠','🎓','🚗','💍','🌴','📱','💰','🏋️','🎸']

const Ring = ({ pct, size=110, stroke=10, color='#C4873A' }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(pct,100) / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset 1.2s ease' }}/>
      <text x={size/2} y={size/2-5} textAnchor="middle"
        style={{ fontFamily:'var(--font)', fontSize:'10px', fill:'var(--text-3)' }}>meta</text>
      <text x={size/2} y={size/2+12} textAnchor="middle"
        style={{ fontFamily:'var(--font)', fontSize:'18px', fontWeight:700, fill:'var(--text-1)' }}>
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

const GoalForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name:     initial.name     || '',
    target:   initial.target   || '',
    icon:     initial.icon     || '🎯',
    color:    initial.color    || '#C4873A',
    currency: initial.currency || 'COP',
  })
  const set = (k,v) => setForm(p => ({...p, [k]:v}))
  return (
    <div className="pop" style={{ background:'var(--bg-card)', borderRadius:'var(--r)', padding:'18px', border:'1.5px solid var(--accent)', marginBottom:'14px' }}>
      <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'14px' }}>
        {initial.id ? 'Editar meta' : 'Nueva meta de ahorro'}
      </p>
      <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'6px' }}>Ícono</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px' }}>
        {GOAL_ICONS.map(ic => (
          <button key={ic} onClick={() => set('icon', ic)} style={{
            fontSize:'22px', padding:'6px', borderRadius:'var(--r-sm)',
            border:`1.5px solid ${form.icon===ic?'var(--accent)':'var(--border)'}`,
            background: form.icon===ic ? 'var(--accent-soft)' : 'var(--bg)',
          }}>{ic}</button>
        ))}
      </div>
      <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'6px' }}>Color</p>
      <div style={{ display:'flex', gap:'8px', marginBottom:'14px' }}>
        {GOAL_COLORS.map(c => (
          <button key={c} onClick={() => set('color', c)} style={{
            width:'28px', height:'28px', borderRadius:'50%', background:c, border:'none',
            outline: form.color===c ? `3px solid ${c}` : '2px solid transparent',
            outlineOffset:'2px', cursor:'pointer',
          }}/>
        ))}
      </div>
      {[['name','Nombre de la meta','text','ej: Viaje a México'],['target','Monto objetivo','number','ej: 3000000']].map(([k,l,t,ph]) => (
        <div key={k} style={{ marginBottom:'10px' }}>
          <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'4px' }}>{l}</p>
          <input type={t} placeholder={ph} value={form[k]} onChange={e => set(k, e.target.value)}
            style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'15px', background:'var(--bg)', color:'var(--text-1)', outline:'none' }}/>
        </div>
      ))}
      <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'6px' }}>Moneda</p>
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
        {['COP','USD'].map(c => (
          <button key={c} onClick={() => set('currency', c)} style={{
            flex:1, padding:'9px', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'13px',
            background: form.currency===c ? 'var(--text-1)' : 'var(--bg)',
            color: form.currency===c ? 'white' : 'var(--text-3)',
            border:`1.5px solid ${form.currency===c?'var(--text-1)':'var(--border)'}`,
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={() => onSave(form)} style={{ flex:2, padding:'13px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700 }}>
          {initial.id ? 'Guardar cambios' : 'Crear meta'}
        </button>
        <button onClick={onCancel} style={{ flex:1, padding:'13px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
      </div>
    </div>
  )
}

const TxForm = ({ goal, onConfirm, onCancel }) => {
  const [mode, setMode]     = useState('add')
  const [amount, setAmount] = useState('')
  return (
    <div className="pop" style={{ background:'var(--bg-card)', borderRadius:'var(--r-sm)', padding:'14px', border:'1.5px solid var(--border)', marginTop:'10px' }}>
      <div style={{ display:'flex', gap:'6px', marginBottom:'10px' }}>
        {[['add','+ Aportar'],['remove','− Retirar']].map(([v,l]) => (
          <button key={v} onClick={() => setMode(v)} style={{
            flex:1, padding:'8px', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'12px',
            background: mode===v ? (v==='add'?'var(--green)':'var(--red)') : 'var(--bg)',
            color: mode===v ? 'white' : 'var(--text-3)',
            border:`1.5px solid ${mode===v?(v==='add'?'var(--green)':'var(--red)'):'var(--border)'}`,
          }}>{l}</button>
        ))}
      </div>
      <input autoFocus type="number" value={amount} onChange={e => setAmount(e.target.value)}
        onKeyDown={e => e.key==='Enter' && onConfirm(mode, parseFloat(amount)||0)}
        placeholder={`Monto en ${goal.currency||'COP'}`}
        style={{ width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'18px', fontWeight:700, background:'var(--bg)', outline:'none', marginBottom:'8px', color:'var(--text-1)' }}/>
      <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={() => onConfirm(mode, parseFloat(amount)||0)} style={{
          flex:2, padding:'11px', background: mode==='add'?'var(--green)':'var(--red)',
          color:'white', borderRadius:'var(--r-sm)', fontWeight:700,
        }}>Confirmar</button>
        <button onClick={onCancel} style={{ flex:1, padding:'11px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Refugio() {
  const { goals, addGoal, updateGoal, deleteGoal, addGoalDeposit, profile, updateProfile, survivalMonths } = useStore()
  const { showToast } = useToast()
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [txGoal,      setTxGoal]      = useState(null)
  const [editProfile, setEditProfile] = useState(false)
  const [profForm,    setProfForm]    = useState({})

  const handleCreate = (form) => {
    if (!form.name || !form.target) { showToast('Nombre y monto son obligatorios','error'); return }
    addGoal(form); showToast('Meta creada ✓'); setShowNewGoal(false)
  }
  const handleUpdate = (form) => {
    if (!form.name || !form.target) { showToast('Nombre y monto son obligatorios','error'); return }
    updateGoal(editingGoal, { name:form.name, target:parseFloat(form.target)||0, icon:form.icon, color:form.color, currency:form.currency })
    showToast('Meta actualizada ✓'); setEditingGoal(null)
  }
  const handleDelete = (id) => {
    if (!confirm('¿Eliminar esta meta?')) return
    deleteGoal(id); showToast('Meta eliminada','warn')
  }
  const handleTx = (goalId, mode, amount) => {
    if (!amount || amount <= 0) { showToast('Monto inválido','error'); return }
    addGoalDeposit(goalId, mode==='add' ? amount : -amount)
    showToast(mode==='add' ? `Aporte registrado ✓` : `Retiro registrado`)
    setTxGoal(null)
  }

  return (
    <div style={{ paddingBottom:'32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 16px 14px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
        <p style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-.3px' }}>Metas & Refugio</p>
        <button onClick={() => { setProfForm({ name:profile?.name||'', monthlyIncome:profile?.monthlyIncome||'', fixedExpenses:profile?.fixedExpenses||'' }); setEditProfile(true) }}
          style={{ padding:'7px 12px', borderRadius:'100px', border:'1.5px solid var(--border)', fontSize:'11px', fontWeight:700, color:'var(--text-2)' }}>⚙️ Ajustes</button>
      </div>

      {editProfile && (
        <div style={{ margin:'14px 16px', background:'var(--accent-soft)', borderRadius:'var(--r)', padding:'16px', border:'1.5px solid var(--accent)' }} className="pop">
          <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'12px' }}>Configuración base</p>
          {[['name','Nombre','text'],['monthlyIncome','Ingresos mensuales','number'],['fixedExpenses','Gastos fijos (línea base)','number']].map(([k,l,t]) => (
            <div key={k} style={{ marginBottom:'10px' }}>
              <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-2)', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'.05em' }}>{l}</p>
              <input type={t} value={profForm[k]} onChange={e => setProfForm(p => ({...p,[k]:e.target.value}))}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'14px', background:'white', outline:'none' }}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button onClick={() => { updateProfile({ name:profForm.name, monthlyIncome:parseFloat(profForm.monthlyIncome)||0, fixedExpenses:parseFloat(profForm.fixedExpenses)||0 }); showToast('Guardado ✓'); setEditProfile(false) }}
              style={{ flex:2, padding:'12px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700 }}>Guardar</button>
            <button onClick={() => setEditProfile(false)} style={{ flex:1, padding:'12px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Survival */}
      <div style={{ margin:'14px 16px 0', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'14px 16px', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'14px' }}>
        <span style={{ fontSize:'28px' }}>🛡️</span>
        <div>
          <p style={{ fontSize:'10px', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em' }}>Fondo de supervivencia</p>
          <p style={{ fontSize:'20px', fontWeight:900 }}>{survivalMonths} <span style={{ fontSize:'12px', fontWeight:400, color:'var(--text-3)' }}>meses asegurados</span></p>
        </div>
      </div>

      <div style={{ padding:'14px 16px 0' }}>
        {showNewGoal
          ? <GoalForm onSave={handleCreate} onCancel={() => setShowNewGoal(false)}/>
          : <button onClick={() => setShowNewGoal(true)} style={{ width:'100%', padding:'13px', marginBottom:'4px', border:'1.5px dashed var(--accent)', borderRadius:'var(--r)', background:'transparent', color:'var(--accent)', fontSize:'13px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
              <span style={{ fontSize:'20px' }}>+</span> Nueva meta de ahorro
            </button>
        }
      </div>

      <div style={{ padding:'10px 16px', display:'flex', flexDirection:'column', gap:'14px' }}>
        {goals.length === 0 && !showNewGoal && (
          <p style={{ textAlign:'center', color:'var(--text-3)', padding:'32px 0', fontSize:'13px' }}>Crea tu primera meta arriba.</p>
        )}

        {goals.map(g => {
          const pct    = g.target > 0 ? Math.min(((g.saved||0)/g.target)*100, 100) : 0
          const remains = Math.max(0, g.target - (g.saved||0))
          const color   = g.color || '#C4873A'
          const icon    = g.icon  || '🎯'

          if (editingGoal === g.id) return (
            <GoalForm key={g.id} initial={g} onSave={handleUpdate} onCancel={() => setEditingGoal(null)}/>
          )

          return (
            <div key={g.id} style={{ background:'var(--bg-card)', borderRadius:'var(--r)', padding:'18px', border:'1px solid var(--border)', borderTop:`3px solid ${color}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ fontSize:'28px' }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:'16px', fontWeight:900, letterSpacing:'-.2px' }}>{g.name}</p>
                    <p style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'1px' }}>Objetivo: {fmt(g.target, g.currency||'COP')}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'4px' }}>
                  <button onClick={() => setEditingGoal(g.id)} style={{ fontSize:'16px', padding:'5px', color:'var(--blue)', opacity:.7 }}>✏️</button>
                  <button onClick={() => handleDelete(g.id)} style={{ fontSize:'16px', padding:'5px', color:'var(--red)', opacity:.7 }}>🗑️</button>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:'18px', marginBottom:'14px' }}>
                <Ring pct={pct} color={color}/>
                <div style={{ flex:1 }}>
                  {[['Ahorrado', g.saved||0, color],['Falta', remains, 'var(--text-2)']].map(([l,v,c]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                      <span style={{ fontSize:'12px', color:'var(--text-3)' }}>{l}</span>
                      <span style={{ fontSize:'14px', fontWeight:700, color:c }}>{fmt(v, g.currency||'COP')}</span>
                    </div>
                  ))}
                  <div style={{ height:'6px', background:'var(--border)', borderRadius:'100px', overflow:'hidden', marginTop:'4px' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'100px', transition:'width 1.2s ease' }}/>
                  </div>
                </div>
              </div>

              <p style={{ fontSize:'12px', color:'var(--text-2)', fontStyle:'italic', marginBottom:'14px', lineHeight:1.5 }}>
                {pct>=100 ? '✨ ¡Meta cumplida!' : pct>=60 ? '¡Casi! Sigue el ritmo.' : pct>=25 ? 'Buen avance. Cada aporte suma.' : 'El primer paso ya está dado.'}
              </p>

              {txGoal === g.id
                ? <TxForm goal={g} onConfirm={(mode, amt) => handleTx(g.id, mode, amt)} onCancel={() => setTxGoal(null)}/>
                : <button onClick={() => setTxGoal(g.id)} style={{ width:'100%', padding:'12px', background:'var(--text-1)', color:'white', border:'none', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'13px' }}>Mover dinero →</button>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}
