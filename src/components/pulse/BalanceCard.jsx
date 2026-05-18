/**
 * BalanceCard – Sección Central de El Pulso (PRD §2)
 * "Dos tarjetas visuales minimalistas que muestran el balance neto actual"
 */

import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import { fmt, porcentajeMes } from '@/utils/formatters'
import { balanceNeto } from '@/utils/calculations'
import { useMovements } from '@/hooks/useMovements'

export default function BalanceCard({ entorno = 'personal' }) {
  const { movements } = useMovements()
  const { ingresos, gastos, neto } = balanceNeto(movements, entorno)
  const pctMes = porcentajeMes()
  const esPersonal = entorno === 'personal'

  // Progreso de gasto vs ingresos
  const pctGasto = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : 0

  return (
    <Card style={{ margin: '0 20px' }}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.label}>
            {esPersonal ? '🏠 Personal' : '💼 Relation Line™'}
          </p>
          <p style={s.neto} style={{
            ...s.neto,
            color: neto >= 0 ? 'var(--green)' : 'var(--red)',
          }}>
            {neto >= 0 ? '+' : ''}{fmt(Math.abs(neto), esPersonal ? 'COP' : 'USD')}
          </p>
          <p style={s.netoLabel}>balance neto</p>
        </div>
        <div style={s.ringWrap}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle
              cx="36" cy="36" r="28"
              fill="none"
              stroke={pctGasto > 90 ? 'var(--red)' : pctGasto > 70 ? 'var(--accent)' : 'var(--green)'}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - pctGasto / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="36" y="40" textAnchor="middle" style={{
              fontFamily: 'var(--font)',
              fontSize: '13px',
              fontWeight: 700,
              fill: 'var(--text-primary)',
            }}>{pctGasto}%</text>
          </svg>
        </div>
      </div>

      {/* Desglose */}
      <div style={s.desglose}>
        <div style={s.row}>
          <span style={s.desgloseLabel}>Ingresos</span>
          <span style={{ ...s.desgloseVal, color: 'var(--green)' }}>
            {fmt(ingresos, esPersonal ? 'COP' : 'USD')}
          </span>
        </div>
        <div style={s.row}>
          <span style={s.desgloseLabel}>Gastado</span>
          <span style={{ ...s.desgloseVal, color: 'var(--red)' }}>
            −{fmt(gastos, esPersonal ? 'COP' : 'USD')}
          </span>
        </div>
      </div>

      {/* Barra de progreso del mes */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={s.desgloseLabel}>Avance del mes</span>
          <span style={s.desgloseLabel}>{pctMes}%</span>
        </div>
        <ProgressBar value={pctMes} max={100} color="var(--accent-dim)" height={4} />
      </div>
    </Card>
  )
}

const s = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: '0 0 6px',
    fontFamily: 'var(--font)',
  },
  neto: {
    fontSize: '28px',
    fontWeight: 700,
    margin: '0 0 2px',
    fontFamily: 'var(--font)',
    letterSpacing: '-0.5px',
  },
  netoLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  ringWrap: { flexShrink: 0 },
  desglose: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desgloseLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font)',
  },
  desgloseVal: {
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'var(--font)',
  },
}
