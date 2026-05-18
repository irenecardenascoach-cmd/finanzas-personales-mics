/**
 * TABLA A – REGISTRO DE MOVIMIENTOS (PRD §3)
 * Datos de prueba realistas para desarrollo.
 * En producción, estos vienen de localStorage / Airtable / Glide.
 *
 * Campos:
 *  id            – UUID único
 *  fecha         – ISO date string
 *  entorno       – "personal" | "negocio"
 *  categoria     – ID de categoría (ver baseline.js)
 *  tipo          – "gasto" | "ingreso" | "ahorro"
 *  monto         – número
 *  divisa        – "COP" | "USD"
 *  modo          – "automatico" (audio) | "manual" (dos toques) | "fijo" (sistema)
 *  nota          – descripción corta
 */

const hoy = new Date()
const mes = hoy.getMonth()
const anio = hoy.getFullYear()
const d = (dia, m = mes, a = anio) => new Date(a, m, dia).toISOString().split('T')[0]

// ─── MES ACTUAL ─────────────────────────────────────────────────────────────
export const MOCK_MOVEMENTS_MES_ACTUAL = [
  // Ingresos
  { id: 'mv-001', fecha: d(1),  entorno: 'personal', categoria: 'ingreso_principal', tipo: 'ingreso', monto: 800, divisa: 'USD', modo: 'fijo',       nota: 'Ingreso mensual' },

  // Gastos fijos (auto-registrados al inicio del mes)
  { id: 'mv-002', fecha: d(1),  entorno: 'personal', categoria: 'colegio_isaac',     tipo: 'gasto',   monto: 219000, divisa: 'COP', modo: 'fijo',    nota: 'Colegio Isaac – mayo' },
  { id: 'mv-003', fecha: d(1),  entorno: 'negocio',  categoria: 'edicion_video',     tipo: 'gasto',   monto: 200,    divisa: 'USD', modo: 'fijo',    nota: 'Editor Instagram' },
  { id: 'mv-004', fecha: d(1),  entorno: 'negocio',  categoria: 'herramientas_ia',   tipo: 'gasto',   monto: 40,     divisa: 'USD', modo: 'fijo',    nota: 'Claude + Notion' },

  // Gastos variables personales
  { id: 'mv-005', fecha: d(3),  entorno: 'personal', categoria: 'comida',            tipo: 'gasto',   monto: 85000,  divisa: 'COP', modo: 'manual',  nota: 'Mercado semana 1' },
  { id: 'mv-006', fecha: d(5),  entorno: 'personal', categoria: 'transporte',         tipo: 'gasto',   monto: 22000,  divisa: 'COP', modo: 'automatico', nota: 'Uber al centro' },
  { id: 'mv-007', fecha: d(7),  entorno: 'personal', categoria: 'cuidado_personal',   tipo: 'gasto',   monto: 55000,  divisa: 'COP', modo: 'automatico', nota: 'Peluquería' },
  { id: 'mv-008', fecha: d(9),  entorno: 'personal', categoria: 'comida',             tipo: 'gasto',   monto: 38000,  divisa: 'COP', modo: 'manual',  nota: 'Restaurante con Isaac' },
  { id: 'mv-009', fecha: d(10), entorno: 'personal', categoria: 'estilo_de_vida',     tipo: 'gasto',   monto: 120000, divisa: 'COP', modo: 'manual',  nota: 'Sesión hipnosis' },
  { id: 'mv-010', fecha: d(11), entorno: 'personal', categoria: 'transporte',         tipo: 'gasto',   monto: 18000,  divisa: 'COP', modo: 'automatico', nota: 'Bus + metro' },
  { id: 'mv-011', fecha: d(12), entorno: 'personal', categoria: 'fondo_prevision',    tipo: 'ahorro',  monto: 80000,  divisa: 'COP', modo: 'manual',  nota: 'Meta cama – aporte' },
  { id: 'mv-012', fecha: d(13), entorno: 'personal', categoria: 'comida',             tipo: 'gasto',   monto: 42000,  divisa: 'COP', modo: 'manual',  nota: 'Mercado semana 2' },
  { id: 'mv-013', fecha: d(14), entorno: 'negocio',  categoria: 'publicidad_varios',  tipo: 'gasto',   monto: 65,     divisa: 'USD', modo: 'manual',  nota: 'Pauta Instagram' },
  { id: 'mv-014', fecha: d(15), entorno: 'personal', categoria: 'servicios_publicos', tipo: 'gasto',   monto: 165000, divisa: 'COP', modo: 'manual',  nota: 'Luz + agua mayo' },
  { id: 'mv-015', fecha: d(15), entorno: 'personal', categoria: 'transporte',         tipo: 'gasto',   monto: 15000,  divisa: 'COP', modo: 'automatico', nota: 'Taxi al estudio' },
]

// ─── MES ANTERIOR (para cálculo de tendencias PRD §4) ──────────────────────
export const MOCK_MOVEMENTS_MES_ANTERIOR = [
  { id: 'mv-a01', fecha: d(1,  mes-1), entorno: 'personal', categoria: 'ingreso_principal', tipo: 'ingreso', monto: 800,    divisa: 'USD', modo: 'fijo',       nota: 'Ingreso mensual' },
  { id: 'mv-a02', fecha: d(1,  mes-1), entorno: 'personal', categoria: 'colegio_isaac',     tipo: 'gasto',   monto: 219000, divisa: 'COP', modo: 'fijo',       nota: 'Colegio Isaac – abr' },
  { id: 'mv-a03', fecha: d(1,  mes-1), entorno: 'negocio',  categoria: 'edicion_video',     tipo: 'gasto',   monto: 200,    divisa: 'USD', modo: 'fijo',       nota: 'Editor Instagram' },
  { id: 'mv-a04', fecha: d(1,  mes-1), entorno: 'negocio',  categoria: 'herramientas_ia',   tipo: 'gasto',   monto: 40,     divisa: 'USD', modo: 'fijo',       nota: 'Claude + Notion' },
  { id: 'mv-a05', fecha: d(5,  mes-1), entorno: 'personal', categoria: 'comida',             tipo: 'gasto',   monto: 92000,  divisa: 'COP', modo: 'manual',     nota: 'Mercado semana 1' },
  { id: 'mv-a06', fecha: d(8,  mes-1), entorno: 'personal', categoria: 'transporte',         tipo: 'gasto',   monto: 45000,  divisa: 'COP', modo: 'automatico', nota: 'Semana completa' },
  { id: 'mv-a07', fecha: d(10, mes-1), entorno: 'personal', categoria: 'cuidado_personal',   tipo: 'gasto',   monto: 48000,  divisa: 'COP', modo: 'manual',     nota: 'Peluquería + cremas' },
  { id: 'mv-a08', fecha: d(12, mes-1), entorno: 'personal', categoria: 'comida',             tipo: 'gasto',   monto: 78000,  divisa: 'COP', modo: 'manual',     nota: 'Mercado semana 2' },
  { id: 'mv-a09', fecha: d(14, mes-1), entorno: 'personal', categoria: 'estilo_de_vida',     tipo: 'gasto',   monto: 120000, divisa: 'COP', modo: 'manual',     nota: 'Hipnosis + baile' },
  { id: 'mv-a10', fecha: d(15, mes-1), entorno: 'personal', categoria: 'servicios_publicos', tipo: 'gasto',   monto: 148000, divisa: 'COP', modo: 'manual',     nota: 'Luz + agua' },
  { id: 'mv-a11', fecha: d(18, mes-1), entorno: 'personal', categoria: 'fondo_prevision',    tipo: 'ahorro',  monto: 50000,  divisa: 'COP', modo: 'manual',     nota: 'Meta cama' },
  { id: 'mv-a12', fecha: d(20, mes-1), entorno: 'personal', categoria: 'comida',             tipo: 'gasto',   monto: 65000,  divisa: 'COP', modo: 'manual',     nota: 'Mercado semana 3' },
  { id: 'mv-a13', fecha: d(22, mes-1), entorno: 'negocio',  categoria: 'publicidad_varios',  tipo: 'gasto',   monto: 100,    divisa: 'USD', modo: 'manual',     nota: 'Pauta mensual' },
  { id: 'mv-a14', fecha: d(25, mes-1), entorno: 'personal', categoria: 'transporte',         tipo: 'gasto',   monto: 12000,  divisa: 'COP', modo: 'automatico', nota: 'Uber' },
  { id: 'mv-a15', fecha: d(28, mes-1), entorno: 'personal', categoria: 'comida',             tipo: 'gasto',   monto: 55000,  divisa: 'COP', modo: 'manual',     nota: 'Mercado semana 4' },
]

export const ALL_MOCK_MOVEMENTS = [
  ...MOCK_MOVEMENTS_MES_ACTUAL,
  ...MOCK_MOVEMENTS_MES_ANTERIOR,
]
