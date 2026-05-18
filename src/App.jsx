import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from '@/components/layout/BottomNav'
import Toast from '@/components/layout/Toast'
import Pulso from '@/pages/Pulso'
import Registro from '@/pages/Registro'
import Tendencias from '@/pages/Tendencias'
import Refugio from '@/pages/Refugio'
import { MovementsProvider } from '@/hooks/useMovements'
import { ToastProvider } from '@/hooks/useToast'

export default function App() {
  return (
    <ToastProvider>
      <MovementsProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
            <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
              <Routes>
                <Route path="/"           element={<Pulso />} />
                <Route path="/registro"   element={<Registro />} />
                <Route path="/tendencias" element={<Tendencias />} />
                <Route path="/refugio"    element={<Refugio />} />
                <Route path="*"           element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <BottomNav />
            <Toast />
          </div>
        </BrowserRouter>
      </MovementsProvider>
    </ToastProvider>
  )
}
