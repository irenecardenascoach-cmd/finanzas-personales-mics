import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import { fmt, fmtCompact } from '@/utils/formatters'

const SYSTEM_PROMPT = `Eres una consultora financiera y de negocios experta, fría, estratégica y enfocada en el crecimiento empresarial. Tu nombre es MF (Mindset Finance). Tu meta es ayudar a la usuaria a mantener su estilo de vida bajo control, optimizar sus costos operativos y multiplicar su capital de inversión. Sé directa, contundente y minimalista en tus respuestas. Máximo 3-4 oraciones por respuesta.

REGLA DE ORO: Si los ingresos aumentan, el estilo de vida se mantiene CONGELADO. Si la usuaria pregunta si puede gastar más porque ganó más, recuérdale con tono firme que ese excedente va directo a reinversión o capital de inversión, NO a consumo ni antojos.

Responde siempre en español.`

const buildContext = (store) => {
  const { totalIncome, totalExpense, balance, investmentCapital, rule50, rule30, rule20, survivalMonths, stressMode } = store
  return `\n\n[CONTEXTO FINANCIERO ACTUAL]\nIngresos del mes: ${fmt(totalIncome)}\nGastos del mes: ${fmt(totalExpense)}\nBalance neto: ${fmt(balance)}\nCapital para inversión disponible: ${fmt(investmentCapital)}\nDistribución 50/30/20 → Gasto actual: ${fmt(totalExpense)} / Límite 50%: ${fmt(rule50)}\nMeses de supervivencia en fondo: ${survivalMonths}\nModo estrés activo: ${stressMode?'SÍ':'NO'}`
}

export default function Consultora() {
  const store = useStore()
  const { profile } = store
  const [messages, setMessages] = useState([
    { role:'assistant', content:`Hola ${profile?.name?.split(' ')[0] || ''}. Soy tu consultora financiera. Tengo acceso a tus números en tiempo real. ¿Qué necesitas optimizar hoy?` }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput(''); setError('')

    const userMsg = { role:'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    if (!apiKey) {
      setMessages(prev => [...prev, {
        role:'assistant',
        content:'Para activar la Consultora IA, agrega VITE_ANTHROPIC_API_KEY en las variables de entorno de Vercel y redespliega.'
      }])
      setLoading(false)
      return
    }

    try {
      // Build history for Claude (exclude injected context from display)
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.role==='user' && m === userMsg
          ? text + buildContext(store) // inject context only on latest user message
          : m.content
      }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'x-api-key': apiKey,
          'anthropic-version':'2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error?.message || `Error ${res.status}`)
      }

      const data    = await res.json()
      const content = data.content?.find(b=>b.type==='text')?.text || '...'
      setMessages(prev => [...prev, { role:'assistant', content }])
    } catch(e) {
      setError(e.message)
      setMessages(prev => [...prev, { role:'assistant', content:`Error: ${e.message}` }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100dvh - 80px)' }}>
      {/* Header */}
      <div style={{ padding:'18px 16px 14px', background:'var(--bg-card)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', background:'var(--text-1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>✦</div>
          <div>
            <p style={{ fontSize:'15px', fontWeight:900, letterSpacing:'-.2px' }}>Consultora IA</p>
            <p style={{ fontSize:'11px', color:'var(--text-3)' }}>Acceso a tus números en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Context bar */}
      <div style={{ background:'var(--text-1)', padding:'10px 16px', display:'flex', gap:'16px', overflowX:'auto', flexShrink:0 }}>
        {[
          ['Ingresos', fmtCompact(store.totalIncome), 'var(--green-soft)'],
          ['Gastos',   fmtCompact(store.totalExpense), store.totalExpense > store.rule50 ? 'var(--red-soft)' : 'var(--bg-card)'],
          ['Inv. Cap', fmtCompact(store.investmentCapital), 'var(--accent-soft)'],
        ].map(([l,v,c])=>(
          <div key={l} style={{ flexShrink:0 }}>
            <p style={{ fontSize:'10px', color:'rgba(255,255,255,.4)', marginBottom:'2px' }}>{l}</p>
            <p style={{ fontSize:'13px', fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
        {messages.map((m,i)=>(
          <div key={i} className="fade-up" style={{
            display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start',
          }}>
            <div style={{
              maxWidth:'82%', padding:'12px 14px', borderRadius:
                m.role==='user' ? 'var(--r-lg) var(--r-lg) var(--r-sm) var(--r-lg)' : 'var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)',
              background: m.role==='user' ? 'var(--text-1)' : 'var(--bg-card)',
              color: m.role==='user' ? 'var(--bg-card)' : 'var(--text-1)',
              border: m.role==='assistant' ? '1px solid var(--border)' : 'none',
              fontSize:'13px', lineHeight:1.6, fontFamily:'var(--font)',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', gap:'5px', padding:'12px 14px', background:'var(--bg-card)', borderRadius:'var(--r-lg) var(--r-lg) var(--r-lg) var(--r-sm)', border:'1px solid var(--border)', width:'fit-content' }}>
            {[0,1,2].map(i=>(
              <span key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--text-3)', display:'block', animation:`pulse 1.2s ease ${i*0.2}s infinite` }}/>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:'12px 16px 16px', background:'var(--bg-card)', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:'8px', alignItems:'flex-end' }}>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() } }}
            placeholder="Pregunta sobre tu situación financiera..."
            rows={1}
            style={{
              flex:1, padding:'12px 14px', border:'1.5px solid var(--border)', borderRadius:'var(--r)',
              fontSize:'14px', background:'var(--bg)', color:'var(--text-1)', outline:'none',
              resize:'none', fontFamily:'var(--font)', lineHeight:1.5,
            }}
            onInput={e=>{ e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px' }}
          />
          <button onClick={send} disabled={loading||!input.trim()} style={{
            width:'44px', height:'44px', borderRadius:'50%', background:'var(--text-1)',
            color:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'18px', opacity: loading||!input.trim() ? .4 : 1,
            transition:'opacity var(--t)',
          }}>→</button>
        </div>
        {error && <p style={{ fontSize:'11px', color:'var(--red)', marginTop:'6px' }}>{error}</p>}
      </div>
    </div>
  )
}
