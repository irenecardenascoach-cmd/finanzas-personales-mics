import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useToast } from '@/hooks/useToast'
import { fmt, shortDate } from '@/utils/formatters'

const CATEGORIES = [
  { id:'arriendo',   label:'Arriendo',       icon:'🏠', type:'expense' },
  { id:'colegio',    label:'Colegio Isaac',   icon:'📚', type:'expense' },
  { id:'internet',   label:'Internet/Cel',   icon:'📡', type:'expense' },
  { id:'servicios',  label:'Servicios',       icon:'💡', type:'expense' },
  { id:'comida',     label:'Comida',          icon:'🥗', type:'expense' },
  { id:'transporte', label:'Transporte',      icon:'🚌', type:'expense' },
  { id:'cuidado',    label:'Cuidado',         icon:'🧴', type:'expense' },
  { id:'lifestyle',  label:'Estilo Vida',     icon:'🌀', type:'expense' },
  { id:'edicion',    label:'Edición video',   icon:'🎬', type:'expense' },
  { id:'ia_tools',   label:'Herr. IA',        icon:'🤖', type:'expense' },
  { id:'publicidad', label:'Publicidad',      icon:'📣', type:'expense' },
  { id:'otro_gasto', label:'Otro gasto',      icon:'💸', type:'expense' },
  { id:'cliente',    label:'Cliente',         icon:'💼', type:'income' },
  { id:'horas',      label:'Por horas',       icon:'⏱️', type:'income' },
  { id:'otro_ingreso', label:'Otro ingreso',  icon:'💵', type:'income' },
]

const catById = (id) => CATEGORIES.find(c=>c.id===id) || { icon:'💰', label:id }

export default function Registro() {
  const { addMovement, updateMovement, deleteMovement, currentMonthMovements } = useStore()
  const { showToast } = useToast()

  // Form state
  const [mode, setMode]         = useState('expense') // expense | income
  const [amount, setAmount]     = useState('')
  const [desc, setDesc]         = useState('')
  const [cat, setCat]           = useState('comida')
  const [hourly, setHourly]     = useState({ rate:'', hours:'' })

  // Edit state
  const [editing, setEditing]   = useState(null) // movement id
  const [editData, setEditData] = useState({})

  const incomeCategories  = CATEGORIES.filter(c=>c.type==='income')
  const expenseCategories = CATEGORIES.filter(c=>c.type==='expense')
  const shownCats         = mode==='income' ? incomeCategories : expenseCategories

  const computedAmount = cat==='horas'
    ? (parseFloat(hourly.rate)||0) * (parseFloat(hourly.hours)||0)
    : parseFloat(amount)||0

  const handleAdd = () => {
    const finalAmt = computedAmount
    if (!finalAmt || finalAmt <= 0) { showToast('Ingresa un monto válido', 'error'); return }
    addMovement({
      type:        mode,
      amount:      finalAmt,
      category:    cat,
      description: desc || catById(cat).label,
    })
    showToast(`${catById(cat).icon} Registrado ✓`)
    setAmount(''); setDesc(''); setHourly({ rate:'', hours:'' })
  }

  const startEdit = (m) => {
    setEditing(m.id)
    setEditData({ amount: m.amount, description: m.description||'', category: m.category })
  }

  const saveEdit = () => {
    updateMovement(editing, {
      amount:      parseFloat(editData.amount)||0,
      description: editData.description,
      category:    editData.category,
    })
    showToast('Actualizado ✓')
    setEditing(null)
  }

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar este movimiento?')) return
    deleteMovement(id)
    showToast('Eliminado', 'warn')
  }

  // Sort: most recent first
  const sorted = [...currentMonthMovements].sort((a,b) => new Date(b.date)-new Date(a.date))

  return (
    <div style={{ paddingBottom:'32px' }}>
      {/* Header */}
      <div style={{ padding:'18px 16px 14px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
        <p style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-.3px' }}>Registrar</p>
      </div>

      {/* Type toggle */}
      <div style={{ display:'flex', gap:'8px', padding:'14px 16px 0' }}>
        {['expense','income'].map(t=>(
          <button key={t} onClick={()=>{ setMode(t); setCat(t==='income'?'cliente':'comida') }} style={{
            flex:1, padding:'11px', borderRadius:'var(--r)', fontWeight:700, fontSize:'13px',
            background: mode===t ? (t==='expense'?'var(--red)':'var(--green)') : 'var(--bg-card)',
            color: mode===t ? 'white' : 'var(--text-3)',
            border: `1.5px solid ${mode===t?(t==='expense'?'var(--red)':'var(--green)'):'var(--border)'}`,
          }}>{t==='expense'?'💸 Gasto':'💵 Ingreso'}</button>
        ))}
      </div>

      {/* Category grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', padding:'12px 16px' }}>
        {shownCats.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} style={{
            padding:'10px 6px', borderRadius:'var(--r-sm)', border:`1.5px solid ${cat===c.id?'var(--accent)':'var(--border)'}`,
            background: cat===c.id?'var(--accent-soft)':'var(--bg-card)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
          }}>
            <span style={{ fontSize:'20px' }}>{c.icon}</span>
            <span style={{ fontSize:'9px', color:cat===c.id?'var(--accent-dim)':'var(--text-3)', textAlign:'center', fontWeight:600, lineHeight:1.2 }}>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div style={{ padding:'0 16px 14px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {cat==='horas' ? (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <input type="number" placeholder="Tarifa/hora" value={hourly.rate}
              onChange={e=>setHourly(p=>({...p,rate:e.target.value}))}
              style={{ padding:'13px', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:'15px', background:'var(--bg-card)', color:'var(--text-1)', outline:'none' }}/>
            <input type="number" placeholder="Horas" value={hourly.hours}
              onChange={e=>setHourly(p=>({...p,hours:e.target.value}))}
              style={{ padding:'13px', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:'15px', background:'var(--bg-card)', color:'var(--text-1)', outline:'none' }}/>
            {computedAmount > 0 && (
              <p style={{ gridColumn:'1/-1', fontSize:'14px', fontWeight:700, color:'var(--green)' }}>Total: {fmt(computedAmount)}</p>
            )}
          </div>
        ) : (
          <input type="number" placeholder="Monto" value={amount}
            onChange={e=>setAmount(e.target.value)}
            style={{ padding:'13px', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:'20px', fontWeight:700, background:'var(--bg-card)', color:'var(--text-1)', outline:'none' }}/>
        )}
        <input type="text" placeholder="Descripción (opcional)" value={desc}
          onChange={e=>setDesc(e.target.value)}
          style={{ padding:'12px', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:'14px', background:'var(--bg-card)', color:'var(--text-1)', outline:'none' }}/>
        <button onClick={handleAdd} style={{
          padding:'15px', background: mode==='expense'?'var(--text-1)':'var(--green)',
          color:'white', border:'none', borderRadius:'var(--r)', fontSize:'15px', fontWeight:700,
        }}>Registrar {catById(cat).icon}</button>
      </div>

      {/* Transaction list */}
      <div style={{ padding:'0 16px' }}>
        <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'12px' }}>
          Este mes · {sorted.length} movimientos
        </p>

        {sorted.length === 0 && (
          <p style={{ fontSize:'13px', color:'var(--text-3)', textAlign:'center', padding:'32px 0' }}>
            Aún no hay movimientos. Registra el primero arriba.
          </p>
        )}

        {sorted.map(m => {
          const c = catById(m.category)
          const isIncome = m.type === 'income'
          if (editing === m.id) {
            return (
              <div key={m.id} className="pop" style={{ background:'var(--accent-soft)', borderRadius:'var(--r)', padding:'14px', marginBottom:'8px', border:'1.5px solid var(--accent)' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <input type="number" value={editData.amount} onChange={e=>setEditData(p=>({...p,amount:e.target.value}))}
                    style={{ padding:'10px', border:'1.5px solid var(--accent)', borderRadius:'var(--r-sm)', fontSize:'16px', fontWeight:700, background:'white', outline:'none' }}/>
                  <input type="text" value={editData.description} onChange={e=>setEditData(p=>({...p,description:e.target.value}))}
                    style={{ padding:'10px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'13px', background:'white', outline:'none' }}/>
                  <select value={editData.category} onChange={e=>setEditData(p=>({...p,category:e.target.value}))}
                    style={{ padding:'10px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontSize:'13px', background:'white' }}>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={saveEdit} style={{ flex:2, padding:'11px', background:'var(--text-1)', color:'white', borderRadius:'var(--r-sm)', fontWeight:700 }}>Guardar</button>
                    <button onClick={()=>setEditing(null)} style={{ flex:1, padding:'11px', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-3)' }}>Cancelar</button>
                  </div>
                </div>
              </div>
            )
          }
          return (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:'22px', flexShrink:0 }}>{c.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'13px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.description || c.label}</p>
                <p style={{ fontSize:'11px', color:'var(--text-3)' }}>{shortDate(m.date)} · {c.label}</p>
              </div>
              <p style={{ fontSize:'14px', fontWeight:700, color: isIncome?'var(--green)':'var(--text-1)', flexShrink:0 }}>
                {isIncome?'+':'-'}{fmt(m.amount)}
              </p>
              <button onClick={()=>startEdit(m)} style={{ fontSize:'16px', padding:'4px', opacity:.6, color:'var(--blue)' }} title="Editar">✏️</button>
              <button onClick={()=>handleDelete(m.id)} style={{ fontSize:'16px', padding:'4px', opacity:.6, color:'var(--red)' }} title="Eliminar">🗑️</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
