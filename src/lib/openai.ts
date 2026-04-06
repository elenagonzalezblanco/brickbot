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

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: apiMessages }),
  });

  if (!response.ok) {
    throw new Error('Error al comunicarse con el asistente');
  }

  const data = await response.json();
  return data.content;
}
