import React, { useState, useEffect } from 'react';
import { ScreenshotCapture } from './components/ScreenshotCapture';
import { AnalysisResult } from './components/AnalysisResult';
import { AppHeader } from './components/AppHeader';
import { useAppStore } from './stores/appStore';

const App: React.FC = () => {
  const { currentAnalysis, isAnalyzing, error } = useAppStore();

  return (
    <div className="app">
      <AppHeader />
      
      <main className="main-content">
        <div className="container">
          <div className="capture-section">
            <ScreenshotCapture />
          </div>
          
          {error && (
            <div className="error-message">
              <p>エラーが発生しました: {error}</p>
            </div>
          )}
          
          {isAnalyzing && (
            <div className="loading-message">
              <p>AI が画像を解析中...</p>
              <div className="spinner"></div>
            </div>
          )}
          
          {currentAnalysis && (
            <div className="analysis-section">
              <AnalysisResult analysis={currentAnalysis} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;