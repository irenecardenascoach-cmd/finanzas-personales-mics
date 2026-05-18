/**
 * InsightBanner – Sección Superior de El Pulso (PRD §2)
 * "Un bloque de texto limpio en tipografía grande que cambia dinámicamente"
 */

import { useState } from 'react'
import { useInsights } from '@/hooks/useInsights'
import { useMovements } from '@/hooks/useMovements'

export default function InsightBanner() {
  const { movements } = useMovements()
  const { mensajePrincipal, mensajeProactivo, cargando, responderProactivo } = useInsights(movements)
  const [modoRespuesta, setModoRespuesta] = useState(false)
  const [respuesta, setRespuesta]         = useState('')

  const handleResponder = async () => {
    if (!respuesta.trim()) return
    await responderProactivo(respuesta, movements)
    setModoRespuesta(false)
    setRespuesta('')
  }

  // Día 1: muestra mensaje proactivo con campo de respuesta
  if (mensajeProactivo) {
    return (
      <div style={s.proactivoWrap}>
        <span style={s.dot} />
        <p style={s.proactivoTexto}>
          {cargando ? 'Analizando tu historial...' : mensajeProactivo}
        </p>
        {!modoRespuesta ? (
          <button style={s.responderBtn} onClick={() => setModoRespuesta(true)}>
            Responder
          </button>
        ) : (
          <div style={s.inputWrap}>
            <input
              style={s.input}
              placeholder="Cuéntame aquí..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleResponder()}
              autoFocus
            />
            <button style={s.sendBtn} onClick={handleResponder}>→</button>
          </div>
        )}
      </div>
    )
  }

  // Resto del mes: mensaje empático dinámico
  return (
    <div style={s.bannerWrap}>
      <p style={s.bannerTexto}>{mensajePrincipal || 'Hola María 🌿'}</p>
    </div>
  )
}

const s = {
  bannerWrap: {
    padding: '28px 24px 0',
  },
  bannerTexto: {
    fontSize: '22px',
    fontWeight: 700,
    lineHeight: 1.3,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font)',
    letterSpacing: '-0.3px',
  },
  proactivoWrap: {
    margin: '20px 20px 0',
    background: 'var(--accent-soft)',
    borderRadius: 'var(--radius)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent)',
    flexShrink: 0,
    display: 'block',
  },
  proactivoTexto: {
    fontSize: '14px',
    lineHeight: 1.55,
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  responderBtn: {
    alignSelf: 'flex-start',
    background: 'var(--text-primary)',
    color: 'var(--bg-card)',
    border: 'none',
    borderRadius: '100px',
    padding: '8px 18px',
    fontSize: '12px',
    fontFamily: 'var(--font)',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  inputWrap: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontFamily: 'var(--font)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    background: 'var(--text-primary)',
    color: 'var(--bg-card)',
    borderRadius: '50%',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
