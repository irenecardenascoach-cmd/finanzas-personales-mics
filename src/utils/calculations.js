/**
 * Cálculos financieros – Mindset Finance
 * PRD §3 Tabla A + §4 Motor de Predicción
 */

const mesActual = () => {
  const hoy = new Date()
  return { mes: hoy.getMonth(), anio: hoy.getFullYear() }
}

/** Filtra movimientos del mes y año dados */
export const movimientosDeMes = (movements, mes, anio) => {
  return movements.filter((m) => {
    const f = new Date(m.fecha)
    return f.getMonth() === mes && f.getFullYear() === anio
  })
}

/** Suma total gastado en una categoría en un array de movimientos */
export const gastadoEnCategoria = (movements, categoriaId) => {
  return movements
    .filter((m) => m.categoria === categoriaId && m.tipo === 'gasto')
    .reduce((sum, m) => sum + m.monto, 0)
}

/** Balance neto de un entorno en el mes actual */
export const balanceNeto = (movements, entorno) => {
  const { mes, anio } = mesActual()
  const del_mes = movimientosDeMes(movements, mes, anio).filter(
    (m) => m.entorno === entorno
  )
  const ingresos = del_mes
    .filter((m) => m.tipo === 'ingreso')
    .reduce((s, m) => s + m.monto, 0)
  const gastos = del_mes
    .filter((m) => m.tipo === 'gasto')
    .reduce((s, m) => s + m.monto, 0)
  return { ingresos, gastos, neto: ingresos - gastos }
}

/** Promedio de gasto por categoría en los últimos N meses */
export const promedioCategoria = (movements, categoriaId, nMeses = 3) => {
  const hoy = new Date()
  let total = 0
  let mesesConDatos = 0

  for (let i = 1; i <= nMeses; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const del_mes = movimientosDeMes(movements, fecha.getMonth(), fecha.getFullYear())
    const gasto = gastadoEnCategoria(del_mes, categoriaId)
    if (gasto > 0) {
      total += gasto
      mesesConDatos++
    }
  }

  return mesesConDatos > 0 ? Math.round(total / mesesConDatos) : null
}

/** Resumen de gastos variables del mes anterior (para prompt de predicción) */
export const resumenMesAnterior = (movements) => {
  const hoy = new Date()
  const mesAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1)
  const del_mes = movimientosDeMes(
    movements,
    mesAnt.getMonth(),
    mesAnt.getFullYear()
  ).filter((m) => m.entorno === 'personal' && m.tipo === 'gasto')

  const por_categoria = {}
  del_mes.forEach((m) => {
    if (!por_categoria[m.categoria]) por_categoria[m.categoria] = 0
    por_categoria[m.categoria] += m.monto
  })

  return {
    mes: mesAnt.toLocaleDateString('es-CO', { month: 'long' }),
    totalGastos: Object.values(por_categoria).reduce((s, v) => s + v, 0),
    por_categoria,
  }
}

/** Ahorro acumulado para la meta de cama+colchón */
export const ahorroMeta = (movements) => {
  return movements
    .filter((m) => m.categoria === 'fondo_prevision' && m.tipo === 'ahorro')
    .reduce((s, m) => s + m.monto, 0)
}

/** Tendencia: compara gasto actual vs promedio histórico (%) */
export const tendenciaCategoria = (movements, categoriaId) => {
  const { mes, anio } = mesActual()
  const actual = gastadoEnCategoria(
    movimientosDeMes(movements, mes, anio),
    categoriaId
  )
  const promedio = promedioCategoria(movements, categoriaId)

  if (!promedio || promedio === 0) return null

  const diff = ((actual - promedio) / promedio) * 100
  return {
    actual,
    promedio,
    diffPct: Math.round(diff),
    tendencia: diff > 10 ? 'alta' : diff < -10 ? 'baja' : 'normal',
  }
}

/** Genera datos para gráfico de barras de los últimos 4 meses */
export const datosGrafico = (movements, categoriaId) => {
  const hoy = new Date()
  return Array.from({ length: 4 }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (3 - i), 1)
    const del_mes = movimientosDeMes(movements, fecha.getMonth(), fecha.getFullYear())
    const gasto = gastadoEnCategoria(del_mes, categoriaId)
    return {
      mes: fecha.toLocaleDateString('es-CO', { month: 'short' }),
      monto: gasto,
      esActual: i === 3,
    }
  })
}
