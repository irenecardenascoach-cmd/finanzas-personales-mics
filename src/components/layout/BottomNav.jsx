import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',           icon: '◉', label: 'Pulso' },
  { to: '/registro',   icon: '+', label: 'Registro',  primary: true },
  { to: '/tendencias', icon: '↗', label: 'Tendencias' },
  { to: '/refugio',    icon: '🛏', label: 'Refugio' },
]

export default function BottomNav() {
  return (
    <nav style={s.nav}>
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          style={({ isActive }) => ({
            ...s.tab,
            ...(tab.primary ? s.tabPrimary : {}),
            ...(isActive && !tab.primary ? s.tabActive : {}),
          })}
        >
          <span style={tab.primary ? s.iconPrimary : s.icon}>{tab.icon}</span>
          {!tab.primary && <span style={s.label}>{tab.label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}

const s = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '430px',
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '10px 16px 18px',
    zIndex: 100,
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    textDecoration: 'none',
    color: 'var(--text-muted)',
    flex: 1,
    transition: 'color var(--transition)',
  },
  tabActive: {
    color: 'var(--accent)',
  },
  tabPrimary: {
    flex: '0 0 56px',
  },
  icon: {
    fontSize: '20px',
    lineHeight: 1,
  },
  iconPrimary: {
    width: '52px',
    height: '52px',
    background: 'var(--text-primary)',
    color: 'var(--bg-card)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: '300',
    marginTop: '-20px',
    boxShadow: '0 8px 24px rgba(45,52,54,0.25)',
  },
  label: {
    fontSize: '10px',
    fontFamily: 'var(--font)',
    letterSpacing: '0.04em',
    fontWeight: 500,
  },
}
