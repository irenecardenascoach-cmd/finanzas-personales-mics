import { useState } from 'react'
import InsightBanner from '@/components/pulse/InsightBanner'
import BalanceCard from '@/components/pulse/BalanceCard'
import AlertsList from '@/components/pulse/AlertsList'
import EnvToggle from '@/components/shared/EnvToggle'

export default function Pulso() {
  const [env, setEnv] = useState('personal')

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 20px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <span style={{
          fontSize: '28px',
          fontWeight: 900,
          color: 'var(--accent)',
          letterSpacing: '-1px',
          fontFamily: 'var(--font)',
        }}>m.</span>
        <EnvToggle value={env} onChange={setEnv} />
      </div>

      {/* Sección Superior: Feedback inteligente (PRD §2 Pantalla 1) */}
      <InsightBanner />

      {/* Sección Central: Bolsillos separados (PRD §2 Pantalla 1) */}
      <div style={{ padding: '20px 0 0' }}>
        <BalanceCard entorno={env} />
      </div>

      {/* Sección Inferior: Alertas activas (PRD §2 Pantalla 1) */}
      <AlertsList />
    </div>
  )
}
