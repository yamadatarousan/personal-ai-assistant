import { analyzeScreenshotWithHuggingFace } from './huggingface';

interface AnalysisResult {
  description: string;
  confidence: number;
}

// 無料のGoogle Gemini Flash APIを使用
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function analyzeScreenshot(imageData: string): Promise<AnalysisResult> {
  // 優先順位: 1. Hugging Face (オフライン) -> 2. Gemini API -> 3. デモモード
  
  // まずHugging Faceでの解析を試行
  try {
    console.log('Attempting Hugging Face analysis...');
    const hfResult = await analyzeScreenshotWithHuggingFace(imageData);
    if (hfResult.confidence > 0.3) {
      return hfResult;
    }
  } catch (error) {
    console.log('Hugging Face analysis failed, falling back to Gemini...', error);
  }
  // APIキーがない場合はモックレスポンスを返す
  if (!GEMINI_API_KEY) {
    return {
      description: '🤖 AI画像解析（デモモード）\n\nスクリーンショットが正常にキャプチャされました。\n\n実際のAI解析を有効にするには:\n1. Google AI Studio (https://aistudio.google.com) でAPIキーを取得\n2. GEMINI_API_KEY環境変数に設定\n\n現在はデモモードで動作しています。',
      confidence: 0.8,
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: 'この画像を詳しく分析して、何が写っているか、どのようなアプリケーションやウェブサイトなのか、ユーザーが何をしているかなどを日本語で説明してください。技術的な詳細も含めて、具体的で有用な情報を提供してください。'
            },
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || '分析結果を取得できませんでした。';
    
    const confidence = calculateConfidence(analysis);

    return {
      description: analysis,
      confidence,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // エラー時はローカル解析を試行
    return {
      description: '🔍 画像解析エラー\n\nAPI接続に問題が発生しました。基本的な情報のみ表示します:\n\n• スクリーンショットが正常にキャプチャされました\n• 画像サイズ: ' + Math.round(imageData.length * 0.75 / 1024) + 'KB\n• キャプチャ日時: ' + new Date().toLocaleString('ja-JP'),
      confidence: 0.3,
    };
  }
}

function calculateConfidence(analysis: string): number {
  // Simple confidence calculation based on response length and content
  const baseConfidence = 0.7;
  const lengthBonus = Math.min(analysis.length / 500, 0.2);
  const detailBonus = analysis.includes('アプリケーション') || analysis.includes('ウェブサイト') ? 0.1 : 0;
  
  return Math.min(baseConfidence + lengthBonus + detailBonus, 1.0);
}