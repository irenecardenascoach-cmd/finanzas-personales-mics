# 💰 Mindset Finance

> App de finanzas personales y de negocio para María — conversacional, inteligente y minimalista.

## Stack

- **React 18** + **Vite 5**
- **React Router v6** — navegación entre las 4 pantallas
- **Recharts** — gráficos de tendencias limpios
- **Anthropic Claude API** — parsing de audio en lenguaje natural + asistente proactivo
- **OpenAI Whisper API** — transcripción de audio a texto
- **LocalStorage** — persistencia de datos offline (sin backend requerido)

## Pantallas (PRD v2.0)

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/` | **El Pulso** | Dashboard principal con balance personal y negocio |
| `/registro` | **El Registro** | Sistema "dos toques" para captura rápida |
| `/tendencias` | **Trazabilidad** | Gráficos y motor de predicción |
| `/metas` | **El Refugio** | Metas de ahorro y fondo de previsión |

## Instalación

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/mindset-finance.git
cd mindset-finance

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local y agrega tus claves de API

# 4. Correr en desarrollo
npm run dev

# 5. Build para producción
npm run build
```

## Estructura del Proyecto

```
mindset-finance/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .gitignore
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Router principal
    ├── index.css             # Tokens globales
    ├── data/
    │   ├── baseline.js       # Tabla B: líneas base (PRD §3)
    │   └── mockMovements.js  # Datos de prueba
    ├── hooks/
    │   ├── useMovements.js   # CRUD + localStorage
    │   ├── useAudioInput.js  # Whisper + Claude parsing
    │   └── useInsights.js    # Motor de predicción IA
    ├── utils/
    │   ├── formatters.js     # fmt(), fechas, porcentajes
    │   ├── calculations.js   # Balance, proyecciones, tendencias
    │   └── claudeApi.js      # Wrapper Anthropic API
    ├── components/
    │   ├── layout/
    │   │   ├── BottomNav.jsx
    │   │   └── Toast.jsx
    │   ├── shared/
    │   │   ├── Card.jsx
    │   │   ├── ProgressBar.jsx
    │   │   └── EnvToggle.jsx
    │   ├── pulse/
    │   │   ├── InsightBanner.jsx
    │   │   ├── BalanceCard.jsx
    │   │   └── AlertsList.jsx
    │   ├── registro/
    │   │   ├── CategoryGrid.jsx
    │   │   ├── NumericKeypad.jsx
    │   │   └── MicButton.jsx
    │   ├── tendencias/
    │   │   ├── SpendingChart.jsx
    │   │   └── PredictionBlock.jsx
    │   └── metas/
    │       ├── GoalTracker.jsx
    │       └── PrevisoryFund.jsx
    └── pages/
        ├── Pulso.jsx
        ├── Registro.jsx
        ├── Tendencias.jsx
        └── Refugio.jsx
```

## Configuración de API

La app usa dos APIs externas:

1. **Whisper** (OpenAI): convierte el audio de voz en texto
2. **Claude** (Anthropic): interpreta el texto y extrae monto, categoría y entorno

Si no tienes claves, la app funciona en **modo simulado** automáticamente.

## Despliegue

Compatible con Vercel, Netlify o GitHub Pages:

```bash
# Vercel (recomendado)
npx vercel --prod

# Netlify
npm run build && netlify deploy --prod --dir=dist
```

---

Hecho con 🤍 para María – Relation Line™
