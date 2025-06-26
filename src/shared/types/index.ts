// Electron API types
export interface ElectronAPI {
  captureScreenshot: () => Promise<Buffer>;
  getAppVersion: () => Promise<string>;
}

// Screenshot analysis types
export interface ScreenshotAnalysis {
  id: string;
  timestamp: Date;
  imageData: string; // base64
  analysis: string;
  confidence?: number;
}

// AI Service types
export interface AIAnalysisRequest {
  imageBase64: string;
  prompt?: string;
}

export interface AIAnalysisResponse {
  analysis: string;
  confidence?: number;
  usage?: {
    tokens: number;
    cost?: number;
  };
}

// App state types
export interface AppState {
  currentAnalysis: ScreenshotAnalysis | null;
  history: ScreenshotAnalysis[];
  isAnalyzing: boolean;
  error: string | null;
}

// Settings types
export interface AppSettings {
  openaiApiKey: string;
  defaultPrompt: string;
  autoSave: boolean;
  theme: 'light' | 'dark' | 'system';
}

// Global window extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}