/**
 * useStore.jsx — Central state store for Mindset Finance
 * Everything persists to localStorage automatically.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'

// ── Keys ─────────────────────────────────────────────────────────────────────
const KEY_PROFILE    = 'mf_profile'
const KEY_MOVEMENTS  = 'mf_movements'
const KEY_GOALS      = 'mf_goals'

// ── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_GOAL = {
  id: 'g1',
  name: 'Cama + Colchón',
  target: 1500000,
  saved: 0,
  currency: 'COP',
}

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ── Context ───────────────────────────────────────────────────────────────────
const StoreContext = createContext(null)

export const StoreProvider = ({ children }) => {
  const [profile,   setProfileState]   = useState(() => load(KEY_PROFILE,   null))
  const [movements, setMovementsState] = useState(() => load(KEY_MOVEMENTS, []))
  const [goals,     setGoalsState]     = useState(() => load(KEY_GOALS,     [DEFAULT_GOAL]))
  const [stressMode, setStressMode]    = useState(false) // 30% income reduction sim

  // Persist on change
  useEffect(() => { save(KEY_PROFILE,   profile)   }, [profile])
  useEffect(() => { save(KEY_MOVEMENTS, movements) }, [movements])
  useEffect(() => { save(KEY_GOALS,     goals)     }, [goals])

  // ── Profile ────────────────────────────────────────────────────────────────
  const saveProfile = useCallback((data) => {
    setProfileState({ ...data, createdAt: new Date().toISOString() })
  }, [])

  const updateProfile = useCallback((data) => {
    setProfileState(prev => ({ ...prev, ...data }))
  }, [])

  // ── Movements ─────────────────────────────────────────────────────────────
  const addMovement = useCallback((data) => {
    const m = {
      id:       uuid(),
      date:     new Date().toISOString().split('T')[0],
      mode:     'manual',
      currency: 'COP',
      ...data,
    }
    setMovementsState(prev => [m, ...prev])
    return m
  }, [])

  const updateMovement = useCallback((id, patch) => {
    setMovementsState(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  }, [])

  const deleteMovement = useCallback((id) => {
    setMovementsState(prev => prev.filter(m => m.id !== id))
  }, [])

  // ── Goals ─────────────────────────────────────────────────────────────────
  const updateGoal = useCallback((id, patch) => {
    setGoalsState(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
  }, [])

  const addGoalDeposit = useCallback((id, amount) => {
    setGoalsState(prev => prev.map(g =>
      g.id === id ? { ...g, saved: Math.max(0, (g.saved || 0) + amount) } : g
    ))
  }, [])

  // ── Computed financials ───────────────────────────────────────────────────
  const now = new Date()
  const currentMonthMovements = movements.filter(m => {
    const d = new Date(m.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalIncome  = currentMonthMovements.filter(m => m.type === 'income').reduce((s,m) => s+m.amount, 0)
  const totalExpense = currentMonthMovements.filter(m => m.type === 'expense').reduce((s,m) => s+m.amount, 0)

  // Apply stress mode: simulate 30% income drop
  const effectiveIncome = stressMode ? totalIncome * 0.7 : totalIncome
  const balance         = effectiveIncome - totalExpense

  // Baseline from onboarding (frozen lifestyle)
  const baselineExpenses = profile ? (profile.fixedExpenses || 0) : 0
  const baselineIncome   = profile ? (profile.monthlyIncome || 0) : 0

  // 50/30/20 rule applied to effective income
  const rule50 = effectiveIncome * 0.50
  const rule30 = effectiveIncome * 0.30
  const rule20 = effectiveIncome * 0.20

  // Lifestyle overage vs frozen baseline
  const lifestyleUsed   = totalExpense
  const lifestyleFrozen = baselineExpenses
  const investmentCapital = Math.max(0, effectiveIncome - lifestyleFrozen)

  // Survival months
  const survivalMonths = baselineExpenses > 0
    ? (goals.reduce((s,g) => s+g.saved, 0) / baselineExpenses).toFixed(1)
    : 0

  return (
    <StoreContext.Provider value={{
      // State
      profile, movements, goals, stressMode,
      // Profile actions
      saveProfile, updateProfile,
      // Movement actions
      addMovement, updateMovement, deleteMovement,
      // Goal actions
      updateGoal, addGoalDeposit,
      // Sim
      setStressMode,
      // Computed
      currentMonthMovements,
      totalIncome, totalExpense, effectiveIncome, balance,
      baselineExpenses, baselineIncome,
      rule50, rule30, rule20,
      lifestyleUsed, lifestyleFrozen, investmentCapital,
      survivalMonths,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be inside StoreProvider')
  return ctx
}
