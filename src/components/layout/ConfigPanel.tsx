'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Blocks, ArrowLeft, ArrowRight, Puzzle, DollarSign, Gauge, Package } from 'lucide-react';

export default function ConfigPanel() {
  const { projectConfig, setProjectConfig, setCurrentStep } = useAppStore();
  const [localConfig, setLocal] = useState(projectConfig);

  const handleContinue = () => {
    setProjectConfig(localConfig);
    setCurrentStep('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lego-yellow/5 via-white to-lego-blue/5">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => setCurrentStep('landing')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lego-red rounded-lg flex items-center justify-center">
            <Blocks className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            Brick<span className="text-lego-red">Bot</span>
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Configura tu proyecto 🧱</h1>
          <p className="text-gray-500 text-lg">
            Establece los parámetros básicos antes de empezar a diseñar
          </p>
        </div>

        <div className="space-y-8">
          {/* Mode selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Modo de construcción
            </label>
            <div className="grid grid-cols-2 gap-4">
              <ModeButton
                active={localConfig.mode === 'free'}
                onClick={() => setLocal({ ...localConfig, mode: 'free' })}
                title="🎨 Diseño libre"
                description="Crea algo totalmente nuevo"
              />
              <ModeButton
                active={localConfig.mode === 'from-set'}
                onClick={() => setLocal({ ...localConfig, mode: 'from-set' })}
                title="📦 Desde un set"
                description="Usa piezas de un set que ya tienes"
              />
            </div>
          </div>

          {/* Set number (only if from-set mode) */}
          {localConfig.mode === 'from-set' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número del set LEGO (ej: 10281-1)
              </label>
              <input
                type="text"
                placeholder="Ej: 10281-1, 42115-1..."
                value={localConfig.baseSetNum || ''}
                onChange={(e) => setLocal({ ...localConfig, baseSetNum: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lego-blue focus:outline-none text-lg"
              />
              <p className="text-sm text-gray-400 mt-1">
                Busca tu set en{' '}
                <a href="https://rebrickable.com/sets/" target="_blank" rel="noopener noreferrer" className="text-lego-blue underline">
                  Rebrickable
                </a>
              </p>
            </div>
          )}

          {/* Pieces range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Puzzle className="w-4 h-4" />
              Número de piezas: {localConfig.minPieces} - {localConfig.maxPieces}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Mínimo</span>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={localConfig.minPieces || 50}
                  onChange={(e) =>
                    setLocal({ ...localConfig, minPieces: parseInt(e.target.value) })
                  }
                  className="w-full accent-lego-red"
                />
                <span className="text-sm font-mono text-gray-600">{localConfig.minPieces}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400">Máximo</span>
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={localConfig.maxPieces || 500}
                  onChange={(e) =>
                    setLocal({ ...localConfig, maxPieces: parseInt(e.target.value) })
                  }
                  className="w-full accent-lego-blue"
                />
                <span className="text-sm font-mono text-gray-600">{localConfig.maxPieces}</span>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Presupuesto estimado (€) — opcional
            </label>
            <input
              type="number"
              placeholder="Ej: 50"
              min={5}
              max={5000}
              value={localConfig.budget || ''}
              onChange={(e) =>
                setLocal({ ...localConfig, budget: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-lego-blue focus:outline-none text-lg"
            />
          </div>

          {/* Complexity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Complejidad
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['simple', 'medium', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setLocal({ ...localConfig, complexity: level })}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                    localConfig.complexity === level
                      ? 'border-lego-blue bg-lego-blue/10 text-lego-blue'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {level === 'simple' && '🟢 Simple'}
                  {level === 'medium' && '🟡 Media'}
                  {level === 'advanced' && '🔴 Avanzada'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Continue button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleContinue}
            className="brick-button bg-lego-red text-white text-lg font-bold px-12 py-4 rounded-2xl flex items-center gap-3 hover:bg-red-700 transition-colors"
          >
            Continuar al chat
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl text-left transition-all border-2 ${
        active
          ? 'border-lego-red bg-lego-red/5 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="text-lg font-bold mb-1">{title}</div>
      <div className="text-sm text-gray-500">{description}</div>
    </button>
  );
}
