import { create } from 'zustand';
import { ScreenshotAnalysis } from '@/shared/types';
import { analyzeScreenshot } from '../services/openai';

interface AppState {
  currentAnalysis: ScreenshotAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  captureAndAnalyze: () => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentAnalysis: null,
  isAnalyzing: false,
  error: null,

  captureAndAnalyze: async () => {
    if (!window.electronAPI) {
      set({ error: 'Electron API not available' });
      return;
    }

    set({ isAnalyzing: true, error: null });

    try {
      // Capture screenshot
      const imageBuffer = await window.electronAPI.captureScreenshot();
      const imageData = Buffer.from(imageBuffer).toString('base64');

      // Analyze with OpenAI
      const analysis = await analyzeScreenshot(imageData);

      const result: ScreenshotAnalysis = {
        id: Date.now().toString(),
        imageData,
        analysis: analysis.description,
        confidence: analysis.confidence,
        timestamp: new Date(),
      };

      set({ currentAnalysis: result, isAnalyzing: false });
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        isAnalyzing: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));