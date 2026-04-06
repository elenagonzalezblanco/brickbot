// ── Core Application Types ──

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // base64 encoded images
  timestamp: Date;
}

export interface ProjectConfig {
  mode: 'free' | 'from-set';
  budget?: number; // estimated budget in EUR
  maxPieces?: number;
  minPieces?: number;
  baseSetNum?: string; // if building from existing set
  complexity: 'simple' | 'medium' | 'advanced';
}

export interface LegoPart {
  partNum: string;
  name: string;
  colorId: number;
  colorName: string;
  colorHex: string;
  quantity: number;
  imageUrl?: string;
  category?: string;
  priceEstimate?: number;
}

export interface LegoSet {
  setNum: string;
  name: string;
  year: number;
  numParts: number;
  imageUrl: string;
  theme?: string;
}

export interface BuildStep {
  stepNumber: number;
  description: string;
  parts: LegoPart[];
  ldrawContent?: string; // LDraw format content for this step
}

export interface LegoModel {
  id: string;
  name: string;
  description: string;
  totalParts: number;
  estimatedPrice: number;
  ldrawContent: string; // Full LDraw file content
  steps: BuildStep[];
  partsList: LegoPart[];
  sourcingSuggestions: SourcingSuggestion[];
}

export interface SourcingSuggestion {
  type: 'set' | 'bricklink' | 'pick-a-brick';
  name: string;
  url?: string;
  partsProvided: number;
  totalPartsNeeded: number;
  estimatedCost: number;
  coveragePercent: number;
}

export interface AppState {
  // Flow state
  currentStep: 'landing' | 'config' | 'chat' | 'generating' | 'viewer';
  
  // Config
  projectConfig: ProjectConfig;
  
  // Chat
  messages: ChatMessage[];
  isTyping: boolean;
  
  // Model
  generatedModel: LegoModel | null;
  currentBuildStep: number;
  
  // Actions
  setCurrentStep: (step: AppState['currentStep']) => void;
  setProjectConfig: (config: Partial<ProjectConfig>) => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsTyping: (v: boolean) => void;
  setGeneratedModel: (model: LegoModel | null) => void;
  setCurrentBuildStep: (step: number) => void;
  reset: () => void;
}
