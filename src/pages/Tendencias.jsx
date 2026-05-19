import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { lastNMonths, fmt, fmtCompact } from '@/utils/formatters'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

// ── Build monthly series from movements ─────────────────────────────────────
const buildSeries = (movements, n=6) => {
  const months = lastNMonths(n)
  return months.map(({ label, date }) => {
    const income  = movements.filter(m => {
      const d = new Date(m.date)
      return m.type==='income' && d.getMonth()===date.getMonth() && d.getFullYear()===date.getFullYear()
    }).reduce((s,m) => s+m.amount, 0)
    const expense = movements.filter(m => {
      const d = new Date(m.date)
      return m.type==='expense' && d.getMonth()===date.getMonth() && d.getFullYear()===date.getFullYear()
    }).reduce((s,m) => s+m.amount, 0)
    return { label, income, expense, balance: income - expense }
  })
}

// Project 6 more months based on avg of last 3
const buildProjection = (series) => {
  const last3inc = series.slice(-3).map(s=>s.income)
  const last3exp = series.slice(-3).map(s=>s.expense)
  const avgInc   = last3inc.reduce((a,b)=>a+b,0) / last3inc.length || 0
  const avgExp   = last3exp.reduce((a,b)=>a+b,0) / last3exp.length || 0
  const projection = []
  for (let i=1; i<=6; i++) {
    const d = new Date(); d.setMonth(d.getMonth()+i)
    projection.push({
      label: d.toLocaleDateString('es-CO', { month:'short' }) + "'",
      income:  Math.round(avgInc),
      expense: Math.round(avgExp),
      balance: Math.round(avgInc - avgExp),
      projected: true,
    })
  }
  return [...series, ...projection]
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', padding:'10px 14px', boxShadow:'var(--sh)' }}>
      <p style={{ fontWeight:700, marginBottom:'4px', fontSize:'13px' }}>{label}</p>
      {payload.map(p=>(
        <p key={p.dataKey} style={{ fontSize:'12px', color:p.color }}>{p.name}: {fmtCompact(p.value)}</p>
      ))}
    </div>
  )
}

export default function Tendencias() {
  const { movements } = useStore()
  const [searchQ, setSearchQ]     = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults]     = useState([])
  const [searchErr, setSearchErr] = useState('')
  const [chartType, setChartType] = useState('area') // area | projection | bars

  const series     = buildSeries(movements, 6)
  const fullSeries = buildProjection(series)

  // Dynamic bar color: green if expense dropped vs previous month, red if rose
  const barsWithColor = series.map((m, i) => ({
    ...m,
    expColor: i===0 ? 'var(--text-3)' : m.expense < series[i-1].expense ? 'var(--green)' : 'var(--red)',
  }))

  // Web search via Claude API
  const handleSearch = async () => {
    if (!searchQ.trim()) return
    setSearching(true); setResults([]); setSearchErr('')
    try {
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY
      if (!key) throw new Error('Agrega VITE_ANTHROPIC_API_KEY en Vercel')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
        body: JSON.stringify({
          model:'claude-sonnet-4-20250514', max_tokens:800,
          system:'Eres un consultor financiero colombiano. El usuario busca información financiera. Responde con 3-4 puntos concretos y actualizados sobre: tasas de interés, opciones de inversión, CDTs, o lo que pregunte. Sé directo y práctico. Formato: JSON array [{title, summary}]',
          messages:[{ role:'user', content: searchQ }],
        }),
      })
      const data = await res.json()
      const text = data.content?.find(b=>b.type==='text')?.text || '[]'
      const clean = text.replace(/```json|```/g,'').trim()
      setResults(JSON.parse(clean))
    } catch(e) {
      setSearchErr(e.message)
    }
    setSearching(false)
  }

  const noData = series.every(s=>s.income===0 && s.expense===0)

  return (
    <div style={{ paddingBottom:'32px' }}>
      <div style={{ padding:'18px 16px 14px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)' }}>
        <p style={{ fontSize:'18px', fontWeight:900, letterSpacing:'-.3px' }}>Flujo de dinero</p>
      </div>

      {/* Chart type selector */}
      <div style={{ display:'flex', gap:'6px', padding:'12px 16px 0' }}>
        {[['area','Histórico'],['projection','Proyección 12M'],['bars','Por mes']].map(([k,l])=>(
          <button key={k} onClick={()=>setChartType(k)} style={{
            padding:'7px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:700,
            background: chartType===k?'var(--text-1)':'var(--bg-card)',
            color: chartType===k?'white':'var(--text-3)',
            border:`1.5px solid ${chartType===k?'var(--text-1)':'var(--border)'}`,
          }}>{l}</button>
        ))}
      </div>

      {noData && (
        <p style={{ textAlign:'center', color:'var(--text-3)', padding:'40px 24px', fontSize:'13px' }}>
          Registra movimientos para ver el análisis de tendencias aquí.
        </p>
      )}

      {!noData && chartType==='area' && (
        <div style={{ margin:'14px 16px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'14px' }}>Ingresos vs Gastos — últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--red)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--red)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'var(--text-3)', fontFamily:'var(--font)' }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="income"  name="Ingresos" stroke="var(--green)" fill="url(#gInc)" strokeWidth={2}/>
              <Area type="monotone" dataKey="expense" name="Gastos"   stroke="var(--red)"   fill="url(#gExp)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {!noData && chartType==='projection' && (
        <div style={{ margin:'14px 16px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'4px' }}>Proyección a 12 meses</p>
          <p style={{ fontSize:'11px', color:'var(--text-3)', marginBottom:'14px' }}>Basada en el promedio de los últimos 3 meses. Las barras punteadas son proyectadas.</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={fullSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'var(--font)' }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="balance" name="Balance" stroke="var(--accent)" strokeWidth={2.5}
                dot={d=>d.payload.projected
                  ? <circle key={d.cx+d.cy} cx={d.cx} cy={d.cy} r={3} fill="none" stroke="var(--accent)" strokeDasharray="3 2"/>
                  : <circle key={d.cx+d.cy} cx={d.cx} cy={d.cy} r={4} fill="var(--accent)"/>
                }
                strokeDasharray={(d) => d?.projected ? '5 3' : undefined}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!noData && chartType==='bars' && (
        <div style={{ margin:'14px 16px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'4px' }}>Gastos por mes</p>
          <p style={{ fontSize:'11px', color:'var(--text-3)', marginBottom:'14px' }}>Verde = bajó vs mes anterior · Rojo = subió</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barsWithColor} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fontSize:11, fill:'var(--text-3)', fontFamily:'var(--font)' }} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="expense" name="Gastos" radius={[6,6,0,0]}>
                {barsWithColor.map((m,i)=><Cell key={i} fill={m.expColor}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:'12px', marginTop:'10px' }}>
            {['verde = bajó','rojo = subió'].map((l,i)=>(
              <span key={i} style={{ fontSize:'11px', color:i===0?'var(--green)':'var(--red)' }}>● {l}</span>
            ))}
          </div>
        </div>
      )}

      {/* Predictive text block */}
      {!noData && (
        <div style={{ margin:'0 16px 14px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'10px' }}>Análisis predictivo</p>
          {(() => {
            const last = series[series.length-1]
            const prev = series[series.length-2]
            if (!prev || (!last.expense && !prev.expense)) return <p style={{ fontSize:'13px', color:'var(--text-3)' }}>Ingresa más datos para activar el análisis.</p>
            const diff = last.expense - prev.expense
            const pct  = prev.expense > 0 ? Math.round(Math.abs(diff)/prev.expense*100) : 0
            return <p style={{ fontSize:'14px', lineHeight:1.6, color:'var(--text-1)' }}>
              {diff > 0
                ? `Tus gastos subieron un ${pct}% este mes vs el anterior. Si esta tendencia continúa, en 6 meses habrás gastado ${fmtCompact(last.expense*6)} en total.`
                : diff < 0
                ? `¡Bien! Bajaste tus gastos un ${pct}% vs el mes anterior. Mantén esa disciplina y habrás ahorrado ${fmtCompact(Math.abs(diff)*6)} en 6 meses.`
                : `Tus gastos se mantienen estables respecto al mes anterior.`}
            </p>
          })()}
        </div>
      )}

      {/* Web search / financial news */}
      <div style={{ margin:'0 16px', background:'var(--bg-card)', borderRadius:'var(--r)', padding:'16px', border:'1px solid var(--border)' }}>
        <p style={{ fontSize:'11px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:'12px' }}>Consulta financiera en vivo</p>
        <div style={{ display:'flex', gap:'8px' }}>
          <input
            value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSearch()}
            placeholder="ej: mejores CDTs, tasas de ahorro..."
            style={{ flex:1, padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--r)', fontSize:'13px', background:'var(--bg)', color:'var(--text-1)', outline:'none' }}
          />
          <button onClick={handleSearch} disabled={searching} style={{
            padding:'11px 16px', background:'var(--text-1)', color:'white',
            borderRadius:'var(--r)', fontSize:'13px', fontWeight:700, opacity: searching?.7:1,
          }}>{searching ? '...' : '→'}</button>
        </div>
        {searchErr && <p style={{ fontSize:'12px', color:'var(--red)', marginTop:'8px' }}>{searchErr}</p>}
        {results.length > 0 && (
          <div style={{ marginTop:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {results.map((r,i)=>(
              <div key={i} style={{ padding:'12px', background:'var(--bg)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)' }}>
                <p style={{ fontSize:'13px', fontWeight:700, marginBottom:'4px' }}>{r.title}</p>
                <p style={{ fontSize:'12px', color:'var(--text-2)', lineHeight:1.5 }}>{r.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
