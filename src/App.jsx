import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from '@/hooks/useStore'
import { ToastProvider } from '@/hooks/useToast'
import BottomNav from '@/components/layout/BottomNav'
import Toast from '@/components/layout/Toast'
import Onboarding from '@/pages/Onboarding'
import Pulso from '@/pages/Pulso'
import Registro from '@/pages/Registro'
import Tendencias from '@/pages/Tendencias'
import Refugio from '@/pages/Refugio'
import Consultora from '@/pages/Consultora'
import { useStore } from '@/hooks/useStore'

function AppShell() {
  const { profile } = useStore()
  if (!profile) return <Onboarding />
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100dvh' }}>
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
