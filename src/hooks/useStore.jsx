import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { v4 as uuid } from 'uuid'

const KEY_PROFILE   = 'mf_profile'
const KEY_MOVEMENTS = 'mf_movements'
const KEY_GOALS     = 'mf_goals'
const KEY_USER      = 'mf_user'

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

const StoreContext = createContext(null)

export const StoreProvider = ({ children }) => {
  const [user,       setUserState]      = useState(() => load(KEY_USER,      null))
  const [profile,    setProfileState]   = useState(() => load(KEY_PROFILE,   null))
  const [movements,  setMovementsState] = useState(() => load(KEY_MOVEMENTS, []))
  const [goals,      setGoalsState]     = useState(() => load(KEY_GOALS,     []))
  const [stressMode, setStressMode]     = useState(false)

  useEffect(() => { save(KEY_USER,      user)      }, [user])
  useEffect(() => { save(KEY_PROFILE,   profile)   }, [profile])
  useEffect(() => { save(KEY_MOVEMENTS, movements) }, [movements])
  useEffect(() => { save(KEY_GOALS,     goals)     }, [goals])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const signup = useCallback((email, password, name) => {
    const existing = load('mf_accounts', [])
    if (existing.find(a => a.email === email)) return { ok: false, error: 'Ese correo ya está registrado.' }
    const newUser = { id: uuid(), email, password, name, createdAt: new Date().toISOString() }
    save('mf_accounts', [...existing, newUser])
    const { password: _, ...safeUser } = newUser
    setUserState(safeUser)
    return { ok: true }
  }, [])

  const login = useCallback((email, password) => {
    const accounts = load('mf_accounts', [])
    const found = accounts.find(a => a.email === email && a.password === password)
    if (!found) return { ok: false, error: 'Correo o contraseña incorrectos.' }
    const { password: _, ...safeUser } = found
    setUserState(safeUser)
    // Load this user's data
    const uProfile   = load(`mf_profile_${found.id}`,   null)
    const uMovements = load(`mf_movements_${found.id}`,  [])
    const uGoals     = load(`mf_goals_${found.id}`,      [])
    setProfileState(uProfile)
    setMovementsState(uMovements)
    setGoalsState(uGoals)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    // Save user-specific data before logout
    if (user?.id) {
      save(`mf_profile_${user.id}`,   profile)
      save(`mf_movements_${user.id}`, movements)
      save(`mf_goals_${user.id}`,     goals)
    }
    setUserState(null)
    setProfileState(null)
    setMovementsState([])
    setGoalsState([])
    save(KEY_USER, null)
  }, [user, profile, movements, goals])

  // Persist user-specific data on change
  useEffect(() => {
    if (user?.id) {
      save(`mf_profile_${user.id}`,   profile)
      save(`mf_movements_${user.id}`, movements)
      save(`mf_goals_${user.id}`,     goals)
    }
  }, [user, profile, movements, goals])

  // ── Profile ───────────────────────────────────────────────────────────────
  const saveProfile = useCallback((data) => {
    setProfileState({ ...data, createdAt: new Date().toISOString() })
    // Create initial goal from onboarding if none exist
    setGoalsState(prev => {
      if (prev && prev.length > 0) return prev
      if (!data.goalName && !data.goalTarget) return prev
      return [{
        id:       uuid(),
        name:     data.goalName || 'Meta de ahorro',
        target:   parseFloat(data.goalTarget) || 1500000,
        saved:    0,
        currency: 'COP',
        color:    '#C4873A',
        createdAt: new Date().toISOString(),
      }]
    })
  }, [])

  const updateProfile = useCallback((data) => {
    setProfileState(prev => ({ ...prev, ...data }))
  }, [])

  // ── Movements ─────────────────────────────────────────────────────────────
  const addMovement = useCallback((data) => {
    const m = { id: uuid(), date: new Date().toISOString().split('T')[0], mode:'manual', currency:'COP', env:'personal', ...data }
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
  const addGoal = useCallback((data) => {
    const g = {
      id:        uuid(),
      name:      data.name || 'Nueva meta',
      target:    parseFloat(data.target) || 0,
      saved:     0,
      currency:  data.currency || 'COP',
      color:     data.color || '#C4873A',
      createdAt: new Date().toISOString(),
    }
    setGoalsState(prev => [...prev, g])
    return g
  }, [])

  const updateGoal = useCallback((id, patch) => {
    setGoalsState(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g))
  }, [])

  const deleteGoal = useCallback((id) => {
    setGoalsState(prev => prev.filter(g => g.id !== id))
  }, [])

  const addGoalDeposit = useCallback((id, amount) => {
    setGoalsState(prev => prev.map(g =>
      g.id === id ? { ...g, saved: Math.max(0, (g.saved || 0) + amount) } : g
    ))
  }, [])

  // ── Computed ──────────────────────────────────────────────────────────────
  const now = new Date()
  const currentMonthMovements = movements.filter(m => {
    const d = new Date(m.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const personalMovements = currentMonthMovements.filter(m => m.env !== 'business')
  const businessMovements = currentMonthMovements.filter(m => m.env === 'business')

  const totalIncome     = currentMonthMovements.filter(m => m.type==='income').reduce((s,m)  => s+m.amount, 0)
  const totalExpense    = currentMonthMovements.filter(m => m.type==='expense').reduce((s,m) => s+m.amount, 0)
  const personalIncome  = personalMovements.filter(m => m.type==='income').reduce((s,m)  => s+m.amount, 0)
  const personalExpense = personalMovements.filter(m => m.type==='expense').reduce((s,m) => s+m.amount, 0)
  const businessIncome  = businessMovements.filter(m => m.type==='income').reduce((s,m)  => s+m.amount, 0)
  const businessExpense = businessMovements.filter(m => m.type==='expense').reduce((s,m) => s+m.amount, 0)

  const effectiveIncome   = stressMode ? totalIncome * 0.7 : totalIncome
  const balance           = effectiveIncome - totalExpense
  const baselineExpenses  = profile?.fixedExpenses || 0
  const rule50 = effectiveIncome * 0.50
  const rule30 = effectiveIncome * 0.30
  const rule20 = effectiveIncome * 0.20
  const investmentCapital = Math.max(0, effectiveIncome - baselineExpenses)
  const totalSaved        = goals.reduce((s,g) => s + (g.saved||0), 0)
  const survivalMonths    = baselineExpenses > 0 ? (totalSaved / baselineExpenses).toFixed(1) : 0

  return (
    <StoreContext.Provider value={{
      user, profile, movements, goals, stressMode,
      signup, login, logout,
      saveProfile, updateProfile,
      addMovement, updateMovement, deleteMovement,
      addGoal, updateGoal, deleteGoal, addGoalDeposit,
      setStressMode,
      currentMonthMovements, personalMovements, businessMovements,
      totalIncome, totalExpense, effectiveIncome, balance,
      personalIncome, personalExpense, businessIncome, businessExpense,
      baselineExpenses, rule50, rule30, rule20,
      investmentCapital, survivalMonths, totalSaved,
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
