import { useState } from 'react'
import { useMovements } from '@/hooks/useMovements'
import { useToast } from '@/hooks/useToast'
import { ahorroMeta } from '@/utils/calculations'
import { fmt } from '@/utils/formatters'
import Card from '@/components/shared/Card'

const META_OBJETIVO = 1500000 // COP – ajustable

export default function Refugio() {
  const { movements, addMovement } = useMovements()
  const { showToast }              = useToast()
  const [aporte, setAporte]        = useState('')
  const [mostrarInput, setMostrarInput] = useState(false)

  const ahorrado = ahorroMeta(movements)
  const pct      = Math.min((ahorrado / META_OBJETIVO) * 100, 100)
  const falta    = META_OBJETIVO - ahorrado

  const handleAporte = () => {
    const monto = parseInt(aporte.replace(/\D/g, '')) || 0
    if (!monto) return
    addMovement({
      entorno:   'personal',
      categoria: 'fondo_prevision',
      tipo:      'ahorro',
      monto,
      divisa:    'COP',
      nota:      'Aporte meta cama',
      modo:      'manual',
    })
    showToast('¡Aporte registrado! Un paso más 🛏️')
    setAporte('')
    setMostrarInput(false)
  }

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font)' }}>
          El Refugio
        </span>
      </div>

      <div style={{ padding: '20px' }}>

        {/* Rastreador visual de meta (PRD §2 Pantalla 4) */}
        <Card style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '36px' }}>🛏️</span>
            <div>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 2px',
                fontFamily: 'var(--font)',
              }}>Meta activa</p>
              <p style={{
                fontSize: '18px',
                fontWeight: 700,
                margin: 0,
                fontFamily: 'var(--font)',
              }}>Cama + Colchón</p>
            </div>
          </div>

          {/* Anillo de progreso visual */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle
                cx="70" cy="70" r="58"
                fill="none"
                stroke="var(--border)"
                strokeWidth="10"
              />
              <circle
                cx="70" cy="70" r="58"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - pct / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <text
                x="70" y="62"
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font)',
                  fontSize: '11px',
                  fill: 'var(--text-muted)',
                }}
              >ahorrado</text>
              <text
                x="70" y="82"
                textAnchor="middle"
                style={{
                  fontFamily: 'var(--font)',
                  fontSize: '20px',
                  fontWeight: '700',
                  fill: 'var(--text-primary)',
                }}
              >{Math.round(pct)}%</text>
            </svg>
          </div>

          {/* Desglose numérico */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Acumulado</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font)' }}>{fmt(ahorrado)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Falta</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>{fmt(falta)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Objetivo</span>
              <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font)' }}>{fmt(META_OBJETIVO)}</span>
            </div>
          </div>

          {/* Mensaje empático */}
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            margin: '0 0 16px',
            fontFamily: 'var(--font)',
            lineHeight: 1.5,
          }}>
            {pct < 25
              ? 'María, cada aporte cuenta. ¡Ya empezaste lo más difícil! 🌿'
              : pct < 60
              ? `Vas muy bien. ${fmt(falta)} y esa cama es tuya. ¡Sigue!`
              : pct < 100
              ? '¡Casi llegamos! La cama ya casi es tuya. 🛏️'
              : '¡Meta cumplida! Mereces ese descanso, María. ✨'}
          </p>

          {/* Botón / input de aporte */}
          {!mostrarInput ? (
            <button
              onClick={() => setMostrarInput(true)}
              style={{
                width: '100%',
                padding: '14px',
                background: 'var(--text-primary)',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: 'var(--bg-card)',
                fontSize: '14px',
                fontFamily: 'var(--font)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >+ Registrar aporte</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Monto en COP"
                value={aporte}
                onChange={(e) => setAporte(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAporte()}
                autoFocus
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '16px',
                  fontFamily: 'var(--font)',
                  background: 'var(--bg)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAporte}
                style={{
                  padding: '12px 20px',
                  background: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  color: 'var(--bg-card)',
                  fontFamily: 'var(--font)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >✓</button>
            </div>
          )}
        </Card>

        {/* Fondo de previsión (PRD §2 Pantalla 4) */}
        <Card>
          <p style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 10px',
            fontFamily: 'var(--font)',
          }}>🔧 Fondo de previsión</p>
          <p style={{
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: '0 0 10px',
            fontFamily: 'var(--font)',
          }}>
            Reserva para imprevistos del hogar: bombillos, reparaciones, mantenimiento del computador y gastos no planeados.
          </p>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            margin: 0,
            fontFamily: 'var(--font)',
            fontStyle: 'italic',
          }}>
            Los aportes se registran bajo la categoría Fondo de Previsión y se suman a tu meta activa.
          </p>
        </Card>
      </div>
    </div>
  )
}
