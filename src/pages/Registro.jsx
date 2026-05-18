import { useState } from 'react'
import MicButton from '@/components/registro/MicButton'
import { QUICK_CATEGORIES_PERSONAL, QUICK_CATEGORIES_NEGOCIO } from '@/data/baseline'
import { useMovements } from '@/hooks/useMovements'
import { useToast } from '@/hooks/useToast'
import { fmt } from '@/utils/formatters'
import EnvToggle from '@/components/shared/EnvToggle'

export default function Registro() {
  const [env, setEnv]               = useState('personal')
  const [selectedCat, setSelectedCat] = useState(null)
  const [amount, setAmount]         = useState('')
  const { addMovement }             = useMovements()
  const { showToast }               = useToast()

  const cats = env === 'personal' ? QUICK_CATEGORIES_PERSONAL : QUICK_CATEGORIES_NEGOCIO

  const handleCatPress = (cat) => {
    setSelectedCat(cat)
    setAmount('')
  }

  const handleDigit = (d) => {
    if (d === 'DEL') { setAmount((a) => a.slice(0, -1)); return }
    if (d === '000') { setAmount((a) => a + '000'); return }
    setAmount((a) => (a + d).slice(0, 9))
  }

  const handleOK = () => {
    if (!selectedCat || !amount) return
    const currency = selectedCat.budgetUSD ? 'USD' : 'COP'
    addMovement({
      entorno:   env,
      categoria: selectedCat.id,
      tipo:      selectedCat.tipo === 'ahorro' ? 'ahorro' : 'gasto',
      monto:     parseInt(amount),
      divisa:    currency,
      nota:      selectedCat.label,
      modo:      'manual',
    })
    showToast(`${selectedCat.icon} ${selectedCat.label} anotado ✓`)
    setSelectedCat(null)
    setAmount('')
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font)' }}>Registrar</span>
        <EnvToggle value={env} onChange={(v) => { setEnv(v); setSelectedCat(null); setAmount('') }} />
      </div>

      {/* Micrófono prominente (PRD §1) */}
      <MicButton />

      {/* Divisor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px 20px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font)',
          letterSpacing: '0.08em',
        }}>O EN DOS TOQUES</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Cuadrícula de categorías (PRD §2 Pantalla 2) */}
      {!selectedCat && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          padding: '0 20px',
        }}>
          {cats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCatPress(cat)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '28px' }}>{cat.icon}</span>
              <span style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
                fontFamily: 'var(--font)',
                fontWeight: 500,
                lineHeight: 1.2,
              }}>{cat.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Teclado numérico grande (PRD §2 – "se transforma en teclado numérico") */}
      {selectedCat && (
        <div style={{ padding: '0 20px' }}>
          {/* Monto display */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '36px' }}>{selectedCat.icon}</span>
            <p style={{
              fontSize: '15px',
              fontWeight: 700,
              margin: '8px 0 6px',
              fontFamily: 'var(--font)',
            }}>{selectedCat.label}</p>
            <p style={{
              fontSize: '36px',
              fontWeight: 900,
              color: amount ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font)',
              letterSpacing: '-1px',
              margin: 0,
            }}>
              {amount
                ? fmt(parseInt(amount), selectedCat.budgetUSD ? 'USD' : 'COP')
                : '$0'}
            </p>
          </div>

          {/* Teclado */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {['1','2','3','4','5','6','7','8','9','000','0','DEL'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                style={{
                  padding: '20px',
                  fontSize: d === 'DEL' ? '18px' : '24px',
                  fontWeight: 600,
                  fontFamily: 'var(--font)',
                  background: d === 'DEL' ? 'var(--border)' : 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >{d}</button>
            ))}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={() => setSelectedCat(null)}
              style={{
                flex: 1,
                padding: '16px',
                border: '1px solid var(--border)',
                background: 'transparent',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font)',
                fontSize: '15px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >← Volver</button>
            <button
              onClick={handleOK}
              style={{
                flex: 2,
                padding: '16px',
                border: 'none',
                background: 'var(--text-primary)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font)',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--bg-card)',
                cursor: 'pointer',
              }}
            >OK ✓</button>
          </div>
        </div>
      )}
    </div>
  )
}
