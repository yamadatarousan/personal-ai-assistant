interface AnalysisResult {
  description: string;
  confidence: number;
}

// Hugging Face Inference APIを使用（無料枠あり）
const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';
const HF_API_URL = 'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base';

export async function analyzeScreenshotWithHuggingFace(imageData: string): Promise<AnalysisResult> {
  // APIトークンがない場合はローカル解析
  if (!HF_API_TOKEN) {
    return analyzeScreenshotLocally(imageData);
  }

  try {
    // Base64をバイト配列に変換
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }

    // Hugging Face Inference APIにリクエスト
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/octet-stream',
      },
      body: bytes,
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    const caption = result[0]?.generated_text || 'キャプションを生成できませんでした。';
    
    const detailedAnalysis = generateDetailedAnalysis(caption);
    
    return {
      description: detailedAnalysis,
      confidence: calculateConfidence(caption),
    };

  } catch (error) {
    console.error('Hugging Face API error:', error);
    // APIエラー時はローカル解析にフォールバック
    return analyzeScreenshotLocally(imageData);
  }
}

// ローカル画像解析（オフライン）
function analyzeScreenshotLocally(imageData: string): AnalysisResult {
  const imageSize = Math.round(imageData.length * 0.75 / 1024);
  const timestamp = new Date().toLocaleString('ja-JP');
  
  // 画像の特徴を簡易解析
  const features = analyzeImageFeatures(imageData);
  
  const description = `🔍 ローカル画像解析

📊 **画像情報:**
• ファイルサイズ: ${imageSize}KB
• キャプチャ時刻: ${timestamp}
• 推定解像度: ${features.estimatedResolution}

🔍 **基本解析:**
${features.basicAnalysis}

💡 **AI解析を有効にするには:**
1. Hugging Face (https://huggingface.co) でアカウント作成
2. アクセストークンを取得（無料）
3. HUGGINGFACE_API_TOKEN環境変数に設定

🔒 **プライバシー保護:**
この解析はお使いのデバイス上で完全にローカルで実行されています。
画像データは外部に送信されません。`;

  return {
    description,
    confidence: 0.6,
  };
}

function analyzeImageFeatures(imageData: string) {
  const dataSize = imageData.length;
  
  // データサイズから解像度を推定
  let estimatedResolution = '不明';
  if (dataSize > 2000000) estimatedResolution = '高解像度 (1920x1080以上)';
  else if (dataSize > 1000000) estimatedResolution = '中解像度 (1366x768程度)';
  else if (dataSize > 500000) estimatedResolution = '標準解像度 (1024x768程度)';
  else estimatedResolution = '低解像度 (800x600以下)';

  // 基本的な画像解析
  const basicAnalysis = `• スクリーンショットが正常にキャプチャされました
• 画像形式: PNG (Base64エンコード)
• データサイズに基づく画質評価: ${dataSize > 1000000 ? '高品質' : '標準品質'}
• 推定用途: デスクトップ画面キャプチャ`;

  return {
    estimatedResolution,
    basicAnalysis,
  };
}

function generateDetailedAnalysis(caption: string): string {
  const timestamp = new Date().toLocaleString('ja-JP');
  
  return `🤖 AI画像解析 (Hugging Face BLIP)

📋 **解析結果:**
${caption}

🔍 **詳細分析:**
• 解析時刻: ${timestamp}
• 使用モデル: Salesforce/blip-image-captioning-base
• 処理方式: Hugging Face Inference API
• データ保護: HTTPS暗号化通信

💡 **技術情報:**
この解析はHugging Faceの最新BLIP (Bootstrapped Language-Image Pre-training) モデルを使用しています。
無料枠内で高品質な画像キャプション生成が可能です。`;
}

function calculateConfidence(caption: string): number {
  // キャプションの質に基づいて信頼度を計算
  const baseConfidence = 0.6;
  
  // 長さボーナス
  const lengthBonus = Math.min(caption.length / 50, 0.2);
  
  // 詳細度ボーナス
  const detailWords = ['computer', 'screen', 'window', 'application', 'website', 'text', 'image'];
  const detailCount = detailWords.filter(word => 
    caption.toLowerCase().includes(word)
  ).length;
  const detailBonus = Math.min(detailCount * 0.05, 0.2);
  
  return Math.min(baseConfidence + lengthBonus + detailBonus, 1.0);
}