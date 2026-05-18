/**
 * useInsights – Hook para el motor de predicción proactiva (PRD §4)
 *
 * Lógica de disparador:
 * - Si es día 1 del mes, genera pregunta proactiva vía Claude
 * - Si hay tendencias fuera de rango, genera alerta empática
 * - Caches el mensaje en localStorage para no re-llamar en el mismo mes
 */

import { useState, useEffect } from 'react'
import { generarMensajeProactivo, recalcularProyeccion } from '@/utils/claudeApi'
import { resumenMesAnterior, tendenciaCategoria } from '@/utils/calculations'
import { nombreMes } from '@/utils/formatters'

const CACHE_KEY = 'mindset_insight_cache'

// Insights estáticos de fallback mientras carga o sin historial suficiente
const INSIGHTS_FALLBACK = [
  'Hola María ✨ ¿Cómo va el mes? Recuerda registrar tus gastos por voz o en dos toques.',
  'María, mantener el registro diario es la clave. Tu yo del futuro te lo agradece 🌿',
  'Cada peso que anotas hoy es claridad financiera mañana. Sigue así.',
]

export const useInsights = (movements) => {
  const [mensajePrincipal, setMensajePrincipal] = useState('')
  const [mensajeProactivo, setMensajeProactivo] = useState(null) // solo día 1
  const [alertas, setAlertas]                   = useState([])
  const [cargando, setCargando]                 = useState(false)

  // ─── Mensaje principal dinámico ─────────────────────────────────────────
  useEffect(() => {
    if (!movements.length) {
      setMensajePrincipal(INSIGHTS_FALLBACK[0])
      return
    }
    // Analiza tendencias localmente para el mensaje principal
    const tendComida     = tendenciaCategoria(movements, 'comida')
    const tendTransporte = tendenciaCategoria(movements, 'transporte')
    const nuevasAlertas  = []

    if (tendComida?.tendencia === 'alta') {
      nuevasAlertas.push(`Comida ${tendComida.diffPct}% sobre tu promedio. ¿Todo bien?`)
    }
    if (tendTransporte?.tendencia === 'alta') {
      nuevasAlertas.push(`Transporte un poco alto este mes. ¿Quieres ajustarlo?`)
    }

    setAlertas(nuevasAlertas)

    // Mensaje positivo si va bien
    const mensajes = [
      'María, vas muy bien este mes. Sigue así 🌿',
      'Tu registro está al día. Eso es disciplina real.',
      'Buen ritmo María. La constancia es el secreto.',
    ]
    setMensajePrincipal(mensajes[new Date().getDate() % mensajes.length])
  }, [movements])

  // ─── Mensaje proactivo (día 1 de cada mes) ──────────────────────────────
  useEffect(() => {
    const hoy = new Date()
    if (hoy.getDate() !== 1) return // Solo dispara el día 1 (PRD §4)

    const cacheKey = `${CACHE_KEY}_${hoy.getFullYear()}_${hoy.getMonth()}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      setMensajeProactivo(cached)
      return
    }

    const generarProactivo = async () => {
      setCargando(true)
      const resumen = resumenMesAnterior(movements)
      const mes = nombreMes()
      const result = await generarMensajeProactivo(resumen, mes)
      if (result.ok) {
        setMensajeProactivo(result.mensaje)
        try { localStorage.setItem(cacheKey, result.mensaje) } catch {}
      }
      setCargando(false)
    }

    generarProactivo()
  }, [movements])

  /** María responde al mensaje proactivo → recalcular proyección */
  const responderProactivo = async (respuesta, movements) => {
    setCargando(true)
    const resumen = resumenMesAnterior(movements)
    const result = await recalcularProyeccion(respuesta, resumen)
    if (result.ok) setMensajeProactivo(result.mensaje)
    setCargando(false)
  }

  return {
    mensajePrincipal,
    mensajeProactivo,
    alertas,
    cargando,
    responderProactivo,
  }
}
