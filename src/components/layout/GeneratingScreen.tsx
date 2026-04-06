'use client';

import { useEffect, useState } from 'react';
import { Blocks } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { generateDemoModel } from '@/lib/lego-generator';

const loadingMessages = [
  '🧱 Seleccionando los mejores ladrillos...',
  '🎨 Eligiendo los colores perfectos...',
  '📐 Calculando dimensiones del modelo...',
  '🔧 Ensamblando las piezas virtuales...',
  '🏗️ Construyendo tu modelo paso a paso...',
  '📋 Generando instrucciones detalladas...',
  '💰 Buscando las mejores tiendas de piezas...',
  '✨ Puliendo los detalles finales...',
];

async function generateModelFromChat(messages: any[]): Promise<any> {
  // Extract conversation text for keyword matching in demo fallback
  const conversationText = messages
    .filter((m: any) => m.role === 'user')
    .map((m: any) => (typeof m.content === 'string' ? m.content : ''))
    .join(' ');

  // Try the real API
  try {
    const response = await fetch('/api/generate-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.model) return data.model;
    }
  } catch {
    // API not available (static deploy) — fall through to demo
  }

  // Fallback to demo - pick model based on conversation keywords
  return generateDemoModel(conversationText);
}

export default function GeneratingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { messages, setGeneratedModel, setCurrentStep } = useAppStore();

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // stay at 95 until real response
        return prev + Math.random() * 5 + 1;
      });
    }, 600);

    // Prepare messages for the API (same format as openai.ts sends)
    const apiMessages = messages.map((msg) => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: 'text' as const, text: msg.content },
            ...msg.images.map((img: string) => ({
              type: 'image_url' as const,
              image_url: { url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}` },
            })),
          ],
        };
      }
      return { role: msg.role, content: msg.content };
    });

    // Call the generate-model API with conversation context
    generateModelFromChat(apiMessages).then((model) => {
      setProgress(100);
      setTimeout(() => {
        setGeneratedModel(model);
        setCurrentStep('viewer');
      }, 500);
    });

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [messages, setGeneratedModel, setCurrentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lego-yellow/10 via-white to-lego-blue/10 flex items-center justify-center">
      <div className="text-center px-6 max-w-md">
        {/* Animated brick */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-lego-red rounded-2xl animate-bounce shadow-lg">
            <div className="flex gap-2 justify-center pt-3">
              <div className="lego-stud" />
              <div className="lego-stud" />
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <div className="lego-stud" />
              <div className="lego-stud" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Generando tu modelo...</h2>

        <p className="text-gray-500 text-lg mb-8 h-8 transition-all duration-500">
          {loadingMessages[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full animated-border transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-sm text-gray-400">{Math.min(Math.round(progress), 100)}%</p>
      </div>
    </div>
  );
}
