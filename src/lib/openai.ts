import type { ChatMessage, ProjectConfig } from '@/types';

const SYSTEM_PROMPT = `Eres BrickBot, un asistente experto en diseño y construcción LEGO.
Tu misión es ayudar a los usuarios a crear construcciones LEGO personalizadas.

REGLAS:
1. Siempre responde en español, de forma amigable y entusiasta.
2. Ayuda al usuario a concretar su idea de construcción paso a paso.
3. Pregunta detalles: colores preferidos, tamaño, nivel de detalle.
4. Cuando el usuario suba una imagen, analízala y sugiere cómo traducirla a LEGO.
5. Ten en cuenta el presupuesto/número de piezas configurado por el usuario.
6. Cuando tengas suficiente información, indica que estás listo para generar el modelo.
7. Sé visual en tus explicaciones, usa emojis relacionados con LEGO 🧱🔴🟡🔵.
8. Si el usuario quiere construir desde un set existente, sugiere sets específicos.

CAPACIDADES:
- Puedes analizar imágenes para convertirlas en ideas LEGO
- Conoces miles de piezas LEGO, sus nombres y colores
- Puedes estimar precios y número de piezas
- Puedes sugerir sets existentes como base

Cuando estés listo para generar, responde incluyendo exactamente el texto: [READY_TO_GENERATE]
seguido de un resumen JSON del modelo en formato:
{
  "name": "nombre del modelo",
  "description": "descripción",
  "estimatedParts": número,
  "colors": ["color1", "color2"],
  "style": "realistic|stylized|mosaic|sculpture"
}`;

// Smart demo responses when no backend (GitHub Pages static deploy)
const DEMO_RESPONSES = [
  `¡Me encanta tu idea! 🧱✨ Déjame pensar en cómo traducir eso a piezas LEGO...

Algunas preguntas para afinar el diseño:
- 🎨 ¿Tienes colores preferidos?
- 📐 ¿Prefieres un estilo realista o más estilizado/cartoon?
- 🏗️ ¿Quieres que tenga detalles interiores o solo exterior?

¡Cuéntame más y lo diseñamos juntos!`,

  `¡Genial! Con esos detalles ya tengo una buena idea 🎨

Estoy pensando en un diseño con:
- Alrededor de **30-80 piezas**
- Colores que encajen con tu idea
- Complejidad media, perfecto para construir en 20-30 min

Cuando quieras, pulsa el botón verde **"Generar modelo 3D"** ⬆️ arriba para que cree tu modelo con instrucciones paso a paso. 🧊`,

  `¡Perfecto! Creo que ya tengo suficiente para crear tu modelo 🚀

Voy a generar:
- 📋 Instrucciones paso a paso
- 🧊 Modelo 3D interactivo que puedes rotar
- 📦 Lista de piezas con colores exactos
- 🛒 Dónde comprar cada pieza

👉 **Pulsa "Generar modelo 3D"** en la barra de arriba para ver tu creación.

[READY_TO_GENERATE]
{"name": "Modelo personalizado", "description": "Diseño basado en tu idea", "estimatedParts": 50, "colors": ["Yellow", "Orange", "White"], "style": "stylized"}`,
];

let demoResponseIndex = 0;

export async function getChatCompletion(
  messages: ChatMessage[],
  config: ProjectConfig
): Promise<string> {
  const configContext = `
CONFIGURACIÓN DEL USUARIO:
- Modo: ${config.mode === 'free' ? 'Diseño libre' : `Desde set ${config.baseSetNum}`}
- Piezas: entre ${config.minPieces || 50} y ${config.maxPieces || 500}
- Presupuesto estimado: ${config.budget ? `€${config.budget}` : 'No especificado'}
- Complejidad: ${config.complexity}
`;

  const apiMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT + configContext },
    ...messages.map((msg) => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role as 'user' | 'assistant',
          content: [
            { type: 'text' as const, text: msg.content },
            ...msg.images.map((img) => ({
              type: 'image_url' as const,
              image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` },
            })),
          ],
        };
      }
      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      };
    }),
  ];

  // Try the real API first, fall back to demo mode for static deploys
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
  } catch {
    // API not available (static deploy) - use demo responses
  }

  // Demo fallback
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500));
  const resp = DEMO_RESPONSES[demoResponseIndex % DEMO_RESPONSES.length];
  demoResponseIndex++;
  return resp;
}
