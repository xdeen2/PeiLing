import { useState, useCallback } from 'react';
import {
  calculateRSIWithAI,
  analyzeMarketSentiment,
  generateInvestmentRecommendations,
  predictOptimalEntry,
  analyzeTransactionHistory,
  assessPortfolioRisk,
} from '../services/deepseekService';
import type { AppData, PriceData } from '../types';
import { calculateHoldings } from '../utils/calculations';

interface AIAnalysisState {
  loading: boolean;
  error: string | null;
}

interface MarketSentiment {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  analysis: string;
  recommendations: string[];
}

interface InvestmentRecommendation {
  recommendation: string;
  allocation: { gold: number; silver: number; platinum: number };
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface OptimalEntry {
  shouldBuy: boolean;
  targetPrice: number;
  confidence: number;
  reasoning: string;
  timeframe: string;
}

interface TransactionAnalysis {
  patterns: string[];
  strengths: string[];
  improvements: string[];
  performanceScore: number;
}

interface PortfolioRisk {
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  factors: string[];
  mitigationSuggestions: string[];
}

export function useAIAnalysis(data: AppData) {
  const [state, setState] = useState<AIAnalysisState>({
    loading: false,
    error: null,
  });

  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [investmentRec, setInvestmentRec] = useState<InvestmentRecommendation | null>(null);
  const [portfolioRisk, setPortfolioRisk] = useState<PortfolioRisk | null>(null);
  const [transactionAnalysis, setTransactionAnalysis] = useState<TransactionAnalysis | null>(null);

  // Calculate RSI using AI
  const calculateRSI = useCallback(async (prices: number[], period: number = 14): Promise<number | null> => {
    try {
      setState({ loading: true, error: null });
      const rsi = await calculateRSIWithAI(prices, period);
      setState({ loading: false, error: null });
      return rsi;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to calculate RSI';
      setState({ loading: false, error: errorMsg });
      return null;
    }
  }, []);

  // Analyze market sentiment
  const analyzeMarket = useCallback(async () => {
    try {
      setState({ loading: true, error: null });

      // Extract price history from data
      const goldPrices = data.priceData.map((p: PriceData) => p.goldPrice);
      const silverPrices = data.priceData.map((p: PriceData) => p.silverPrice);
      const platinumPrices = data.priceData.map((p: PriceData) => p.platinumPrice || 0);

      if (goldPrices.length < 14 || silverPrices.length < 14) {
        throw new Error('Need at least 14 days of price data for analysis');
      }

      const sentiment = await analyzeMarketSentiment(goldPrices, silverPrices, platinumPrices);
      setMarketSentiment(sentiment);
      setState({ loading: false, error: null });
      return sentiment;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze market';
      setState({ loading: false, error: errorMsg });
      return null;
    }
  }, [data.priceData]);

  // Generate investment recommendations
  const generateRecommendations = useCallback(async () => {
    try {
      setState({ loading: true, error: null });

      // Calculate holdings from transactions
      const holdings = calculateHoldings(data.transactions);

      const latestPrice = data.priceData[data.priceData.length - 1];

      const goldTotal = holdings.gold.quantity * (latestPrice?.goldPrice || 0);
      const silverTotal = holdings.silver.quantity * (latestPrice?.silverPrice || 0);
      const platinumTotal = holdings.platinum.quantity * (latestPrice?.platinumPrice || 0);

      const totalValue = goldTotal + silverTotal + platinumTotal;

      const currentAllocation = {
        gold: totalValue > 0 ? (goldTotal / totalValue) * 100 : 0,
        silver: totalValue > 0 ? (silverTotal / totalValue) * 100 : 0,
        platinum: totalValue > 0 ? (platinumTotal / totalValue) * 100 : 0,
      };

      const unrealizedGain =
        (latestPrice?.goldPrice || 0 - holdings.gold.averageCost) * holdings.gold.quantity +
        (latestPrice?.silverPrice || 0 - holdings.silver.averageCost) * holdings.silver.quantity +
        (latestPrice?.platinumPrice || 0 - holdings.platinum.averageCost) * holdings.platinum.quantity;

      const portfolioData = {
        currentAllocation,
        targetAllocation: data.config.targetAllocation,
        totalValue,
        unrealizedGain,
      };

      const marketData = {
        goldPrice: latestPrice?.goldPrice || 0,
        silverPrice: latestPrice?.silverPrice || 0,
        platinumPrice: latestPrice?.platinumPrice || 0,
        goldRSI: latestPrice?.goldRSI || 50,
        silverRSI: latestPrice?.silverRSI || 50,
        platinumRSI: latestPrice?.platinumRSI || 50,
        gsr: latestPrice ? latestPrice.goldPrice / latestPrice.silverPrice : 70,
      };

      const recommendation = await generateInvestmentRecommendations(portfolioData, marketData);
      setInvestmentRec(recommendation);
      setState({ loading: false, error: null });
      return recommendation;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate recommendations';
      setState({ loading: false, error: errorMsg });
      return null;
    }
  }, [data.transactions, data.priceData, data.config.targetAllocation]);

  // Predict optimal entry point
  const predictEntry = useCallback(async (metal: 'gold' | 'silver' | 'platinum'): Promise<OptimalEntry | null> => {
    try {
      setState({ loading: true, error: null });

      const priceKey = `${metal}Price` as keyof PriceData;
      const rsiKey = `${metal}RSI` as keyof PriceData;

      const recentPrices = data.priceData.map((p: PriceData) => p[priceKey] as number).filter((p: number) => p > 0);
      const latestPrice = data.priceData[data.priceData.length - 1];
      const currentPrice = latestPrice?.[priceKey] as number || 0;
      const currentRSI = latestPrice?.[rsiKey] as number || 50;

      if (recentPrices.length < 14) {
        throw new Error('Need at least 14 days of price data for entry prediction');
      }

      const entry = await predictOptimalEntry(metal, recentPrices, currentRSI, currentPrice);
      setState({ loading: false, error: null });
      return entry;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to predict entry';
      setState({ loading: false, error: errorMsg });
      return null;
    }
  }, [data.priceData]);

  // Analyze transaction history
  const analyzeTransactions = useCallback(async () => {
    try {
      setState({ loading: true, error: null });

      const analysis = await analyzeTransactionHistory(data.transactions);
      setTransactionAnalysis(analysis);
      setState({ loading: false, error: null });
      return analysis;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze transactions';
      setState({ loading: false, error: errorMsg });
      return null;
    }
  }, [data.transactions]);

  // Assess portfolio risk
  const assessRisk = useCallback(async () => {
    try {
      setState({ loading: true, error: null });

      // Calculate holdings from transactions
      const holdings = calculateHoldings(data.transactions);

      const latestPrice = data.priceData[data.priceData.length - 1];

      const metals = [
        {
          metal: 'Gold',
          quantity: holdings.gold.quantity,
          avgCost: holdings.gold.averageCost,
          currentPrice: latestPrice?.goldPrice || 0,
        },
        {
          metal: 'Silver',
          quantity: holdings.silver.quantity,
          avgCost: holdings.silver.averageCost,
          currentPrice: latestPrice?.silverPrice || 0,
        },
        {
          metal: 'Platinum',
          quantity: holdings.platinum.quantity,
          avgCost: holdings.platinum.averageCost,
          currentPrice: latestPrice?.platinumPrice || 0,
        },
      ];

      const totalValue = metals.reduce((sum: number, m) => sum + (m.quantity * m.currentPrice), 0);

      const concentration = {
        gold: totalValue > 0 ? (holdings.gold.quantity * (latestPrice?.goldPrice || 0)) / totalValue * 100 : 0,
        silver: totalValue > 0 ? (holdings.silver.quantity * (latestPrice?.silverPrice || 0)) / totalValue * 100 : 0,
        platinum: totalValue > 0 ? (holdings.platinum.quantity * (latestPrice?.platinumPrice || 0)) / totalValue * 100 : 0,
      };

      // Calculate 30-day volatility
      const last30Days = data.priceData.slice(-30);

      const calculateVolatility = (prices: number[]) => {
        if (prices.length < 2) return 0;
        const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance) * 100;
      };

      const marketVolatility = {
        gold30DayVol: calculateVolatility(last30Days.map((p: PriceData) => p.goldPrice)),
        silver30DayVol: calculateVolatility(last30Days.map((p: PriceData) => p.silverPrice)),
        platinum30DayVol: calculateVolatility(last30Days.map((p: PriceData) => p.platinumPrice || 0)),
      };

      const portfolioData = { metals, totalValue, concentration };

      const risk = await assessPortfolioRisk(portfolioData, marketVolatility);
      setPortfolioRisk(risk);
      setState({ loading: false, error: null });
      return risk;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to assess risk';
      setState({ loading: false, error: errorMsg });
      return null;
    }
  }, [data.transactions, data.priceData]);

  return {
    // State
    loading: state.loading,
    error: state.error,

    // Cached results
    marketSentiment,
    investmentRec,
    portfolioRisk,
    transactionAnalysis,

    // Functions
    calculateRSI,
    analyzeMarket,
    generateRecommendations,
    predictEntry,
    analyzeTransactions,
    assessRisk,
  };
}
