export const fmt = (n, currency = 'COP') => {
  const num = Number(n) || 0
  if (currency === 'USD') return `$${num.toLocaleString('en-US', { minimumFractionDigits: 0 })} USD`
  return `$${num.toLocaleString('es-CO')} COP`
}
export const fmtCompact = (n) => {
  const num = Number(n) || 0
  if (num >= 1000000) return `$${(num/1000000).toFixed(1)}M`
  if (num >= 1000)    return `$${Math.round(num/1000)}k`
  return `$${num}`
}
export const monthName = (date = new Date()) =>
  new Date(date).toLocaleDateString('es-CO', { month: 'long' })
export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
export const monthProgress = () => {
  const d = new Date()
  return Math.round((d.getDate() / new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()) * 100)
}
export const lastNMonths = (n = 6) => {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n-1-i), 1)
    return { label: d.toLocaleDateString('es-CO', { month: 'short' }), date: d }
  })
}
