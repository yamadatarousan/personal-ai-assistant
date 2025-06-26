import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

interface OCRResult {
  extractedText: string;
  confidence: number;
  processingTime: number;
  timestamp: string;
}

const SimpleApp: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [screenshot, setScreenshot] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const extractTextWithOCR = async (imageData: string): Promise<OCRResult> => {
    const startTime = Date.now();
    
    try {
      setStatus('🔍 OCR解析中...');
      setProgress(0);

      const { data } = await Tesseract.recognize(
        `data:image/png;base64,${imageData}`,
        'jpn+eng', // 日本語と英語を認識
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`🔍 テキスト認識中... ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const processingTime = Date.now() - startTime;
      const extractedText = data.text.trim();

      return {
        extractedText: extractedText || 'テキストが検出されませんでした',
        confidence: Math.round(data.confidence),
        processingTime,
        timestamp: new Date().toLocaleString('ja-JP')
      };

    } catch (error) {
      console.error('OCR Error:', error);
      const processingTime = Date.now() - startTime;
      
      return {
        extractedText: `❌ OCR処理エラー\n\n${error instanceof Error ? error.message : '不明なエラー'}\n\n基本的な画像情報は表示されています。`,
        confidence: 0,
        processingTime,
        timestamp: new Date().toLocaleString('ja-JP')
      };
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('📋 クリップボードにコピーしました！');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setStatus('❌ コピーに失敗しました');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus('❌ 画像ファイルをドロップしてください');
      return;
    }

    setIsProcessing(true);
    setStatus('📁 ファイル読み込み中...');
    setOcrResult(null);
    setProgress(0);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        
        setScreenshot(result);
        
        // OCR処理開始
        const ocrResultData = await extractTextWithOCR(base64Data);
        setOcrResult(ocrResultData);
        setStatus('✅ ファイルからテキスト抽出完了！');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag over detected');
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drag leave detected');
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Drop detected:', e.dataTransfer.files);
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      console.log('Processing file:', files[0].name, files[0].type);
      handleFileUpload(files[0]);
    } else {
      console.log('No files found in drop');
      setStatus('❌ ファイルが見つかりません');
    }
  };

  const handleAreaCapture = async () => {
    if (!window.electronAPI) {
      setStatus('❌ Electron API not available');
      return;
    }

    try {
      setStatus('🖱️ 範囲を選択してください...');
      // TODO: Implement area selection
      setStatus('🚧 範囲選択機能は開発中です。全画面キャプチャを使用します。');
      await handleCapture();
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCapture = async () => {
    if (!window.electronAPI) {
      setStatus('❌ Electron API not available');
      return;
    }

    setIsProcessing(true);
    setStatus('');
    setOcrResult(null);
    setProgress(0);
    
    try {
      // スクリーンショット撮影
      setStatus('📸 スクリーンショット撮影中...');
      const imageBuffer = await window.electronAPI.captureScreenshot();
      
      // Convert Uint8Array to base64
      const bytes = new Uint8Array(imageBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const imageData = btoa(binary);
      setScreenshot(`data:image/png;base64,${imageData}`);
      
      // OCR処理開始
      const result = await extractTextWithOCR(imageData);
      
      setOcrResult(result);
      setStatus('✅ テキスト抽出完了！');
      
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        padding: '20px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        overflowY: 'auto',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h1 style={{ marginBottom: '20px' }}>📝 OCR テキスト抽出ツール</h1>
      
      <div style={{
        background: isDragOver ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        maxWidth: '800px',
        margin: '0 auto 20px auto',
        border: isDragOver ? '2px dashed #4CAF50' : '2px dashed transparent',
        transition: 'all 0.3s ease'
      }}>
        <h2>📸🖱️📁 マルチモード OCR ツール</h2>
        <p style={{ marginBottom: '20px', opacity: 0.9 }}>
          3つの方法でテキスト抽出が可能です（日本語・英語対応）
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <button
            onClick={handleCapture}
            disabled={isProcessing}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: isProcessing ? '#666' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              flex: '1',
              minWidth: '200px'
            }}
          >
            📸 画面全体キャプチャ
          </button>
          
          <button
            onClick={handleAreaCapture}
            disabled={isProcessing}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: isProcessing ? '#666' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              flex: '1',
              minWidth: '200px'
            }}
          >
            🖱️ 範囲選択キャプチャ
          </button>
        </div>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '2px dashed rgba(255, 255, 255, 0.3)'
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '18px' }}>📁 または画像ファイルをここにドラッグ&ドロップ</p>
          <p style={{ margin: '0 0 15px 0', opacity: 0.8, fontSize: '14px' }}>
            対応形式: PNG, JPG, JPEG, WEBP, BMP
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log('File selected via input:', file.name, file.type);
                handleFileUpload(file);
              }
            }}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              color: 'white'
            }}
          />
        </div>

        {progress > 0 && progress < 100 && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ 
              width: '100%', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '10px',
              height: '8px'
            }}>
              <div style={{
                width: `${progress}%`,
                background: '#4CAF50',
                height: '8px',
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ marginTop: '5px', fontSize: '14px' }}>進行状況: {progress}%</p>
          </div>
        )}
      </div>

      {status && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
          maxWidth: '800px',
          margin: '20px auto'
        }}>
          <h3>📊 処理状況:</h3>
          <p style={{ fontSize: '16px', lineHeight: '1.5' }}>{status}</p>
        </div>
      )}

      {screenshot && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
          maxWidth: '800px',
          margin: '20px auto'
        }}>
          <h3>📸 キャプチャした画像:</h3>
          <img 
            src={screenshot} 
            alt="Screenshot" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '300px', 
              borderRadius: '8px',
              marginTop: '10px',
              objectFit: 'contain',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }} 
          />
        </div>
      )}

      {ocrResult && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          marginTop: '20px',
          maxWidth: '800px',
          margin: '20px auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>📝 抽出されたテキスト:</h3>
            <button
              onClick={() => copyToClipboard(ocrResult.extractedText)}
              style={{
                padding: '8px 16px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 コピー
            </button>
          </div>
          
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <pre style={{ 
              fontSize: '14px', 
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              margin: 0,
              fontFamily: 'Monaco, "Courier New", monospace',
              color: '#fff'
            }}>
              {ocrResult.extractedText}
            </pre>
          </div>
          
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>信頼度: {ocrResult.confidence}%</span>
            <span>処理時間: {(ocrResult.processingTime / 1000).toFixed(1)}秒</span>
            <span>解析時刻: {ocrResult.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleApp;