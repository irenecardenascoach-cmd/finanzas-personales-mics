import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { fmt, fmtCompact } from '@/utils/formatters'

export default function Refugio() {
  const { goals, updateGoal, addGoalDeposit, profile, updateProfile } = useStore()
  const { showToast } = useToast()

  // Edit goal state
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalForm, setGoalForm]       = useState({})

  // Deposit/withdraw state
  const [txGoal, setTxGoal]   = useState(null) // goal id
  const [txMode, setTxMode]   = useState('add') // add | remove
  const [txAmt, setTxAmt]     = useState('')

  // Edit profile state
  const [editProfile, setEditProfile] = useState(false)
  const [profForm, setProfForm]       = useState({})

  const startEditGoal = (g) => {
    setEditingGoal(g.id)
    setGoalForm({ name: g.name, target: g.target })
  }
  const saveGoal = () => {
    updateGoal(editingGoal, { name: goalForm.name, target: parseFloat(goalForm.target)||0 })
    showToast('Meta actualizada ✓')
    setEditingGoal(null)
  }

  const handleTx = () => {
    const amt = parseFloat(txAmt)||0
    if (!amt) { showToast('Ingresa un monto','error'); return }
    addGoalDeposit(txGoal, txMode==='add' ? amt : -amt)
    showToast(txMode==='add'?`+${fmt(amt)} aportado ✓`:`-${fmt(amt)} retirado`)
    setTxGoal(null); setTxAmt('')
  }

  const openTx = (id, mode) => { setTxGoal(id); setTxMode(mode); setTxAmt('') }

  const startEditProfile = () => {
    setProfForm({ monthlyIncome: profile?.monthlyIncome||'', fixedExpenses: profile?.fixedExpenses||'', name: profile?.name||'' })
    setEditProfile(true)
  }
  const saveProfile = () => {
    updateProfile({
      name: profForm.name,
      monthlyIncome: parseFloat(profForm.monthlyIncome)||0,
      fixedExpenses: parseFloat(profForm.fixedExpenses)||0,
    })
    showToast('Configuración guardada ✓')
    setEditProfile(false)
  }

  return (
    <div style={{ paddingBottom:'32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 16px 14px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
        <p style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-.3px' }}>Metas & Refugio</p>
        <button onClick={startEditProfile} style={{
          padding:'7px 12px', borderRadius:'100px', border:'1.5px solid var(--border)',
          fontSize:'11px', fontWeight:700, color:'var(--text-2)',
        }}>⚙️ Ajustes</button>
      </div>

      {/* Edit profile modal */}
      {editProfile && (
        <div style={{ margin:'14px 16px', background:'var(--accent-soft)', borderRadius:'var(--r)', padding:'16px', border:'1.5px solid var(--accent)' }} className="pop">
          <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'12px' }}>Editar configuración base</p>
          {[
            ['name','Nombre','text'],
            ['monthlyIncome','Ingresos mensuales','number'],
            ['fixedExpenses','Gastos fijos (línea base)','number'],
          ].map(([k,l,t])=>(
            <div key={k} style={{ marginBottom:'10px' }}>
              <p style={{ fontSize:'11px', fontWeight:600, color:'var(--text-2)', marginBottom:'4px' }}>{l}</p>
              <input type={t} value={profForm[k]} onChange={e=>setProfForm(p=>({...p,[k]:e.target.value}))}
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'14px', background:'white', outline:'none' }}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button onClick={saveProfile} style={{ flex:2, padding:'12px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700 }}>Guardar</button>
            <button onClick={()=>setEditProfile(false)} style={{ flex:1, padding:'12px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Goals */}
      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'14px' }}>
        {goals.map(g => {
          const pct     = g.target > 0 ? Math.min((g.saved/g.target)*100, 100) : 0
          const pctRnd  = Math.round(pct)
          const remains = Math.max(0, g.target - g.saved)
          const r=58, circ=2*Math.PI*r, offset=circ*(1-pct/100)

          if (editingGoal === g.id) return (
            <div key={g.id} className="pop" style={{ background:'var(--accent-soft)', borderRadius:'var(--r)', padding:'16px', border:'1.5px solid var(--accent)' }}>
              <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'12px' }}>Editar meta</p>
              <input type="text" value={goalForm.name} onChange={e=>setGoalForm(p=>({...p,name:e.target.value}))}
                placeholder="Nombre de la meta"
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'14px', background:'white', marginBottom:'8px', outline:'none' }}/>
              <input type="number" value={goalForm.target} onChange={e=>setGoalForm(p=>({...p,target:e.target.value}))}
                placeholder="Monto objetivo"
                style={{ width:'100%', padding:'10px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'14px', background:'white', marginBottom:'12px', outline:'none' }}/>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={saveGoal} style={{ flex:2, padding:'12px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700 }}>Guardar</button>
                <button onClick={()=>setEditingGoal(null)} style={{ flex:1, padding:'12px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
              </div>
            </div>
          )

          return (
            <div key={g.id} style={{ background:'var(--bg-card)', borderRadius:'var(--r)', padding:'18px', border:'1px solid var(--border)' }}>
              {/* Goal header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px' }}>
                <div>
                  <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'3px' }}>Meta activa</p>
                  <p style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-.3px' }}>{g.name}</p>
                </div>
                <button onClick={()=>startEditGoal(g)} style={{ fontSize:'18px', opacity:.6, color:'var(--blue)', padding:'4px' }} title="Editar meta">✏️</button>
              </div>

              {/* Ring */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'18px' }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border)" strokeWidth="10"/>
                  <circle cx="65" cy="65" r={r} fill="none"
                    stroke={pct>=100?'var(--green)':'var(--accent)'} strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                    transform="rotate(-90 65 65)" style={{ transition:'stroke-dashoffset 1.2s ease' }}/>
                  <text x="65" y="58" textAnchor="middle" style={{ fontFamily:'var(--font)', fontSize:'10px', fill:'var(--text-3)' }}>ahorrado</text>
                  <text x="65" y="76" textAnchor="middle" style={{ fontFamily:'var(--font)', fontSize:'20px', fontWeight:'700', fill:'var(--text-1)' }}>{pctRnd}%</text>
                </svg>
              </div>

              {/* Numbers */}
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px', padding:'12px', background:'var(--bg)', borderRadius:'var(--r-sm)' }}>
                {[
                  ['Ahorrado','var(--green)',g.saved],
                  ['Falta','var(--text-2)',remains],
                  ['Objetivo','var(--text-1)',g.target],
                ].map(([l,c,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'12px', color:'var(--text-3)' }}>{l}</span>
                    <span style={{ fontSize:'13px', fontWeight:700, color:c }}>{fmt(v, g.currency||'COP')}</span>
                  </div>
                ))}
              </div>

              {/* Message */}
              <p style={{ fontSize:'13px', color:'var(--text-2)', fontStyle:'italic', marginBottom:'16px', lineHeight:1.5 }}>
                {pct>=100 ? '✨ ¡Meta cumplida!' : pct>=60 ? '¡Casi llegas! Sigue así.' : pct>=25 ? 'Buen progreso. Cada aporte cuenta.' : 'Primer paso dado. La constancia es el secreto.'}
              </p>

              {/* TX form */}
              {txGoal===g.id ? (
                <div className="pop" style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {['add','remove'].map(m=>(
                      <button key={m} onClick={()=>setTxMode(m)} style={{
                        flex:1, padding:'8px', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'12px',
                        background: txMode===m?(m==='add'?'var(--green)':'var(--red)'):'var(--bg)',
                        color: txMode===m?'white':'var(--text-3)',
                        border:`1.5px solid ${txMode===m?(m==='add'?'var(--green)':'var(--red)'):'var(--border)'}`,
                      }}>{m==='add'?'+ Aportar':'- Retirar'}</button>
                    ))}
                  </div>
                  <input type="number" autoFocus value={txAmt} onChange={e=>setTxAmt(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&handleTx()}
                    placeholder="Monto" style={{ padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'16px', fontWeight:700, background:'white', outline:'none' }}/>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={handleTx} style={{ flex:2, padding:'12px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700 }}>Confirmar</button>
                    <button onClick={()=>setTxGoal(null)} style={{ flex:1, padding:'12px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={()=>openTx(g.id,'add')} style={{ flex:2, padding:'12px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'13px' }}>+ Aportar</button>
                  <button onClick={()=>openTx(g.id,'remove')} style={{ flex:1, padding:'12px', border:'1.5px solid var(--red)', color:'var(--red)', borderRadius:'var(--r-sm)', fontWeight:700, fontSize:'13px', background:'transparent' }}>Retirar</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
