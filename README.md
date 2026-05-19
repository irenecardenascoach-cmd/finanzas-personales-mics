# 💰 Mindset Finance v2.0

App de finanzas personales e inteligencia empresarial para María — Relation Line™

## Stack
- **React 18** + **Vite 5**
- **React Router v6** — 5 pantallas
- **Recharts** — área, líneas y barras dinámicas
- **Anthropic Claude API** — Consultora IA + búsqueda financiera
- **localStorage** — persistencia offline total, sin backend

## Pantallas
| Ruta | Pantalla | Función |
|------|----------|---------|
| `/` | **Pulso** | Dashboard: balance, 50/30/20, capital inversión, modo estrés |
| `/registro` | **Registro** | Añadir/editar/eliminar transacciones, ingresos por horas |
| `/tendencias` | **Flujo** | Gráfico de área + proyección 12M + búsqueda financiera IA |
| `/refugio` | **Metas** | Metas con aportes/retiros + ajustes de perfil |
| `/consultora` | **Consultora IA** | Chat con IA con contexto financiero en tiempo real |

## Setup local
```bash
npm install
cp .env.example .env.local
# Edita .env.local y agrega tu VITE_ANTHROPIC_API_KEY
npm run dev
```

## Deploy en Vercel
1. Push a GitHub
2. Importar repo en vercel.com
3. En **Settings → Environment Variables** agregar:
   - `VITE_ANTHROPIC_API_KEY` = tu clave de Anthropic
4. Redeploy

## Primera vez en la app
Al abrir la app por primera vez, aparece el **Onboarding** donde configuras:
- Tu nombre
- Ingresos mensuales base
- Gastos fijos (línea base congelada)
- Meta principal de ahorro

Estos datos quedan guardados en localStorage y no se pierden al refrescar.
