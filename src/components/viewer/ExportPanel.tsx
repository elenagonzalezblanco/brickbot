'use client';

import { useState } from 'react';
import type { LegoModel } from '@/types';
import { generatePackedMPD, generateLDrawFile, getMecabricksImportInfo, getLeoCadInfo, getLDCadInfo } from '@/lib/ldraw-packed';
import { Download, ExternalLink, X, FileBox, Wrench, Palette } from 'lucide-react';

interface ExportPanelProps {
  model: LegoModel;
  onClose: () => void;
}

export default function ExportPanel({ model, onClose }: ExportPanelProps) {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, mime: string = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(filename);
    setTimeout(() => setDownloaded(null), 3000);
  };

  const handleDownloadLDR = () => {
    downloadFile(model.ldrawContent, `${sanitize(model.name)}.ldr`);
  };

  const handleDownloadMPD = () => {
    const mpd = generatePackedMPD(model.name, model.ldrawContent);
    downloadFile(mpd, `${sanitize(model.name)}_packed.mpd`);
  };

  const mecabricks = getMecabricksImportInfo();
  const leocad = getLeoCadInfo();
  const ldcad = getLDCadInfo();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold">Exportar modelo</h2>
            <p className="text-sm text-gray-400 mt-1">Abre tu modelo en editores profesionales LEGO</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Download section */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Descargar archivo</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadLDR}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 bg-lego-blue rounded-lg flex items-center justify-center shrink-0">
                  <FileBox className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Archivo LDraw (.ldr)</div>
                  <div className="text-xs text-gray-400">Formato estándar para LeoCad, LDCad, Bricksmith</div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </button>

              <button
                onClick={handleDownloadMPD}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
              >
                <div className="w-10 h-10 bg-lego-green rounded-lg flex items-center justify-center shrink-0">
                  <FileBox className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Archivo empaquetado (.mpd)</div>
                  <div className="text-xs text-gray-400">Incluye geometría de piezas - compatible con más editores</div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* External editors */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Abrir en editor externo</h3>
            <div className="space-y-3">
              {/* Mecabricks */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Mecabricks</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Editor 3D online con renderizado fotorrealista y la librería completa de piezas LEGO.
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                      <span className="shrink-0">📋</span>
                      <span>{mecabricks.instructions}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleDownloadLDR}
                        className="px-3 py-1.5 bg-white text-xs font-semibold rounded-lg border border-orange-200 hover:bg-orange-50 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar .ldr
                      </button>
                      <a
                        href={mecabricks.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 flex items-center gap-1"
                      >
                        Abrir Mecabricks <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* LeoCad */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">LeoCad</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Editor de escritorio gratuito (Windows/Mac/Linux) con librería completa LDraw.
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                      <span className="shrink-0">📋</span>
                      <span>{leocad.instructions}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleDownloadLDR}
                        className="px-3 py-1.5 bg-white text-xs font-semibold rounded-lg border border-blue-200 hover:bg-blue-50 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar .ldr
                      </button>
                      <a
                        href={leocad.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                      >
                        Descargar LeoCad <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* LDCad */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">LDCad</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Editor avanzado con herramientas de animación y diseño flexible.
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                      <span className="shrink-0">📋</span>
                      <span>{ldcad.instructions}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleDownloadLDR}
                        className="px-3 py-1.5 bg-white text-xs font-semibold rounded-lg border border-green-200 hover:bg-green-50 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar .ldr
                      </button>
                      <a
                        href={ldcad.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 flex items-center gap-1"
                      >
                        Descargar LDCad <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info banner */}
          <div className="bg-lego-yellow/10 rounded-xl p-4 border border-lego-yellow/20">
            <h4 className="text-sm font-bold mb-1">💡 Consejo</h4>
            <p className="text-xs text-gray-600">
              El archivo .ldr usa el formato estándar LDraw, compatible con todos los editores LEGO del mundo.
              Si algún editor no reconoce una pieza, usa el archivo .mpd empaquetado que incluye la geometría completa.
            </p>
          </div>
        </div>

        {/* Downloaded toast */}
        {downloaded && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            ✅ {downloaded} descargado
          </div>
        )}
      </div>
    </div>
  );
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_').substring(0, 50) || 'modelo_lego';
}
