import { NextRequest, NextResponse } from 'next/server';
import { getAzureConfig, isAzureConfigured, callAzureChat } from '@/lib/azure';

function hasImages(messages: any[]): boolean {
  return messages.some(
    (m: any) =>
      Array.isArray(m.content) &&
      m.content.some((c: any) => c.type === 'image_url')
  );
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const config = getAzureConfig();

    if (!(await isAzureConfigured(config))) {
      return NextResponse.json({
        content: `¡Interesante idea! 🧱 Azure OpenAI no está conectado todavía.

Ejecuta este comando para arrancar con autenticación Azure:
\`\`\`
npm run dev:azure
\`\`\`

Mientras tanto, puedes usar el botón **"Generar modelo 3D"** para ver modelos de demostración. 🎨`,
      });
    }

    // Choose model: use image model if the conversation contains images
    const useImageModel = hasImages(messages);
    const model = useImageModel ? config.imageModel : config.textModel;

    console.log(`[BrickBot] Using Azure model: ${model} (images: ${useImageModel})`);

    const data = await callAzureChat(messages, model, config);
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
