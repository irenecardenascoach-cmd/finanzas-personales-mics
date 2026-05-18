/**
 * useAudioInput – Hook para grabar audio, transcribir y parsear (PRD §1)
 *
 * Flujo:
 * 1. Usuario presiona micrófono
 * 2. MediaRecorder captura el audio
 * 3. Audio → Whisper API → transcript de texto
 * 4. Transcript → Claude API → { monto, categoria, entorno, nota, feedback }
 * 5. Se muestra tarjeta de confirmación
 * 6. Si confirma → addMovement()
 */

import { useState, useRef, useCallback } from 'react'
import { parsearAudio } from '@/utils/claudeApi'

export const ESTADOS = {
  IDLE:        'idle',
  GRABANDO:    'grabando',
  PROCESANDO:  'procesando',
  CONFIRMANDO: 'confirmando',
  ERROR:       'error',
}

export const useAudioInput = () => {
  const [estado, setEstado]           = useState(ESTADOS.IDLE)
  const [transcript, setTranscript]   = useState('')
  const [parsedEntry, setParsedEntry] = useState(null)
  const [error, setError]             = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])

  const iniciarGrabacion = useCallback(async () => {
    try {
      setEstado(ESTADOS.GRABANDO)
      setError(null)
      setParsedEntry(null)
      setTranscript('')
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        await _procesarAudio()
      }

      recorder.start()
    } catch (err) {
      setError('No se pudo acceder al micrófono. Verifica los permisos.')
      setEstado(ESTADOS.ERROR)
    }
  }, [])

  const detenerGrabacion = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setEstado(ESTADOS.PROCESANDO)
    }
  }, [])

  const _procesarAudio = async () => {
    setEstado(ESTADOS.PROCESANDO)

    const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY
    let textoTranscrito = ''

    try {
      if (OPENAI_KEY && OPENAI_KEY !== 'sk-XXXXXXXXXXXXXXXXXXXXXXXXX') {
        // ── Ruta real: Whisper API ──────────────────────────────────────────
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('file', blob, 'audio.webm')
        formData.append('model', 'whisper-1')
        formData.append('language', 'es')

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${OPENAI_KEY}` },
          body: formData,
        })

        if (!res.ok) throw new Error(`Whisper error ${res.status}`)
        const data = await res.json()
        textoTranscrito = data.text || ''
      } else {
        // ── Modo simulado (sin clave Whisper) ───────────────────────────────
        await new Promise((r) => setTimeout(r, 800))
        textoTranscrito = 'Anota 30 mil pesos de comida, fue el mercado'
      }

      setTranscript(textoTranscrito)

      // ── Claude: parsear el transcript ────────────────────────────────────
      const result = await parsearAudio(textoTranscrito)

      if (result.ok) {
        setParsedEntry(result.data)
        setEstado(ESTADOS.CONFIRMANDO)
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(`Error al procesar: ${err.message}`)
      setEstado(ESTADOS.ERROR)
    }
  }

  const cancelar = useCallback(() => {
    setParsedEntry(null)
    setTranscript('')
    setError(null)
    setEstado(ESTADOS.IDLE)
  }, [])

  return {
    estado,
    transcript,
    parsedEntry,
    error,
    iniciarGrabacion,
    detenerGrabacion,
    cancelar,
    estaGrabando: estado === ESTADOS.GRABANDO,
    estaProcesando: estado === ESTADOS.PROCESANDO,
    estaConfirmando: estado === ESTADOS.CONFIRMANDO,
  }
}
