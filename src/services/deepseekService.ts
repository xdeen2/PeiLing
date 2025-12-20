/**
 * DeepSeek AI Service
 * Provides AI-powered analysis for precious metals investment
 */

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

/**
 * Get DeepSeek API key from localStorage
 */
function getDeepSeekApiKey(): string | null {
  return localStorage.getItem('deepseek_api_key') || null;
}

/**
 * Call DeepSeek API with messages
 */
async function callDeepSeek(
  messages: DeepSeekMessage[],
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<string> {
  const apiKey = getDeepSeekApiKey();

  if (!apiKey) {
    throw new Error('DeepSeek API key not configured. Please add it in API Keys settings.');
  }

  const request: DeepSeekRequest = {
    model: DEFAULT_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('DeepSeek API call failed:', error);
    throw error;
  }
}

/**
 * Calculate RSI from price history using AI
 */
export async function calculateRSIWithAI(
  prices: number[],
  period: number = 14
): Promise<number> {
  const systemPrompt = `You are a financial technical analysis expert. Calculate the RSI (Relative Strength Index) for the given price data.`;

  const userPrompt = `Calculate the ${period}-period RSI for these prices (most recent last): ${prices.slice(-30).join(', ')}

Return ONLY the RSI value as a number between 0 and 100, with no explanation.`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callDeepSeek(messages, 0.3, 50);
  const rsi = parseFloat(response.trim());

  if (isNaN(rsi) || rsi < 0 || rsi > 100) {
    throw new Error('Invalid RSI calculation from AI');
  }

  return rsi;
}

/**
 * Analyze market conditions and provide sentiment
 */
export async function analyzeMarketSentiment(
  goldPrices: number[],
  silverPrices: number[],
  platinumPrices: number[]
): Promise<{
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  analysis: string;
  recommendations: string[];
}> {
  const systemPrompt = `You are an expert precious metals market analyst. Analyze price trends and provide concise, actionable insights.`;

  const userPrompt = `Analyze these recent precious metals prices (last 14 days, CNY per gram):

Gold: ${goldPrices.slice(-14).join(', ')}
Silver: ${silverPrices.slice(-14).join(', ')}
Platinum: ${platinumPrices.slice(-14).join(', ')}

Provide analysis in this exact JSON format:
{
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0.0-1.0,
  "analysis": "2-3 sentence market analysis",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callDeepSeek(messages, 0.7, 500);

  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse market analysis:', error);
    throw new Error('Failed to parse AI market analysis');
  }
}

/**
 * Generate investment recommendations based on portfolio and market data
 */
export async function generateInvestmentRecommendations(
  portfolioData: {
    currentAllocation: { gold: number; silver: number; platinum: number };
    targetAllocation: { gold: number; silver: number; platinum: number };
    totalValue: number;
    unrealizedGain: number;
  },
  marketData: {
    goldPrice: number;
    silverPrice: number;
    platinumPrice: number;
    goldRSI: number;
    silverRSI: number;
    platinumRSI: number;
    gsr: number;
  }
): Promise<{
  recommendation: string;
  allocation: { gold: number; silver: number; platinum: number };
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
}> {
  const systemPrompt = `You are an expert investment advisor specializing in precious metals portfolio management using value averaging strategy.`;

  const userPrompt = `Analyze this precious metals portfolio and provide investment recommendations:

**Portfolio:**
- Current allocation: Gold ${portfolioData.currentAllocation.gold.toFixed(1)}%, Silver ${portfolioData.currentAllocation.silver.toFixed(1)}%, Platinum ${portfolioData.currentAllocation.platinum.toFixed(1)}%
- Target allocation: Gold ${portfolioData.targetAllocation.gold}%, Silver ${portfolioData.targetAllocation.silver}%, Platinum ${portfolioData.targetAllocation.platinum}%
- Total value: ¥${portfolioData.totalValue.toFixed(2)}
- Unrealized gain: ¥${portfolioData.unrealizedGain.toFixed(2)}

**Market Data:**
- Gold: ¥${marketData.goldPrice}/g, RSI ${marketData.goldRSI}
- Silver: ¥${marketData.silverPrice}/g, RSI ${marketData.silverRSI}
- Platinum: ¥${marketData.platinumPrice}/g, RSI ${marketData.platinumRSI}
- Gold-Silver Ratio: ${marketData.gsr.toFixed(2)}

Provide recommendations in this exact JSON format:
{
  "recommendation": "Main recommendation summary",
  "allocation": {"gold": 50, "silver": 35, "platinum": 15},
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "riskLevel": "low|medium|high"
}`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callDeepSeek(messages, 0.7, 800);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse investment recommendations:', error);
    throw new Error('Failed to parse AI recommendations');
  }
}

/**
 * Predict optimal entry points for buying
 */
export async function predictOptimalEntry(
  metal: 'gold' | 'silver' | 'platinum',
  recentPrices: number[],
  currentRSI: number,
  currentPrice: number
): Promise<{
  shouldBuy: boolean;
  targetPrice: number;
  confidence: number;
  reasoning: string;
  timeframe: string;
}> {
  const systemPrompt = `You are a technical analysis expert specializing in precious metals trading. Analyze price patterns and predict optimal entry points.`;

  const userPrompt = `Analyze ${metal} for optimal buying opportunity:

Recent prices (last 14 days, CNY/gram): ${recentPrices.slice(-14).join(', ')}
Current price: ¥${currentPrice}/g
Current RSI: ${currentRSI}

Provide analysis in this exact JSON format:
{
  "shouldBuy": true|false,
  "targetPrice": number,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation",
  "timeframe": "timeframe estimate"
}`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callDeepSeek(messages, 0.7, 400);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse entry prediction:', error);
    throw new Error('Failed to parse AI entry prediction');
  }
}

/**
 * Analyze transaction history for patterns and insights
 */
export async function analyzeTransactionHistory(
  transactions: Array<{
    date: string;
    metal: string;
    type: string;
    quantity: number;
    price: number;
    amount: number;
  }>
): Promise<{
  patterns: string[];
  strengths: string[];
  improvements: string[];
  performanceScore: number;
}> {
  if (transactions.length === 0) {
    return {
      patterns: [],
      strengths: [],
      improvements: ['Start recording transactions to receive AI insights'],
      performanceScore: 0,
    };
  }

  const systemPrompt = `You are an investment performance analyst. Analyze trading patterns and provide actionable feedback.`;

  const summary = transactions.slice(-20).map(tx =>
    `${tx.date}: ${tx.type} ${tx.quantity}g ${tx.metal} @ ¥${tx.price}/g`
  ).join('\n');

  const userPrompt = `Analyze these recent precious metals transactions:

${summary}

Provide analysis in this exact JSON format:
{
  "patterns": ["pattern 1", "pattern 2"],
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "performanceScore": 0-100
}`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callDeepSeek(messages, 0.7, 600);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse transaction analysis:', error);
    throw new Error('Failed to parse AI transaction analysis');
  }
}

/**
 * Generate risk assessment
 */
export async function assessPortfolioRisk(
  portfolioData: {
    metals: Array<{ metal: string; quantity: number; avgCost: number; currentPrice: number }>;
    totalValue: number;
    concentration: { gold: number; silver: number; platinum: number };
  },
  marketVolatility: {
    gold30DayVol: number;
    silver30DayVol: number;
    platinum30DayVol: number;
  }
): Promise<{
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  factors: string[];
  mitigationSuggestions: string[];
}> {
  const systemPrompt = `You are a risk management expert for precious metals investments. Analyze portfolio risk comprehensively.`;

  const userPrompt = `Assess risk for this precious metals portfolio:

**Holdings:**
${portfolioData.metals.map(m => `${m.metal}: ${m.quantity}g @ avg ¥${m.avgCost}/g, now ¥${m.currentPrice}/g`).join('\n')}

**Allocation:**
Gold ${portfolioData.concentration.gold.toFixed(1)}%, Silver ${portfolioData.concentration.silver.toFixed(1)}%, Platinum ${portfolioData.concentration.platinum.toFixed(1)}%

**Market Volatility (30-day):**
Gold: ${marketVolatility.gold30DayVol.toFixed(2)}%
Silver: ${marketVolatility.silver30DayVol.toFixed(2)}%
Platinum: ${marketVolatility.platinum30DayVol.toFixed(2)}%

Provide risk assessment in this exact JSON format:
{
  "riskScore": 0-100,
  "riskLevel": "low|moderate|high|very-high",
  "factors": ["risk factor 1", "risk factor 2"],
  "mitigationSuggestions": ["suggestion 1", "suggestion 2"]
}`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const response = await callDeepSeek(messages, 0.7, 600);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse risk assessment:', error);
    throw new Error('Failed to parse AI risk assessment');
  }
}

export const deepseekService = {
  calculateRSIWithAI,
  analyzeMarketSentiment,
  generateInvestmentRecommendations,
  predictOptimalEntry,
  analyzeTransactionHistory,
  assessPortfolioRisk,
};
