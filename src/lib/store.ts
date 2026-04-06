'use client';

import { create } from 'zustand';
import type { AppState, ProjectConfig, ChatMessage } from '@/types';

const defaultConfig: ProjectConfig = {
  mode: 'free',
  maxPieces: 500,
  minPieces: 50,
  complexity: 'medium',
};

export const useAppStore = create<AppState>((set) => ({
  currentStep: 'landing',
  projectConfig: defaultConfig,
  messages: [],
  isTyping: false,
  generatedModel: null,
  currentBuildStep: 0,

  setCurrentStep: (step) => set({ currentStep: step }),

  setProjectConfig: (config) =>
    set((state) => ({
      projectConfig: { ...state.projectConfig, ...config },
    })),

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  setIsTyping: (isTyping) => set({ isTyping }),

  setGeneratedModel: (model) => set({ generatedModel: model }),

  setCurrentBuildStep: (step) => set({ currentBuildStep: step }),

  reset: () =>
    set({
      currentStep: 'landing',
      projectConfig: defaultConfig,
      messages: [],
      isTyping: false,
      generatedModel: null,
      currentBuildStep: 0,
    }),
}));
