/**
 * AlertsList – Sección Inferior de El Pulso (PRD §2)
 * "Una lista sutil de recordatorios importantes"
 */

import { diasParaDia } from '@/utils/formatters'
import { useInsights } from '@/hooks/useInsights'
import { useMovements } from '@/hooks/useMovements'

// Alertas de fechas fijas del PRD
const ALERTAS_FIJAS = [
  { id: 'isaac',   texto: (n) => `📚 Colegio de Isaac: faltan ${n} días`,   dia: 1 },
  { id: 'arriendo', texto: (n) => `🏠 Arriendo: faltan ${n} días`,          dia: 5 },
]

export default function AlertsList() {
  const { movements } = useMovements()
  const { alertas: alertasTendencias } = useInsights(movements)

  const alertasFechas = ALERTAS_FIJAS
    .map((a) => ({ ...a, dias: diasParaDia(a.dia) }))
    .filter((a) => a.dias <= 5) // Solo muestra si faltan ≤5 días

  if (!alertasFechas.length && !alertasTendencias.length) return null

  return (
    <div style={s.wrap}>
      <p style={s.titulo}>Alertas activas</p>
      <div style={s.lista}>
        {alertasFechas.map((a) => (
          <div key={a.id} style={s.alerta}>
            <span style={s.bullet} />
            <span style={s.texto}>{a.texto(a.dias)}</span>
          </div>
        ))}
        {alertasTendencias.map((texto, i) => (
          <div key={`t${i}`} style={{ ...s.alerta, ...s.alertaTendencia }}>
            <span style={{ ...s.bullet, background: 'var(--accent)' }} />
            <span style={s.texto}>{texto}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const s = {
  wrap: {
    margin: '20px 20px 0',
  },
  titulo: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
    fontFamily: 'var(--font)',
  },
  lista: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  alerta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
  },
  alertaTendencia: {
    borderColor: 'var(--accent-soft)',
  },
  bullet: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--red)',
    flexShrink: 0,
  },
  texto: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font)',
  },
}
