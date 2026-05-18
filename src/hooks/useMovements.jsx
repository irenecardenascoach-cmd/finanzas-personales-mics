/**
 * useMovements – Hook + Context para CRUD de movimientos (Tabla A PRD §3)
 * Persistencia: localStorage → migrar a Airtable/Glide en producción
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { ALL_MOCK_MOVEMENTS } from '@/data/mockMovements'

const STORAGE_KEY = 'mindset_finance_movements'

const MovementsContext = createContext(null)

export const MovementsProvider = ({ children }) => {
  const [movements, setMovements] = useState([])

  // Carga inicial: localStorage → fallback a mock
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setMovements(JSON.parse(stored))
      } else {
        setMovements(ALL_MOCK_MOVEMENTS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ALL_MOCK_MOVEMENTS))
      }
    } catch {
      setMovements(ALL_MOCK_MOVEMENTS)
    }
  }, [])

  const persist = useCallback((next) => {
    setMovements(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }, [])

  /** Agregar un movimiento nuevo */
  const addMovement = useCallback((data) => {
    const nuevo = {
      id: uuid(),
      fecha: new Date().toISOString().split('T')[0],
      modo: 'manual',
      ...data,
    }
    persist((prev) => [nuevo, ...prev])
    return nuevo
  }, [persist])

  /** Eliminar un movimiento por ID */
  const removeMovement = useCallback((id) => {
    persist((prev) => prev.filter((m) => m.id !== id))
  }, [persist])

  /** Reiniciar a datos de prueba (útil en dev) */
  const resetToMock = useCallback(() => {
    persist(ALL_MOCK_MOVEMENTS)
  }, [persist])

  return (
    <MovementsContext.Provider value={{ movements, addMovement, removeMovement, resetToMock }}>
      {children}
    </MovementsContext.Provider>
  )
}

export const useMovements = () => {
  const ctx = useContext(MovementsContext)
  if (!ctx) throw new Error('useMovements debe usarse dentro de <MovementsProvider>')
  return ctx
}
