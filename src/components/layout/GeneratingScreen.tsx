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

export default function GeneratingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { setGeneratedModel, setCurrentStep } = useAppStore();

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 8 + 2;
      });
    }, 400);

    // Simulate model generation (in production, this calls the real API)
    const timeout = setTimeout(() => {
      const model = generateDemoModel();
      setGeneratedModel(model);
      setCurrentStep('viewer');
    }, 8000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [setGeneratedModel, setCurrentStep]);

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
