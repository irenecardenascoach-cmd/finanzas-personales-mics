export default function ProgressBar({ value = 0, max = 100, color, height = 6, style = {} }) {
  const pct = Math.min((value / max) * 100, 100)
  const barColor = color
    ?? (pct > 85 ? 'var(--red)' : pct > 65 ? 'var(--accent)' : 'var(--green)')

  return (
    <div style={{
      width: '100%',
      height,
      background: 'var(--border)',
      borderRadius: '100px',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: barColor,
        borderRadius: '100px',
        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}
