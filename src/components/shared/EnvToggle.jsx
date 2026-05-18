export default function EnvToggle({ value, onChange }) {
  return (
    <div style={s.wrap}>
      {['personal', 'negocio'].map((env) => (
        <button
          key={env}
          onClick={() => onChange(env)}
          style={{ ...s.btn, ...(value === env ? s.active : {}) }}
        >
          {env === 'personal' ? 'Personal' : 'Negocio'}
        </button>
      ))}
    </div>
  )
}

const s = {
  wrap: {
    display: 'flex',
    background: 'var(--border)',
    borderRadius: '100px',
    padding: '3px',
    gap: '2px',
  },
  btn: {
    border: 'none',
    background: 'transparent',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '12px',
    fontFamily: 'var(--font)',
    fontWeight: 500,
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition)',
    letterSpacing: '0.02em',
  },
  active: {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontWeight: 600,
    boxShadow: 'var(--shadow-sm)',
  },
}
