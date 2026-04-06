'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { getChatCompletion } from '@/lib/openai';
import {
  ArrowLeft,
  Blocks,
  Send,
  ImagePlus,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function ChatPage() {
  const {
    messages,
    addMessage,
    isTyping,
    setIsTyping,
    projectConfig,
    setCurrentStep,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const modeText =
        projectConfig.mode === 'from-set'
          ? `Veo que quieres construir a partir del set ${projectConfig.baseSetNum}. ¡Genial!`
          : '¡Veo que quieres diseñar algo totalmente nuevo!';

      addMessage({
        role: 'assistant',
        content: `¡Hola! 👋 Soy **BrickBot**, tu asistente de diseño LEGO. 🧱

${modeText}

Tu configuración:
- 🧩 Piezas: entre **${projectConfig.minPieces}** y **${projectConfig.maxPieces}**
- ⚡ Complejidad: **${projectConfig.complexity}**
${projectConfig.budget ? `- 💰 Presupuesto: **€${projectConfig.budget}**` : ''}

**¿Qué te gustaría construir?** Puedes:
- 📝 Describir tu idea con texto
- 📸 Subir una imagen de referencia
- 🎯 Decirme una temática (medieval, espacio, animales...)

¡Cuéntame todo! 🎨`,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed && images.length === 0) return;

    // Add user message
    addMessage({
      role: 'user',
      content: trimmed || '(imagen adjunta)',
      images: images.length > 0 ? images : undefined,
    });

    setInput('');
    setImages([]);
    setIsTyping(true);

    try {
      const allMessages = [
        ...useAppStore.getState().messages,
      ];

      const response = await getChatCompletion(allMessages, projectConfig);

      addMessage({ role: 'assistant', content: response });

      // Check if the AI is ready to generate
      if (response.includes('[READY_TO_GENERATE]')) {
        setTimeout(() => {
          setCurrentStep('generating');
        }, 2000);
      }
    } catch {
      addMessage({
        role: 'assistant',
        content:
          '❌ Ups, hubo un error al conectar con el asistente. Comprueba que la API key de OpenAI está configurada en el archivo `.env.local`. Mientras tanto, puedo generar un modelo de demostración.',
      });
    } finally {
      setIsTyping(false);
    }
  }, [input, images, addMessage, setIsTyping, projectConfig, setCurrentStep]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleGenerateDemo = () => {
    setCurrentStep('generating');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setCurrentStep('config')}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 bg-lego-red rounded-lg flex items-center justify-center">
          <Blocks className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-sm">BrickBot</h1>
          <p className="text-xs text-gray-400">Diseñador de LEGO con IA</p>
        </div>
        <button
          onClick={handleGenerateDemo}
          className="px-4 py-2 bg-lego-green text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generar modelo demo
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-[60%] px-5 py-3 ${
                msg.role === 'user'
                  ? 'chat-bubble-user text-white'
                  : 'chat-bubble-assistant text-gray-800'
              }`}
            >
              {/* Attached images */}
              {msg.images && msg.images.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {msg.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Referencia"
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content.replace('[READY_TO_GENERATE]', '').trim()}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-assistant px-5 py-4 flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="loading-dot w-2.5 h-2.5 bg-gray-400 rounded-full"
                  style={{ animation: 'loadingDot 1.4s infinite ease-in-out both' }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <div key={i} className="relative shrink-0">
              <img src={img} alt="" className="w-16 h-16 object-cover rounded-xl" />
              <button
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-lego-blue hover:bg-blue-50 rounded-xl transition-colors shrink-0"
            title="Subir imagen"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Text input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe tu idea LEGO..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-lego-blue focus:outline-none text-sm max-h-32"
            style={{ minHeight: '48px' }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isTyping || (!input.trim() && images.length === 0)}
            className="p-3 bg-lego-red text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
