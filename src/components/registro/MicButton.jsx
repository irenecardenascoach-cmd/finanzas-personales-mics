/**
 * MicButton – Botón de micrófono principal (PRD §1)
 * "Un botón de micrófono prominente y limpio"
 */

import { useAudioInput, ESTADOS } from '@/hooks/useAudioInput'
import { useMovements } from '@/hooks/useMovements'
import { useToast } from '@/hooks/useToast'
import { getCategoryById } from '@/data/baseline'

export default function MicButton() {
  const { addMovement } = useMovements()
  const { showToast }   = useToast()
  const {
    estado, transcript, parsedEntry, error,
    iniciarGrabacion, detenerGrabacion, cancelar,
    estaGrabando, estaProcesando, estaConfirmando,
  } = useAudioInput()

  const confirmar = () => {
    if (!parsedEntry) return
    addMovement({
      entorno:   parsedEntry.entorno,
      categoria: parsedEntry.categoria,
      tipo:      parsedEntry.tipo || 'gasto',
      monto:     parsedEntry.monto,
      divisa:    parsedEntry.divisa,
      nota:      parsedEntry.nota,
      modo:      'automatico',
    })
    showToast(parsedEntry.feedback || '¡Anotado! ✓')
    cancelar()
  }

  const cat = parsedEntry ? getCategoryById(parsedEntry.categoria) : null

  return (
    <div style={s.wrap}>
      {/* ── Micrófono ── */}
      {!estaConfirmando && (
        <div style={s.micSection}>
          <button
            style={{
              ...s.mic,
              ...(estaGrabando ? s.micActive : {}),
              ...(estaProcesando ? s.micProcessing : {}),
            }}
            onPointerDown={iniciarGrabacion}
            onPointerUp={detenerGrabacion}
            onPointerLeave={estaGrabando ? detenerGrabacion : undefined}
            disabled={estaProcesando}
          >
            {estaProcesando ? (
              <span style={s.spinner} />
            ) : (
              <span style={s.micIcon}>🎙</span>
            )}
          </button>

          <p style={s.micHint}>
            {estaGrabando
              ? 'Suelta cuando termines de hablar'
              : estaProcesando
              ? 'Procesando tu voz...'
              : 'Mantén presionado y habla'}
          </p>

          {transcript && !estaConfirmando && (
            <p style={s.transcript}>"{transcript}"</p>
          )}

          {error && <p style={s.error}>{error}</p>}
        </div>
      )}

      {/* ── Tarjeta de confirmación ── */}
      {estaConfirmando && parsedEntry && (
        <div style={s.confirmCard} className="animate-fade-up">
          <p style={s.confirmTranscript}>"{transcript}"</p>

          <div style={s.parsedRow}>
            <span style={s.parsedIcon}>{cat?.icon || '💰'}</span>
            <div>
              <p style={s.parsedCat}>{cat?.label || parsedEntry.categoria}</p>
              <p style={s.parsedMonto}>
                {parsedEntry.divisa === 'USD'
                  ? `$${parsedEntry.monto} USD`
                  : `$${Number(parsedEntry.monto).toLocaleString('es-CO')} COP`}
              </p>
            </div>
            <span style={s.envTag}>
              {parsedEntry.entorno === 'personal' ? 'Personal' : 'Negocio'}
            </span>
          </div>

          {parsedEntry.confianza < 0.7 && (
            <p style={s.lowConfidence}>
              ⚠ Confianza baja ({Math.round(parsedEntry.confianza * 100)}%). Verifica antes de confirmar.
            </p>
          )}

          <div style={s.actions}>
            <button style={s.btnCancelar} onClick={cancelar}>Cancelar</button>
            <button style={s.btnConfirmar} onClick={confirmar}>✓ Confirmar</button>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: { padding: '24px 20px' },
  micSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
  },
  mic: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    border: '2px solid var(--accent)',
    background: 'var(--bg-card)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(196,135,58,0.15)',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    touchAction: 'none',
  },
  micActive: {
    background: 'var(--accent)',
    boxShadow: '0 4px 32px rgba(196,135,58,0.4)',
    transform: 'scale(1.06)',
    animation: 'pulse-ring 1.2s ease infinite',
  },
  micProcessing: {
    border: '2px solid var(--border-strong)',
    cursor: 'default',
  },
  micIcon: { fontSize: '34px' },
  spinner: {
    display: 'block',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '3px solid var(--accent-soft)',
    borderTopColor: 'var(--accent)',
    animation: 'spin 0.8s linear infinite',
  },
  micHint: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    fontFamily: 'var(--font)',
    margin: 0,
  },
  transcript: {
    fontSize: '13px',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  error: {
    fontSize: '12px',
    color: 'var(--red)',
    textAlign: 'center',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  confirmCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: 'var(--shadow)',
  },
  confirmTranscript: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: 'var(--text-muted)',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  parsedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  parsedIcon: { fontSize: '32px' },
  parsedCat: {
    fontSize: '15px',
    fontWeight: 700,
    margin: '0 0 2px',
    fontFamily: 'var(--font)',
  },
  parsedMonto: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--accent)',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  envTag: {
    marginLeft: 'auto',
    fontSize: '11px',
    background: 'var(--accent-soft)',
    color: 'var(--accent-dim)',
    padding: '4px 12px',
    borderRadius: '100px',
    fontFamily: 'var(--font)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  lowConfidence: {
    fontSize: '11px',
    color: 'var(--accent)',
    background: 'var(--accent-soft)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    margin: 0,
    fontFamily: 'var(--font)',
  },
  actions: { display: 'flex', gap: '10px' },
  btnCancelar: {
    flex: 1,
    padding: '13px',
    border: '1px solid var(--border)',
    background: 'transparent',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontFamily: 'var(--font)',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  btnConfirmar: {
    flex: 2,
    padding: '13px',
    border: 'none',
    background: 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    fontFamily: 'var(--font)',
    fontWeight: 700,
    color: 'var(--bg-card)',
    cursor: 'pointer',
  },
}
