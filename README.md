# 🧱 BrickBot — Diseña construcciones LEGO con IA

**BrickBot** es una aplicación web que permite a cualquier persona diseñar construcciones LEGO personalizadas con ayuda de inteligencia artificial. Solo tienes que describir tu idea (o subir una imagen) y la IA generará un modelo 3D interactivo con instrucciones paso a paso y la lista completa de piezas.

## ✨ Características

- **💬 Chat con IA** — Describe tu idea en lenguaje natural. Sube imágenes de referencia y el asistente IA (GPT-4 Vision) las interpretará para crear tu diseño LEGO.
- **🧊 Visor 3D interactivo** — Visualiza tu modelo en 3D usando Three.js con formato LDraw. Rota, zoom, y explora cada ángulo.
- **📋 Instrucciones paso a paso** — Sigue un manual visual, paso a paso, como las instrucciones oficiales de LEGO.
- **📦 Lista de piezas exacta** — Obtén la lista completa de piezas con colores, cantidades e imágenes.
- **🛒 Dónde comprar** — Exporta tu lista de piezas a BrickLink (XML), con enlaces directos a tiendas y estimación de precios.
- **⚙️ Configurable** — Elige número de piezas, presupuesto, complejidad, o construye a partir de un set existente.

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| 3D | Three.js + LDrawLoader (formato LDraw) |
| IA | OpenAI GPT-4o (chat + visión) |
| Base de datos LEGO | Rebrickable API (62K+ piezas, 26K+ sets) |
| Marketplace | BrickLink (export XML wanted list) |
| Estado | Zustand |
| Iconos | Lucide React |
| Animaciones | Framer Motion, CSS Animations |

## 📁 Estructura del proyecto

```
brickbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # API chat con OpenAI
│   │   │   ├── generate-model/route.ts # Generador de modelos
│   │   │   └── parts-sourcing/route.ts # Búsqueda de piezas
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Router principal
│   ├── components/
│   │   ├── chat/
│   │   │   └── ChatPage.tsx           # Interfaz de chat con IA
│   │   ├── layout/
│   │   │   ├── LandingPage.tsx        # Página de inicio
│   │   │   ├── ConfigPanel.tsx        # Configuración del proyecto
│   │   │   └── GeneratingScreen.tsx   # Pantalla de generación
│   │   └── viewer/
│   │       ├── ViewerPage.tsx         # Visor + lista de piezas + tiendas
│   │       └── LegoViewer3D.tsx       # Renderizado 3D con Three.js
│   ├── lib/
│   │   ├── store.ts                   # Estado global (Zustand)
│   │   ├── openai.ts                  # Integración con OpenAI
│   │   ├── rebrickable.ts            # API de Rebrickable
│   │   ├── bricklink.ts              # Estimación de precios + XML
│   │   └── lego-generator.ts         # Generador de modelos LDraw
│   └── types/
│       └── index.ts                   # Tipos TypeScript
├── public/ldraw/                      # Librería de piezas LDraw
├── .env.example
├── package.json
└── README.md
```

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/elenagonzalezblanco/brickbot.git
cd brickbot

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus API keys

# Iniciar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔑 API Keys necesarias

1. **OpenAI** (obligatorio para chat IA) — [Obtener clave](https://platform.openai.com/api-keys)
2. **Rebrickable** (obligatorio para base de datos de piezas) — [Obtener clave](https://rebrickable.com/api/)
3. **BrickLink** (opcional, para precios de mercado) — [Obtener acceso](https://www.bricklink.com/v3/api.page)

> 💡 Sin API keys, la app funciona en modo demo con un modelo de ejemplo.

## 🗂️ Recursos LEGO utilizados

- **[LDraw](https://www.ldraw.org/)** — Estándar abierto para CAD de LEGO con 16,600+ piezas
- **[Three.js LDrawLoader](https://threejs.org/docs/#examples/en/loaders/LDrawLoader)** — Renderizado 3D de archivos LDraw en el navegador
- **[Rebrickable](https://rebrickable.com/)** — Base de datos completa de sets, piezas y colores LEGO
- **[BrickLink](https://www.bricklink.com/)** — Mayor marketplace de piezas LEGO
- **[Mecabricks](https://www.mecabricks.com/)** — Modelado 3D LEGO online (referencia de diseño)

## 📜 Licencia

MIT — Uso libre. LEGO® es marca registrada de LEGO Group, que no patrocina ni avala este proyecto.
