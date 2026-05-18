/**
 * TABLA B – PRESUPUESTOS Y LÍNEAS BASE (PRD §3)
 * Fuente: PRD v2.0 + contexto financiero de María
 *
 * montoBase: null = "Sin predefinir (Por tendencia)" → la app aprende del historial
 * ajusteDinamico: descripción del criterio (PRD imagen 2)
 */

export const BASELINE = {
  // ─── ENTORNO PERSONAL ──────────────────────────────────────────────────────
  personal: {
    ingresoMensual: 800,        // USD – flujo fijo del mes
    divisa: 'USD',

    categorias: [
      {
        id: 'ingreso_principal',
        label: 'Ingreso Principal',
        icon: '💵',
        tipo: 'ingreso',
        montoBase: 800,
        divisa: 'USD',
        ajusteDinamico: 'Flujo de entrada fijo del mes.',
        editable: true,
      },
      {
        id: 'arriendo_seguros',
        label: 'Arriendo y Seguros',
        icon: '🏠',
        tipo: 'gasto_fijo',
        montoBase: null,          // Variable según contrato
        divisa: 'COP',
        ajusteDinamico: 'Pago mensual indiscutible.',
        editable: true,
        alerta: { diasAntes: 4, mensaje: 'Arriendo y seguros: faltan {n} días.' },
      },
      {
        id: 'colegio_isaac',
        label: 'Colegio Isaac',
        icon: '📚',
        tipo: 'gasto_fijo',
        montoBase: 219000,        // COP exactos del PRD
        divisa: 'COP',
        ajusteDinamico: 'Prioridad alta de pago mensual.',
        editable: false,
        alerta: { diasAntes: 4, mensaje: 'Colegio de Isaac: faltan {n} días.' },
      },
      {
        id: 'internet_celular',
        label: 'Internet y Celular',
        icon: '📡',
        tipo: 'gasto_fijo',
        montoBase: null,          // Monto fijo mensual – usuario lo define
        divisa: 'COP',
        ajusteDinamico: 'Suscripción de conectividad.',
        editable: true,
      },
      {
        id: 'servicios_publicos',
        label: 'Servicios Públicos',
        icon: '💡',
        tipo: 'gasto_variable',
        montoBase: null,          // Sin predefinir – por tendencia
        divisa: 'COP',
        ajusteDinamico: 'Agua, luz, gas. Ajustado según el historial.',
        editable: true,
        nota: 'Suele subir ~10% en temporada alta.',
      },
      {
        id: 'comida',
        label: 'Comida',
        icon: '🥗',
        tipo: 'gasto_variable',
        montoBase: null,          // Sin predefinir – por tendencia
        divisa: 'COP',
        ajusteDinamico: 'Cenas/fines de semana para dos; diario para María.',
        editable: true,
      },
      {
        id: 'transporte',
        label: 'Transporte',
        icon: '🚌',
        tipo: 'gasto_variable',
        montoBase: null,          // Sin predefinir – por tendencia
        divisa: 'COP',
        ajusteDinamico: 'Presupuesto base para salidas controladas.',
        editable: true,
      },
      {
        id: 'cuidado_personal',
        label: 'Cuidado Personal',
        icon: '🧴',
        tipo: 'gasto_variable',
        montoBase: null,          // Sin predefinir – por tendencia
        divisa: 'COP',
        ajusteDinamico: 'Elementos de aseo y cuidado diario.',
        editable: true,
      },
      {
        id: 'estilo_de_vida',
        label: 'Estilo de Vida',
        icon: '🌀',
        tipo: 'gasto_variable',
        montoBase: null,          // Sin predefinir – por tendencia
        divisa: 'COP',
        ajusteDinamico: 'Sesiones de hipnosis y clases de baile.',
        editable: true,
      },
      {
        id: 'fondo_prevision',
        label: 'Fondo de Previsión',
        icon: '🛏️',
        tipo: 'ahorro',
        montoBase: null,          // Variable – destinado a mantenimiento + meta cama/colchón
        divisa: 'COP',
        ajusteDinamico: 'Destinado a mantenimiento y meta de Cama + Colchón.',
        editable: true,
        esMeta: true,
        meta: {
          id: 'cama_colchon',
          label: 'Cama + Colchón',
          icon: '🛏️',
          montoObjetivo: 1500000, // COP – ajustable por María
        },
      },
    ],
  },

  // ─── ENTORNO NEGOCIO (MARCA PERSONAL) ──────────────────────────────────────
  negocio: {
    nombre: 'Relation Line™',
    divisa: 'USD',
    costosOperativosTotales: 340, // USD = 200 + 40 + 100

    categorias: [
      {
        id: 'edicion_video',
        label: 'Edición de Video',
        icon: '🎬',
        tipo: 'gasto_fijo',
        montoBase: 200,
        divisa: 'USD',
        ajusteDinamico: 'Costo de contenido para Instagram de la marca.',
        editable: false,
      },
      {
        id: 'herramientas_ia',
        label: 'Herramientas IA',
        icon: '🤖',
        tipo: 'gasto_fijo',
        montoBase: 40,
        divisa: 'USD',
        ajusteDinamico: 'Suscripciones digitales de trabajo.',
        editable: true,
      },
      {
        id: 'publicidad_varios',
        label: 'Publicidad / Varios',
        icon: '📣',
        tipo: 'gasto_variable',
        montoBase: 100,
        divisa: 'USD',
        ajusteDinamico: 'Presupuesto asignado para crecimiento de marca.',
        editable: true,
      },
    ],
  },
}

// ─── HELPERS DE BASELINE ────────────────────────────────────────────────────

/** Devuelve una categoría por su ID (busca en ambos entornos) */
export const getCategoryById = (id) => {
  const all = [
    ...BASELINE.personal.categorias,
    ...BASELINE.negocio.categorias,
  ]
  return all.find((c) => c.id === id) || null
}

/** Categorías rápidas para la Pantalla 2 (El Registro) – solo variables */
export const QUICK_CATEGORIES_PERSONAL = BASELINE.personal.categorias.filter(
  (c) => ['gasto_variable', 'gasto_fijo', 'ahorro'].includes(c.tipo)
)

export const QUICK_CATEGORIES_NEGOCIO = BASELINE.negocio.categorias

/** System prompt para el motor de predicción (PRD §4) */
export const PREDICTION_SYSTEM_PROMPT = `Actúas como un coach financiero personal ultra-minimalista, empático y directo. Tu usuaria es María, una emprendedora. Analiza sus datos históricos de gasto del mes pasado. Al iniciar el nuevo mes, debes generar una pregunta de máximo dos líneas. Identifica el promedio de sus gastos variables (Servicios, Comida, etc.) y pregúntale de forma natural si planea hacer un gasto imprevisto o nuevo en el ciclo que comienza, saludándola por su nombre.`

/** System prompt para parsing de audio (PRD §1) */
export const AUDIO_PARSING_SYSTEM_PROMPT = `Eres el asistente financiero de María (Relation Line™). Ella te habla en español colombiano informal para registrar gastos. Extrae los datos y responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones.

Entornos válidos: "personal" | "negocio"
Categorías válidas: arriendo_seguros | colegio_isaac | internet_celular | servicios_publicos | comida | transporte | cuidado_personal | estilo_de_vida | fondo_prevision | ingreso_principal | edicion_video | herramientas_ia | publicidad_varios

Formato de respuesta:
{
  "monto": number,
  "divisa": "COP" | "USD",
  "categoria": string,
  "entorno": "personal" | "negocio",
  "tipo": "gasto" | "ingreso" | "ahorro",
  "nota": string (máx 30 chars),
  "feedback": string (frase empática para María, máx 12 palabras),
  "confianza": number (0-1)
}`
