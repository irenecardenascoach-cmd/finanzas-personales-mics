/**
 * claudeApi.js – Wrapper Anthropic Claude API
 * PRD §1 (parsing audio) y §4 (motor de predicción)
 */

import { AUDIO_PARSING_SYSTEM_PROMPT, PREDICTION_SYSTEM_PROMPT } from '@/data/baseline'
import { fmt } from './formatters'

const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL   = 'claude-sonnet-4-20250514'
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const callClaude = async (systemPrompt, userMessage, maxTokens = 500) => {
  if (!API_KEY || API_KEY === 'sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXX') {
    throw new Error('NO_API_KEY')
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`)
  const data = await res.json()
  const text = data.content?.find((b) => b.type === 'text')?.text || ''
  return text
}

// ─── PARSING DE AUDIO (PRD §1) ───────────────────────────────────────────────

/**
 * Interpreta el texto transcrito de María y extrae los datos del movimiento.
 * @param {string} transcript - texto transcrito del audio
 * @returns {object} - { monto, divisa, categoria, entorno, tipo, nota, feedback, confianza }
 */
export const parsearAudio = async (transcript) => {
  try {
    const raw = await callClaude(AUDIO_PARSING_SYSTEM_PROMPT, transcript)
    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return { ok: true, data: parsed }
  } catch (err) {
    if (err.message === 'NO_API_KEY') {
      // Modo simulado para desarrollo sin clave
      return { ok: true, data: _parsearSimulado(transcript), simulado: true }
    }
    return { ok: false, error: err.message }
  }
}

/** Fallback mock cuando no hay clave API */
const _parsearSimulado = (transcript) => {
  const t = transcript.toLowerCase()
  let categoria = 'comida'
  let entorno = 'personal'
  let monto = 0

  // Detección de categoría por palabras clave
  if (t.includes('comida') || t.includes('mercado') || t.includes('restaurante')) categoria = 'comida'
  else if (t.includes('transporte') || t.includes('uber') || t.includes('bus'))    categoria = 'transporte'
  else if (t.includes('luz') || t.includes('agua') || t.includes('servicios'))     categoria = 'servicios_publicos'
  else if (t.includes('cuidado') || t.includes('peluquería') || t.includes('crema')) categoria = 'cuidado_personal'
  else if (t.includes('hipnosis') || t.includes('baile') || t.includes('clases'))  categoria = 'estilo_de_vida'
  else if (t.includes('cama') || t.includes('colchón') || t.includes('ahorro'))    categoria = 'fondo_prevision'
  else if (t.includes('edición') || t.includes('editor') || t.includes('video'))   { categoria = 'edicion_video'; entorno = 'negocio' }
  else if (t.includes('pauta') || t.includes('publicidad'))                         { categoria = 'publicidad_varios'; entorno = 'negocio' }

  // Extracción de monto (busca números seguidos de "mil", "k", o número solo)
  const milMatch  = t.match(/(\d+)\s*(mil|k)/i)
  const numMatch  = t.match(/\$?\s*(\d[\d.,]*)/i)
  if (milMatch)     monto = parseInt(milMatch[1]) * 1000
  else if (numMatch) monto = parseFloat(numMatch[1].replace(/[.,]/g, '')) || 0

  return {
    monto,
    divisa: entorno === 'negocio' ? 'USD' : 'COP',
    categoria,
    entorno,
    tipo: categoria === 'fondo_prevision' ? 'ahorro' : 'gasto',
    nota: transcript.slice(0, 30),
    feedback: '¡Anotado! Todo en orden por aquí 🌿',
    confianza: 0.75,
  }
}

// ─── MOTOR DE PREDICCIÓN PROACTIVA (PRD §4) ───────────────────────────────────

/**
 * Genera el mensaje proactivo de inicio de mes basado en el historial.
 * @param {object} resumen - resumen del mes anterior (de calculations.js)
 * @param {string} nombreMes - nombre del mes que comienza
 * @returns {string} - mensaje en lenguaje natural para María
 */
export const generarMensajeProactivo = async (resumen, nombreMes) => {
  const context = `
Historial del mes de ${resumen.mes}:
- Total gastos variables: ${fmt(resumen.totalGastos, 'COP')}
- Por categoría: ${Object.entries(resumen.por_categoria)
    .map(([cat, monto]) => `${cat}: ${fmt(monto)}`)
    .join(', ')}
- Mes que comienza: ${nombreMes}
  `.trim()

  try {
    const mensaje = await callClaude(PREDICTION_SYSTEM_PROMPT, context, 200)
    return { ok: true, mensaje: mensaje.trim() }
  } catch (err) {
    if (err.message === 'NO_API_KEY') {
      return {
        ok: true,
        mensaje: `Hola María. Basado en ${resumen.mes}, proyectamos ${fmt(resumen.totalGastos)} en gastos variables este mes. ¿Tienes algún imprevisto o gasto nuevo planeado?`,
        simulado: true,
      }
    }
    return { ok: false, error: err.message }
  }
}

/**
 * Recalcula la proyección cuando María responde sobre imprevistos (PRD §4 paso 3).
 * @param {string} respuestaUsuaria - lo que María escribió
 * @param {object} resumen - resumen mes anterior
 * @returns {string} - proyección actualizada
 */
export const recalcularProyeccion = async (respuestaUsuaria, resumen) => {
  const prompt = `
María respondió sobre imprevistos para este mes: "${respuestaUsuaria}"
Su gasto variable promedio es ${fmt(resumen.totalGastos)}.
Responde en UNA sola frase empática y directa actualizando la proyección.
  `.trim()

  try {
    const msg = await callClaude(PREDICTION_SYSTEM_PROMPT, prompt, 150)
    return { ok: true, mensaje: msg.trim() }
  } catch {
    return {
      ok: true,
      mensaje: `Listo María, lo tuve en cuenta. Ajusté tu proyección para este mes. 🌿`,
      simulado: true,
    }
  }
}
