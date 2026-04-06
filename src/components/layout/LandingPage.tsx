'use client';

import { useAppStore } from '@/lib/store';
import { Blocks, Sparkles, Image, MessageCircle, Box, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lego-yellow/10 via-white to-lego-blue/10">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-lego-red rounded-lg flex items-center justify-center shadow-md">
            <Blocks className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            Brick<span className="text-lego-red">Bot</span>
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-16">
          {/* Decorative bricks */}
          <div className="flex justify-center gap-3 mb-8">
            {['bg-lego-red', 'bg-lego-yellow', 'bg-lego-blue', 'bg-lego-green', 'bg-lego-orange'].map(
              (color, i) => (
                <div
                  key={color}
                  className={`w-8 h-8 ${color} rounded-md shadow-lg animate-bounce`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="w-3 h-3 rounded-full bg-white/30 mx-auto mt-1.5" />
                </div>
              )
            )}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Diseña tu construcción
            <br />
            <span className="bg-gradient-to-r from-lego-red via-lego-blue to-lego-green bg-clip-text text-transparent">
              LEGO con IA
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Describe tu idea, sube una imagen o simplemente cuéntale a nuestro asistente qué quieres
            construir. <strong>BrickBot</strong> creará un modelo 3D paso a paso con todas las piezas
            que necesitas. 🧱
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep('config')}
              className="brick-button bg-lego-red text-white text-lg font-bold px-10 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-red-700 transition-colors"
            >
              <Sparkles className="w-6 h-6" />
              ¡Empezar a crear!
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<MessageCircle className="w-8 h-8" />}
            color="bg-lego-blue"
            title="Chat con IA"
            description="Describe con texto lo que quieres crear. Nuestro asistente te guiará paso a paso para concretar tu idea perfecta."
          />
          <FeatureCard
            icon={<Image className="w-8 h-8" />}
            color="bg-lego-green"
            title="Sube imágenes"
            description="¿Tienes una foto de referencia? Súbela y la IA la transformará en una construcción LEGO realizable."
          />
          <FeatureCard
            icon={<Box className="w-8 h-8" />}
            color="bg-lego-orange"
            title="Visor 3D interactivo"
            description="Visualiza tu modelo en 3D, sigue instrucciones paso a paso y obtén la lista exacta de piezas."
          />
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Configura', desc: 'Elige presupuesto o número de piezas', emoji: '⚙️' },
              { step: '2', title: 'Describe', desc: 'Habla con la IA o sube imágenes', emoji: '💬' },
              { step: '3', title: 'Genera', desc: 'La IA diseña tu modelo LEGO', emoji: '🤖' },
              { step: '4', title: 'Construye', desc: 'Sigue las instrucciones 3D y compra piezas', emoji: '🧱' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <div className="w-10 h-10 bg-lego-red text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech badges */}
        <div className="mt-20 text-center">
          <p className="text-sm text-gray-400 mb-4">Tecnologías que hacen esto posible</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['LDraw', 'Three.js', 'GPT-4 Vision', 'Rebrickable', 'BrickLink', 'Mecabricks'].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-gray-400 text-sm">
        BrickBot © 2026 — Hecho con ❤️ y piezas de LEGO. No afiliado con LEGO Group.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  color,
  title,
  description,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center text-white mb-5`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
