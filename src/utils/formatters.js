/**
 * Utilidades de formato – Mindset Finance
 */

/** Formatea un número como moneda */
export const fmt = (monto, divisa = 'COP') => {
  if (divisa === 'USD') {
    return `$${Number(monto).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} USD`
  }
  return `$${Number(monto).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} COP`
}

/** Formato compacto: "30k" en lugar de "30.000" */
export const fmtCompact = (monto, divisa = 'COP') => {
  const n = Number(monto)
  if (divisa === 'USD') {
    return n >= 1000 ? `$${(n / 1000).toFixed(1)}k USD` : `$${n} USD`
  }
  return n >= 1000000
    ? `$${(n / 1000000).toFixed(1)}M`
    : n >= 1000
    ? `$${Math.round(n / 1000)}k`
    : `$${n}`
}

/** Nombre del mes en español */
export const nombreMes = (fecha = new Date()) => {
  return new Date(fecha).toLocaleDateString('es-CO', { month: 'long' })
}

/** Fecha corta: "15 may" */
export const fechaCorta = (isoString) => {
  return new Date(isoString).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  })
}

/** Cuántos días faltan para el día N del mes siguiente */
export const diasParaDia = (diaMes) => {
  const hoy = new Date()
  const objetivo = new Date(hoy.getFullYear(), hoy.getMonth(), diaMes)
  if (objetivo <= hoy) {
    objetivo.setMonth(objetivo.getMonth() + 1)
  }
  const diff = Math.ceil((objetivo - hoy) / (1000 * 60 * 60 * 24))
  return diff
}

/** Porcentaje de avance del mes actual (0-100) */
export const porcentajeMes = () => {
  const hoy = new Date()
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
  return Math.round((hoy.getDate() / diasEnMes) * 100)
}
