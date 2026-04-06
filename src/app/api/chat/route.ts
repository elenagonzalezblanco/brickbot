import { NextRequest, NextResponse } from 'next/server';

// Azure AI Foundry / Azure OpenAI configuration
function getAzureConfig() {
  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    textModel: process.env.AZURE_TEXT_MODEL || 'gpt-5.4',
    imageModel: process.env.AZURE_IMAGE_MODEL || 'gpt-1.5-image',
    apiVersion: process.env.AZURE_API_VERSION || '2025-01-01-preview',
  };
}

function hasImages(messages: any[]): boolean {
  return messages.some(
    (m: any) =>
      Array.isArray(m.content) &&
      m.content.some((c: any) => c.type === 'image_url')
  );
}

async function callAzureOpenAI(
  messages: any[],
  model: string,
  config: ReturnType<typeof getAzureConfig>
) {
  // Azure AI Foundry endpoint format:
  // POST {endpoint}/openai/deployments/{model}/chat/completions?api-version={version}
  const url = `${config.endpoint}/openai/deployments/${model}/chat/completions?api-version=${config.apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 1500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Azure OpenAI error (${response.status}):`, errorBody);
    throw new Error(`Azure OpenAI API error: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const config = getAzureConfig();

    if (!config.apiKey || config.apiKey === 'PEGA-AQUI-TU-API-KEY') {
      return NextResponse.json({
        content: `¡Interesante idea! 🧱 La API key de Azure OpenAI no está configurada todavía.

Para conectar con tu recurso de Azure:
1. Abre el archivo \`.env.local\`
2. Pega tu API key en \`AZURE_OPENAI_API_KEY\`
3. Reinicia el servidor con \`npm run dev\`

Mientras tanto, puedes usar el botón **"Generar modelo demo"** para ver el visor 3D y la lista de piezas. 🎨`,
      });
    }

    // Choose model: use image model if the conversation contains images,
    // otherwise use the text model
    const useImageModel = hasImages(messages);
    const model = useImageModel ? config.imageModel : config.textModel;

    console.log(`[BrickBot] Using Azure model: ${model} (images: ${useImageModel})`);

    const data = await callAzureOpenAI(messages, model, config);
    const content = data.choices?.[0]?.message?.content || 'No pude generar una respuesta.';

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
