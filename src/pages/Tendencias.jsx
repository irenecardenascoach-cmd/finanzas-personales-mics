import { useState } from 'react'
import { useMovements } from '@/hooks/useMovements'
import { datosGrafico, tendenciaCategoria, promedioCategoria } from '@/utils/calculations'
import { fmt } from '@/utils/formatters'
import { BASELINE } from '@/data/baseline'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

const CATS_VARIABLES = BASELINE.personal.categorias.filter(
  (c) => c.tipo === 'gasto_variable'
)

export default function Tendencias() {
  const { movements }     = useMovements()
  const [catActiva, setCatActiva] = useState('comida')

  const datos    = datosGrafico(movements, catActiva)
  const tendencia = tendenciaCategoria(movements, catActiva)
  const promedio  = promedioCategoria(movements, catActiva)
  const cat       = CATS_VARIABLES.find((c) => c.id === catActiva)

  return (
    <div style={{ paddingBottom: '32px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font)' }}>
          Trazabilidad
        </span>
      </div>

      {/* Selector de categoría */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 20px', overflowX: 'auto' }}>
        {CATS_VARIABLES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatActiva(c.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '100px',
              border: '1px solid var(--border)',
              background: catActiva === c.id ? 'var(--text-primary)' : 'var(--bg-card)',
              color: catActiva === c.id ? 'var(--bg-card)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontFamily: 'var(--font)',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Gráfico de barras – monocromático (PRD §2 Pantalla 3) */}
      <Card style={{ margin: '0 20px 16px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 16px',
          fontFamily: 'var(--font)',
        }}>{cat?.icon} {cat?.label} – últimos 4 meses</p>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={datos} barCategoryGap="30%">
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 11, fontFamily: 'var(--font)', fill: 'var(--text-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
              {datos.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.esActual ? 'var(--accent)' : 'var(--accent-soft)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Barra comparativa actual vs promedio (PRD §2 Pantalla 3) */}
      {tendencia && (
        <Card style={{ margin: '0 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font)' }}>
              Este mes vs promedio
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              fontFamily: 'var(--font)',
              color: tendencia.tendencia === 'alta'
                ? 'var(--red)'
                : tendencia.tendencia === 'baja'
                ? 'var(--green)'
                : 'var(--accent)',
            }}>
              {tendencia.diffPct > 0 ? '+' : ''}{tendencia.diffPct}%
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Este mes</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>{fmt(tendencia.actual)}</span>
              </div>
              <ProgressBar
                value={tendencia.actual}
                max={Math.max(tendencia.actual, tendencia.promedio || 0) * 1.2}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>Promedio histórico</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font)' }}>{fmt(promedio || 0)}</span>
              </div>
              <ProgressBar
                value={promedio || 0}
                max={Math.max(tendencia.actual, tendencia.promedio || 0) * 1.2}
                color="var(--border-strong)"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Bloque predictivo (PRD §2 Pantalla 3) */}
      <Card style={{ margin: '0 20px' }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 10px',
          fontFamily: 'var(--font)',
        }}>Análisis predictivo</p>
        <p style={{
          fontSize: '14px',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          margin: 0,
          fontFamily: 'var(--font)',
        }}>
          {tendencia?.tendencia === 'alta'
            ? `María, tus gastos en ${cat?.label.toLowerCase()} están un ${tendencia.diffPct}% sobre tu promedio. Considera ajustar esta categoría el resto del mes.`
            : tendencia?.tendencia === 'baja'
            ? `¡Muy bien! Llevas un ${Math.abs(tendencia?.diffPct || 0)}% menos en ${cat?.label.toLowerCase()} que en meses anteriores. 🌿`
            : `Tus gastos en ${cat?.label.toLowerCase()} están dentro del rango normal. Sigue así.`}
        </p>
      </Card>
    </div>
  )
}
