import React from 'react';
import { ScreenshotAnalysis } from '@/shared/types';

interface AnalysisResultProps {
  analysis: ScreenshotAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="analysis-section">
      <div className="analysis-header">
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
          AI解析結果
        </h3>
        <div className="analysis-timestamp">
          {formatTimestamp(analysis.timestamp)}
        </div>
      </div>
      
      <div className="analysis-content">
        <div className="analysis-text">
          {analysis.analysis}
        </div>
        
        {analysis.confidence && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '6px',
            fontSize: '14px',
            color: '#4a5568'
          }}>
            信頼度: {Math.round(analysis.confidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};