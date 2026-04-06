'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ArrowLeft,
  Blocks,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShoppingCart,
  List,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';
import LegoViewer3D from './LegoViewer3D';
import { generateBrickLinkWantedList } from '@/lib/bricklink';

type Tab = 'viewer' | 'parts' | 'sourcing';

export default function ViewerPage() {
  const { generatedModel, currentBuildStep, setCurrentBuildStep, setCurrentStep, reset } =
    useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('viewer');

  if (!generatedModel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No hay modelo generado. Vuelve al chat.</p>
      </div>
    );
  }

  const totalSteps = generatedModel.steps.length;
  const currentStep = generatedModel.steps[currentBuildStep];

  const handlePrevStep = () => {
    if (currentBuildStep > 0) setCurrentBuildStep(currentBuildStep - 1);
  };
  const handleNextStep = () => {
    if (currentBuildStep < totalSteps - 1) setCurrentBuildStep(currentBuildStep + 1);
  };

  const handleDownloadPartsList = () => {
    const xml = generateBrickLinkWantedList(generatedModel.partsList);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedModel.name}_bricklink_wanted_list.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button onClick={() => setCurrentStep('chat')} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-lego-red rounded-lg flex items-center justify-center">
          <Blocks className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-sm">{generatedModel.name}</h1>
          <p className="text-xs text-gray-400">
            {generatedModel.totalParts} piezas · ~€{generatedModel.estimatedPrice.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => { reset(); setCurrentStep('landing'); }}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"
          title="Nuevo proyecto"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </header>

      {/* Tab bar */}
      <div className="px-4 py-2 bg-white border-b border-gray-100 flex gap-2 shrink-0">
        <TabButton active={activeTab === 'viewer'} onClick={() => setActiveTab('viewer')} icon={<Eye className="w-4 h-4" />} label="Visor 3D" />
        <TabButton active={activeTab === 'parts'} onClick={() => setActiveTab('parts')} icon={<List className="w-4 h-4" />} label="Lista de piezas" />
        <TabButton active={activeTab === 'sourcing'} onClick={() => setActiveTab('sourcing')} icon={<ShoppingCart className="w-4 h-4" />} label="Dónde comprar" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'viewer' && (
          <div className="h-full flex flex-col">
            {/* 3D Viewer */}
            <div className="flex-1 viewer-container relative">
              <LegoViewer3D model={generatedModel} currentStep={currentBuildStep} />
            </div>

            {/* Step controls */}
            <div className="px-4 py-4 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <button
                  onClick={handlePrevStep}
                  disabled={currentBuildStep === 0}
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center flex-1 px-4">
                  <div className="text-sm font-bold text-lego-red">
                    Paso {currentBuildStep + 1} de {totalSteps}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{currentStep?.description}</p>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="h-full bg-lego-red rounded-full transition-all"
                      style={{ width: `${((currentBuildStep + 1) / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={currentBuildStep === totalSteps - 1}
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parts' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Lista de piezas ({generatedModel.totalParts})</h2>
                <button
                  onClick={handleDownloadPartsList}
                  className="px-4 py-2 bg-lego-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar para BrickLink
                </button>
              </div>

              <div className="grid gap-3">
                {generatedModel.partsList.map((part, i) => (
                  <div
                    key={`${part.partNum}-${part.colorId}-${i}`}
                    className="bg-white rounded-xl p-4 flex items-center gap-4 border border-gray-100 shadow-sm"
                  >
                    {/* Color swatch */}
                    <div
                      className="w-10 h-10 rounded-lg border border-gray-200 shrink-0"
                      style={{ backgroundColor: `#${part.colorHex}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{part.name}</div>
                      <div className="text-xs text-gray-400">
                        {part.partNum} · {part.colorName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-lego-red">×{part.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sourcing' && (
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg font-bold mb-2">Dónde conseguir las piezas</h2>
              <p className="text-gray-500 text-sm mb-6">
                Estas son las opciones para comprar las piezas de tu modelo
              </p>

              <div className="grid gap-4">
                {generatedModel.sourcingSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-base">{s.name}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          {s.type === 'set' && '📦 Set LEGO'}
                          {s.type === 'bricklink' && '🏪 Marketplace'}
                          {s.type === 'pick-a-brick' && '🧱 Tienda oficial LEGO'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-lego-green">
                          €{s.estimatedCost.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Coverage bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Cobertura de piezas</span>
                        <span>
                          {s.partsProvided}/{s.totalPartsNeeded} ({s.coveragePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-full bg-lego-green rounded-full"
                          style={{ width: `${s.coveragePercent}%` }}
                        />
                      </div>
                    </div>

                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-lego-blue hover:underline font-medium"
                      >
                        Ir a la tienda <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-8 bg-lego-yellow/10 rounded-2xl p-6 border border-lego-yellow/30">
                <h3 className="font-bold mb-2">💡 Consejos para comprar</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• <strong>BrickLink</strong> suele tener los mejores precios para piezas individuales</li>
                  <li>• <strong>Pick a Brick</strong> de LEGO es ideal para piezas comunes en grandes cantidades</li>
                  <li>• Compara precios incluyendo el envío antes de comprar</li>
                  <li>• Descarga la lista XML para importarla directamente en BrickLink</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? 'bg-lego-red text-white'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
