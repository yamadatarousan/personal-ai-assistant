import React, { useState } from 'react';
import { useAppStore } from '../stores/appStore';

export const ScreenshotCapture: React.FC = () => {
  const { captureAndAnalyze, isAnalyzing, currentAnalysis } = useAppStore();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (isAnalyzing || !window.electronAPI) return;

    setIsCapturing(true);
    try {
      await captureAndAnalyze();
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="capture-section">
      <h2 style={{ marginBottom: '16px', color: '#2d3748' }}>
        スクリーンショット解析
      </h2>
      
      <p style={{ marginBottom: '24px', color: '#718096' }}>
        画面をキャプチャしてAIに解析させましょう
      </p>

      <button
        className="btn btn-primary"
        onClick={handleCapture}
        disabled={isAnalyzing || isCapturing}
        style={{ fontSize: '18px', padding: '16px 32px' }}
      >
        {isCapturing ? (
          <>
            <span>📷</span>
            キャプチャ中...
          </>
        ) : isAnalyzing ? (
          <>
            <span>🤖</span>
            AI解析中...
          </>
        ) : (
          <>
            <span>📸</span>
            スクリーンショットを撮る
          </>
        )}
      </button>

      {currentAnalysis && (
        <div className="screenshot-preview">
          <img
            src={`data:image/png;base64,${currentAnalysis.imageData}`}
            alt="Screenshot"
            className="screenshot-image"
            style={{ maxHeight: '200px', marginTop: '16px' }}
          />
        </div>
      )}
    </div>
  );
};