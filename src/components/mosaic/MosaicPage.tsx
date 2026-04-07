'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, Blocks, Zap, Grid3X3 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { imageToLegoMosaic, renderMosaicPreview, type MosaicResult } from '@/lib/image2lego';

type MosaicStep = 'upload' | 'configure' | 'preview';

export default function MosaicPage() {
  const { setGeneratedModel, setCurrentStep } = useAppStore();
  const [step, setStep] = useState<MosaicStep>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mosaicWidth, setMosaicWidth] = useState(32);
  const [mosaicHeight, setMosaicHeight] = useState(32);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<MosaicResult | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setStep('configure');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleGenerate = async () => {
    if (!imageSrc) return;
    setGenerating(true);
    try {
      const mosaicResult = await imageToLegoMosaic(imageSrc, {
        width: mosaicWidth,
        height: mosaicHeight,
        useAllColors: true,
      });
      setResult(mosaicResult);
      setStep('preview');
    } catch (err) {
      console.error('Mosaic generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Render mosaic preview when result changes
  useEffect(() => {
    if (result && previewCanvasRef.current) {
      const scale = Math.max(4, Math.min(16, Math.floor(400 / Math.max(result.studsWide, result.studsTall))));
      renderMosaicPreview(previewCanvasRef.current, result.grid, scale);
    }
  }, [result]);

  const handleUseMosaic = () => {
    if (result) {
      setGeneratedModel(result.model);
      setCurrentStep('viewer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => setCurrentStep('config')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold">Image2Lego</span>
            <span className="text-xs text-gray-400 ml-2">Convierte imágenes en mosaicos LEGO</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Convierte tu imagen en LEGO</h1>
              <p className="text-gray-500">Sube una foto y la transformaremos en un mosaico LEGO con instrucciones de construcción</p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all"
            >
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">Arrastra una imagen aquí</p>
              <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar</p>
              <p className="text-xs text-gray-300 mt-4">JPG, PNG, WebP — cualquier tamaño</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {/* Examples */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-sm mb-3">🎨 Funciona mejor con:</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Retratos y fotos con colores vivos</li>
                <li>• Logos e ilustraciones simples</li>
                <li>• Paisajes con contraste claro</li>
                <li>• Sprites y pixel art</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step: Configure */}
        {step === 'configure' && imageSrc && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">Configura tu mosaico</h2>
              <p className="text-sm text-gray-400">Ajusta el tamaño en studs LEGO</p>
            </div>

            {/* Image preview */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <img
                src={imageSrc}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg object-contain"
              />
            </div>

            {/* Size controls */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold">Ancho: {mosaicWidth} studs</label>
                  <span className="text-xs text-gray-400">{mosaicWidth * 0.8} cm</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={96}
                  step={8}
                  value={mosaicWidth}
                  onChange={(e) => setMosaicWidth(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold">Alto: {mosaicHeight} studs</label>
                  <span className="text-xs text-gray-400">{mosaicHeight * 0.8} cm</span>
                </div>
                <input
                  type="range"
                  min={16}
                  max={96}
                  step={8}
                  value={mosaicHeight}
                  onChange={(e) => setMosaicHeight(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{mosaicWidth * mosaicHeight}</div>
                  <div className="text-xs text-gray-400">Piezas totales</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {(mosaicWidth * 0.8).toFixed(0)}×{(mosaicHeight * 0.8).toFixed(0)} cm
                  </div>
                  <div className="text-xs text-gray-400">Tamaño real</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    ~€{(mosaicWidth * mosaicHeight * 0.08).toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-400">Coste estimado</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('upload'); setImageSrc(null); }}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cambiar imagen
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generar mosaico
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && result && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-1">¡Tu mosaico LEGO está listo!</h2>
              <p className="text-sm text-gray-400">
                {result.studsWide}×{result.studsTall} studs · {result.model.totalParts} piezas · {result.model.partsList.length} colores
              </p>
            </div>

            {/* Preview canvas */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <canvas
                ref={previewCanvasRef}
                className="mx-auto rounded-lg border border-gray-200"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Color palette used */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h3 className="text-sm font-bold mb-3">Colores LEGO utilizados</h3>
              <div className="flex flex-wrap gap-2">
                {result.model.partsList.map((p) => (
                  <div
                    key={p.colorId}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg text-xs"
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-200"
                      style={{ backgroundColor: `#${p.colorHex}` }}
                    />
                    <span className="text-gray-600">{p.colorName}</span>
                    <span className="font-bold text-gray-800">×{p.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setStep('configure'); setResult(null); }}
                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Ajustar
              </button>
              <button
                onClick={handleUseMosaic}
                className="flex-1 py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Blocks className="w-5 h-5" />
                Ver en 3D y comprar piezas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
