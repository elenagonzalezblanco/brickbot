import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
      // Return a mock response when no API key is configured
      return NextResponse.json({
        content: `¡Interesante idea! 🧱 Parece que la API key de OpenAI no está configurada todavía.

Para conectar el chat con IA real:
1. Crea un archivo \`.env.local\` en la raíz del proyecto
2. Añade: \`OPENAI_API_KEY=tu-clave-aquí\`
3. Reinicia el servidor

Mientras tanto, puedes usar el botón **"Generar modelo demo"** para ver cómo funciona el visor 3D y la lista de piezas. 🎨`,
      });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1500,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content || 'No pude generar una respuesta.';

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
