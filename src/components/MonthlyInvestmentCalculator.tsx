import { useState, useMemo, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import {
  calculateHoldings,
  calculateMonthlyInvestment,
  formatCurrency,
  formatPercentage,
  calculateGSR,
} from '../utils/calculations';
import { getCurrentDate } from '../utils/helpers';
import { Calculator, Info, Brain, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getApiKeys } from '../services/priceService';

interface MonthlyInvestmentCalculatorProps extends ReturnType<typeof useAppData> {}

export default function MonthlyInvestmentCalculator({
  data,
}: MonthlyInvestmentCalculatorProps) {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);
  const latestPrice = data.priceData[data.priceData.length - 1];

  // AI Analysis
  const aiAnalysis = useAIAnalysis(data);
  const [hasDeepSeekKey, setHasDeepSeekKey] = useState(false);
  const [goldEntry, setGoldEntry] = useState<any>(null);
  const [silverEntry, setSilverEntry] = useState<any>(null);
  const [platinumEntry, setPlatinumEntry] = useState<any>(null);

  // Check if DeepSeek API key is configured
  useEffect(() => {
    const keys = getApiKeys();
    setHasDeepSeekKey(!!keys.deepseekApiKey);
  }, []);

  // Predict optimal entry points when price data is available
  useEffect(() => {
    if (hasDeepSeekKey && data.priceData.length >= 14 && latestPrice) {
      const predictEntries = async () => {
        const [gold, silver, platinum] = await Promise.all([
          aiAnalysis.predictEntry('gold'),
          aiAnalysis.predictEntry('silver'),
          aiAnalysis.predictEntry('platinum'),
        ]);
        setGoldEntry(gold);
        setSilverEntry(silver);
        setPlatinumEntry(platinum);
      };
      predictEntries();
    }
  }, [hasDeepSeekKey, data.priceData.length, latestPrice, aiAnalysis]);

  const handleRefreshPredictions = async () => {
    const [gold, silver, platinum] = await Promise.all([
      aiAnalysis.predictEntry('gold'),
      aiAnalysis.predictEntry('silver'),
      aiAnalysis.predictEntry('platinum'),
    ]);
    setGoldEntry(gold);
    setSilverEntry(silver);
    setPlatinumEntry(platinum);
  };

  const calculation = useMemo(() => {
    if (!latestPrice) return null;
    return calculateMonthlyInvestment(selectedDate, data.config, holdings, latestPrice);
  }, [selectedDate, data.config, holdings, latestPrice]);

  const gsr = latestPrice ? calculateGSR(latestPrice.goldPrice, latestPrice.silverPrice) : 0;

  const getRSIRecommendation = (rsi: number): { text: string; color: string; multiplier: number } => {
    if (rsi > data.config.rsiThresholds.pause) {
      return { text: t.calculator.rsiPause, color: 'text-danger-600', multiplier: 0 };
    }
    if (rsi > data.config.rsiThresholds.reduce) {
      return { text: t.calculator.rsiReduce, color: 'text-warning-600', multiplier: 0.5 };
    }
    if (rsi >= data.config.rsiThresholds.normal) {
      return { text: t.calculator.rsiNormal, color: 'text-success-600', multiplier: 1 };
    }
    return { text: t.calculator.rsiAggressive, color: 'text-primary-600', multiplier: 1.5 };
  };

  const getGSRRecommendation = (): { text: string; color: string } => {
    if (gsr > data.config.gsrParameters.silverCheap) {
      return { text: t.calculator.gsrSilverCheap, color: 'text-primary-600' };
    }
    if (gsr < data.config.gsrParameters.goldCheap) {
      return { text: t.calculator.gsrGoldCheap, color: 'text-warning-600' };
    }
    return { text: t.calculator.gsrNormal, color: 'text-success-600' };
  };

  if (!latestPrice) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Price Data Available</h3>
          <p className="text-gray-600">Please add price data to use the investment calculator.</p>
        </div>
      </div>
    );
  }

  if (!calculation) return null;

  const goldRec = getRSIRecommendation(latestPrice.goldRSI);
  const silverRec = getRSIRecommendation(latestPrice.silverRSI);
  const platinumRec = getRSIRecommendation(latestPrice.platinumRSI);
  const gsrRec = getGSRRecommendation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Monthly Investment Calculator</h2>
        <p className="text-gray-600">
          Calculate your monthly investment amount based on value averaging strategy and market conditions.
        </p>
      </div>

      {/* Date Selection */}
      <div className="card">
        <label className="label">Calculation Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="input max-w-xs"
        />
      </div>

      {/* Value Averaging Calculation */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Value Averaging Calculation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Target Portfolio Value</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(calculation.targetValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Portfolio Value</p>
            <p className="text-2xl font-bold">
              {formatCurrency(calculation.currentValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Required Investment</p>
            <p className="text-2xl font-bold text-success-600">
              {formatCurrency(calculation.requiredInvestment)}
            </p>
          </div>
        </div>
      </div>

      {/* RSI Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">RSI Analysis & Recommendations</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Gold RSI</span>
                <span className="text-2xl font-bold">{latestPrice.goldRSI}</span>
              </div>
              <p className={`text-sm ${goldRec.color}`}>{goldRec.text}</p>
              <p className="text-xs text-gray-600 mt-1">
                Multiplier: {goldRec.multiplier}x
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Silver RSI</span>
                <span className="text-2xl font-bold">{latestPrice.silverRSI}</span>
              </div>
              <p className={`text-sm ${silverRec.color}`}>{silverRec.text}</p>
              <p className="text-xs text-gray-600 mt-1">
                Multiplier: {silverRec.multiplier}x
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Platinum RSI</span>
                <span className="text-2xl font-bold">{latestPrice.platinumRSI}</span>
              </div>
              <p className={`text-sm ${platinumRec.color}`}>{platinumRec.text}</p>
              <p className="text-xs text-gray-600 mt-1">
                Multiplier: {platinumRec.multiplier}x
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GSR Analysis */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Gold-Silver Ratio Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current GSR</p>
            <p className="text-3xl font-bold">{gsr.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">
              Normal Range: {data.config.gsrParameters.normalMin} - {data.config.gsrParameters.normalMax}
            </p>
          </div>
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-primary-600" />
                <p className={`font-medium ${gsrRec.color}`}>{gsrRec.text}</p>
              </div>
              {calculation.gsrRebalancing.needed && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm font-medium">Rebalancing Recommended</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Consider shifting allocation from {calculation.gsrRebalancing.fromMetal} to{' '}
                    {calculation.gsrRebalancing.toMetal}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Final Allocation */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
        <h3 className="text-lg font-semibold mb-4">Recommended Monthly Allocation</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="font-medium">Gold</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(calculation.finalAllocation.gold)}
              </p>
              <p className="text-sm text-gray-600">
                {formatPercentage((calculation.finalAllocation.gold / calculation.requiredInvestment) * 100, 1)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="font-medium">Silver</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(calculation.finalAllocation.silver)}
              </p>
              <p className="text-sm text-gray-600">
                {formatPercentage((calculation.finalAllocation.silver / calculation.requiredInvestment) * 100, 1)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="font-medium">Platinum</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(calculation.finalAllocation.platinum)}
              </p>
              <p className="text-sm text-gray-600">
                {formatPercentage((calculation.finalAllocation.platinum / calculation.requiredInvestment) * 100, 1)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary-600 text-white rounded-lg">
            <span className="font-bold text-lg">Total Investment</span>
            <span className="font-bold text-2xl">
              {formatCurrency(
                calculation.finalAllocation.gold +
                  calculation.finalAllocation.silver +
                  calculation.finalAllocation.platinum
              )}
            </span>
          </div>
        </div>
      </div>

      {/* AI Optimal Entry Predictions */}
      {hasDeepSeekKey && (goldEntry || silverEntry || platinumEntry) && (
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Entry Point Predictions</h3>
                <p className="text-sm text-gray-600">Optimal buying opportunities powered by DeepSeek AI</p>
              </div>
            </div>
            <button
              onClick={handleRefreshPredictions}
              disabled={aiAnalysis.loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${aiAnalysis.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {aiAnalysis.loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-purple-900 text-sm">AI is analyzing optimal entry points...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gold Entry Prediction */}
              {goldEntry && (
                <div className="bg-white rounded-lg p-4 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">Gold</span>
                    {goldEntry.shouldBuy ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Recommendation</p>
                      <p className={`text-sm font-semibold ${goldEntry.shouldBuy ? 'text-green-700' : 'text-red-700'}`}>
                        {goldEntry.shouldBuy ? 'BUY NOW' : 'WAIT'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target Price</p>
                      <p className="text-lg font-bold text-yellow-600">{formatCurrency(goldEntry.targetPrice)}/g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${goldEntry.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{(goldEntry.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Timeframe</p>
                      <p className="text-sm font-medium text-gray-700">{goldEntry.timeframe}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-700">{goldEntry.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Silver Entry Prediction */}
              {silverEntry && (
                <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">Silver</span>
                    {silverEntry.shouldBuy ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Recommendation</p>
                      <p className={`text-sm font-semibold ${silverEntry.shouldBuy ? 'text-green-700' : 'text-red-700'}`}>
                        {silverEntry.shouldBuy ? 'BUY NOW' : 'WAIT'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target Price</p>
                      <p className="text-lg font-bold text-gray-600">{formatCurrency(silverEntry.targetPrice)}/g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${silverEntry.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{(silverEntry.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Timeframe</p>
                      <p className="text-sm font-medium text-gray-700">{silverEntry.timeframe}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-700">{silverEntry.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Platinum Entry Prediction */}
              {platinumEntry && (
                <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">Platinum</span>
                    {platinumEntry.shouldBuy ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Recommendation</p>
                      <p className={`text-sm font-semibold ${platinumEntry.shouldBuy ? 'text-green-700' : 'text-red-700'}`}>
                        {platinumEntry.shouldBuy ? 'BUY NOW' : 'WAIT'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target Price</p>
                      <p className="text-lg font-bold text-gray-500">{formatCurrency(platinumEntry.targetPrice)}/g</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${platinumEntry.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{(platinumEntry.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Timeframe</p>
                      <p className="text-sm font-medium text-gray-700">{platinumEntry.timeframe}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-700">{platinumEntry.reasoning}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="card border-l-4 border-primary-500">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-2">How to Use This Calculator</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• The calculator uses value averaging to determine your monthly investment amount</li>
              <li>• RSI values adjust allocation: pause buying when overbought (&gt;70), increase when oversold (&lt;30)</li>
              <li>• Gold-Silver Ratio helps identify arbitrage opportunities between metals</li>
              <li>• Use the "Generate Orders" button to create tiered limit orders based on this allocation</li>
              {hasDeepSeekKey && <li>• AI predictions help identify optimal entry points based on price trends and technical analysis</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
