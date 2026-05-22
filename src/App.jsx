import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider, useStore } from '@/hooks/useStore'
import { ToastProvider } from '@/hooks/useToast'
import BottomNav from '@/components/layout/BottomNav'
import Toast from '@/components/layout/Toast'
import Auth from '@/pages/Auth'
import Onboarding from '@/pages/Onboarding'
import Pulso from '@/pages/Pulso'
import Registro from '@/pages/Registro'
import Tendencias from '@/pages/Tendencias'
import Refugio from '@/pages/Refugio'
import Consultora from '@/pages/Consultora'

function AppShell() {
  const { user, profile, logout } = useStore()

  // Not logged in → Auth screen
  if (!user) return <Auth />

  // Logged in but no profile → Onboarding
  if (!profile) return <Onboarding />

  // Full app
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100dvh' }}>
      {/* Top logout bar */}
      <div style={{ display:'flex', justifyContent:'flex-end', padding:'8px 16px 0', background:'var(--bg)' }}>
        <button onClick={logout} style={{
          fontSize:'11px', color:'var(--text-3)', fontWeight:600,
          padding:'4px 10px', borderRadius:'100px', border:'1px solid var(--border)',
          background:'transparent',
        }}>Salir ↩</button>
      </div>

      <main style={{ flex:1, overflowY:'auto', paddingBottom:'80px' }}>
        <Routes>
          <Route path="/"           element={<Pulso />} />
          <Route path="/registro"   element={<Registro />} />
          <Route path="/tendencias" element={<Tendencias />} />
          <Route path="/refugio"    element={<Refugio />} />
          <Route path="/consultora" element={<Consultora />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </StoreProvider>
    </ToastProvider>
  )
}
