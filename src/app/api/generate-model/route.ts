import { NextRequest, NextResponse } from 'next/server';
import { generateDemoModel } from '@/lib/lego-generator';

// ── Azure config (shared with chat route) ──
function getAzureConfig() {
  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    textModel: process.env.AZURE_TEXT_MODEL || 'gpt-5.4',
    apiVersion: process.env.AZURE_API_VERSION || '2025-01-01-preview',
  };
}

const MODEL_GEN_PROMPT = `Eres un experto diseñador de modelos LEGO. A partir de la conversación del usuario, genera un modelo LEGO completo.

DEBES responder EXCLUSIVAMENTE con un JSON válido (sin markdown, sin backticks, sin texto extra). El JSON debe tener esta estructura exacta:

{
  "name": "Nombre del modelo",
  "description": "Descripción breve",
  "parts": [
    { "partNum": "3001", "name": "Brick 2x4", "colorId": 4, "colorName": "Red", "colorHex": "C91A09", "quantity": 5 },
    ...
  ],
  "steps": [
    {
      "stepNumber": 1,
      "description": "Descripción del paso",
      "bricks": [
        { "color": 4, "x": 0, "y": 0, "z": 0, "part": "3001.dat" }
      ]
    },
    ...
  ]
}

PIEZAS DISPONIBLES (usa SOLO estos part files):
- 3001.dat = Brick 2x4 (80×24×40 LDU)
- 3003.dat = Brick 2x2 (40×24×40 LDU)
- 3004.dat = Brick 1x2 (40×24×20 LDU)
- 3010.dat = Brick 1x4 (80×24×20 LDU)
- 3622.dat = Brick 1x3 (60×24×20 LDU)
- 3009.dat = Brick 1x6 (120×24×20 LDU)
- 3005.dat = Brick 1x1 (20×24×20 LDU)
- 3020.dat = Plate 2x4 (80×8×40 LDU)
- 3022.dat = Plate 2x2 (40×8×40 LDU)
- 3023.dat = Plate 1x2 (40×8×20 LDU)
- 3024.dat = Plate 1x1 (20×8×20 LDU)
- 3039.dat = Slope 2x2 (40×24×40 LDU)
- 3040.dat = Slope 1x2 (40×24×20 LDU)

COLORES DISPONIBLES (usa SOLO estos colorId):
- 0 = Black (#05131D)
- 1 = Blue (#0055BF)
- 2 = Green (#237841)
- 4 = Red (#C91A09)
- 14 = Yellow (#F2CD37)
- 15 = White (#FFFFFF)
- 25 = Orange (#FE8A18)
- 71 = Light Gray (#A0A5A9)
- 72 = Dark Gray (#6C6E68)

COORDENADAS:
- El origen (0,0,0) es la esquina inferior-izquierda de la base.
- X = izquierda-derecha, Y = altura (crece HACIA ARRIBA en positivo), Z = profundidad.
- 1 stud = 20 LDU. 1 brick de alto = 24 LDU. 1 plate de alto = 8 LDU.
- Para apilar bricks: cada fila sube y=24. Para plates: y=8.
- La primera capa va en y=0, la segunda en y=24, etc.

REGLAS:
- Crea un modelo que represente lo que el usuario pidió.
- Usa entre 20 y 120 piezas según la complejidad.
- Genera entre 3 y 8 pasos de construcción.
- Los pasos van de abajo hacia arriba.
- En cada paso, muestra los bricks que se añaden EN ESE paso.
- La lista "parts" es el resumen total de todas las piezas.
- Intenta que el modelo sea reconocible y bonito.`;

async function callAzureForModel(messages: any[], config: ReturnType<typeof getAzureConfig>) {
  const url = `${config.endpoint}/openai/deployments/${config.textModel}/chat/completions?api-version=${config.apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: MODEL_GEN_PROMPT },
        ...messages,
        {
          role: 'user',
          content: 'Ahora genera el modelo LEGO en formato JSON basado en nuestra conversación. Responde SOLO con el JSON.',
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Azure generate-model error (${response.status}):`, errorBody);
    throw new Error(`Azure API error: ${response.status}`);
  }

  return response.json();
}

function buildLDrawFromSteps(name: string, steps: any[]): string {
  const lines: string[] = [
    `0 FILE ${name}.ldr`,
    `0 ${name}`,
    `0 Name: ${name}.ldr`,
    `0 Author: BrickBot AI`,
    '',
  ];

  for (const step of steps) {
    lines.push('0 STEP');
    lines.push(`0 // Step ${step.stepNumber}: ${step.description}`);
    if (step.bricks && Array.isArray(step.bricks)) {
      for (const b of step.bricks) {
        // LDraw type 1 line: 1 <color> <x> <y> <z> <matrix 3x3> <part>
        lines.push(`1 ${b.color} ${b.x} ${b.y} ${b.z} 1 0 0 0 1 0 0 0 1 ${b.part}`);
      }
    }
  }

  lines.push('0 NOFILE');
  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    const config = getAzureConfig();

    // If no API key or no messages, fall back to demo
    if (!config.apiKey || config.apiKey === 'PEGA-AQUI-TU-API-KEY' || !messages || messages.length === 0) {
      console.log('[BrickBot] No API key or messages, returning demo model');
      const model = generateDemoModel();
      return NextResponse.json({ model });
    }

    // Filter messages to text-only (strip images for generation prompt)
    const textMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : 
          Array.isArray(m.content) ? m.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join(' ') : '',
      }))
      .filter((m: any) => m.content.length > 0);

    console.log(`[BrickBot] Generating model from ${textMessages.length} messages...`);

    const data = await callAzureForModel(textMessages, config);
    const rawContent = data.choices?.[0]?.message?.content || '';

    console.log('[BrickBot] Raw AI response length:', rawContent.length);

    // Parse the JSON from the response (strip markdown fences if present)
    let jsonStr = rawContent.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonStr);

    // Build the LegoModel
    const ldrawContent = buildLDrawFromSteps(parsed.name || 'Modelo', parsed.steps || []);

    const partsList = (parsed.parts || []).map((p: any) => ({
      partNum: p.partNum || '3001',
      name: p.name || 'Brick',
      colorId: p.colorId ?? 4,
      colorName: p.colorName || 'Red',
      colorHex: p.colorHex || 'C91A09',
      quantity: p.quantity || 1,
      imageUrl: '',
    }));

    const steps = (parsed.steps || []).map((s: any) => ({
      stepNumber: s.stepNumber,
      description: s.description,
      parts: (s.bricks || []).map((b: any) => {
        const matchedPart = partsList.find((p: any) => b.part?.includes(p.partNum));
        return matchedPart || { partNum: '3001', name: 'Brick 2x4', colorId: b.color || 4, colorName: 'Red', colorHex: 'C91A09', quantity: 1, imageUrl: '' };
      }),
    }));

    const model = {
      id: `ai-${Date.now()}`,
      name: parsed.name || 'Modelo LEGO',
      description: parsed.description || 'Modelo generado por BrickBot',
      totalParts: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0),
      estimatedPrice: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1) * 0.15, 0),
      ldrawContent,
      steps,
      partsList,
      sourcingSuggestions: [
        {
          type: 'bricklink',
          name: 'Comprar en BrickLink',
          url: 'https://www.bricklink.com',
          partsProvided: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0),
          totalPartsNeeded: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0),
          estimatedCost: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1) * 0.12, 0),
          coveragePercent: 100,
        },
        {
          type: 'pick-a-brick',
          name: 'LEGO Pick a Brick',
          url: 'https://www.lego.com/pick-and-build/pick-a-brick',
          partsProvided: Math.round(partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0) * 0.7),
          totalPartsNeeded: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1), 0),
          estimatedCost: partsList.reduce((sum: number, p: any) => sum + (p.quantity || 1) * 0.2, 0),
          coveragePercent: 70,
        },
      ],
    };

    console.log(`[BrickBot] Model generated: "${model.name}" with ${model.totalParts} parts, ${steps.length} steps`);
    return NextResponse.json({ model });
  } catch (error: any) {
    console.error('Generate model API error:', error);
    // Fall back to demo model on any error
    console.log('[BrickBot] Falling back to demo model');
    const model = generateDemoModel();
    return NextResponse.json({ model });
  }
}
