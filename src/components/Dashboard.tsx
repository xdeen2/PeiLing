import { useMemo, useEffect, useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import {
  calculateHoldings,
  calculatePortfolioValue,
  calculateTotalInvested,
  calculateAllocation,
  formatCurrency,
  formatPercentage,
} from '../utils/calculations';
import { daysBetween, getCurrentDate } from '../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Brain, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { getApiKeys } from '../services/priceService';

interface DashboardProps extends ReturnType<typeof useAppData> {}

export default function Dashboard({ data }: DashboardProps) {
  const { t } = useLanguage();
  const latestPrice = data.priceData[data.priceData.length - 1];
  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);

  // AI Analysis
  const aiAnalysis = useAIAnalysis(data);
  const [hasDeepSeekKey, setHasDeepSeekKey] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  // Check if DeepSeek API key is configured
  useEffect(() => {
    const keys = getApiKeys();
    setHasDeepSeekKey(!!keys.deepseekApiKey);
  }, []);

  const currentValue = useMemo(() => {
    if (!latestPrice) return 0;
    return calculatePortfolioValue(
      holdings,
      latestPrice.goldPrice,
      latestPrice.silverPrice,
      latestPrice.platinumPrice
    );
  }, [holdings, latestPrice]);

  // Trigger AI analysis when data is available
  useEffect(() => {
    if (hasDeepSeekKey && !aiAnalyzed && data.priceData.length >= 14 && currentValue > 0) {
      // Run analysis after component mounts
      const runAnalysis = async () => {
        await Promise.all([
          aiAnalysis.analyzeMarket(),
          aiAnalysis.generateRecommendations(),
          aiAnalysis.assessRisk(),
        ]);
        setAiAnalyzed(true);
      };
      runAnalysis();
    }
  }, [hasDeepSeekKey, aiAnalyzed, data.priceData.length, currentValue, aiAnalysis]);

  const handleRefreshAI = async () => {
    setAiAnalyzed(false);
    await Promise.all([
      aiAnalysis.analyzeMarket(),
      aiAnalysis.generateRecommendations(),
      aiAnalysis.assessRisk(),
    ]);
    setAiAnalyzed(true);
  };

  const totalInvested = useMemo(
    () => calculateTotalInvested(data.transactions),
    [data.transactions]
  );

  const unrealizedGain = currentValue - totalInvested;
  const unrealizedGainPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

  const targetProgress = (totalInvested / data.config.totalCapital) * 100;
  const daysRemaining = daysBetween(getCurrentDate(), data.config.accumulationEndDate);

  const currentAllocation = useMemo(() => {
    if (!latestPrice) return { gold: 0, silver: 0, platinum: 0 };
    return calculateAllocation(
      holdings,
      latestPrice.goldPrice,
      latestPrice.silverPrice,
      latestPrice.platinumPrice
    );
  }, [holdings, latestPrice]);

  const allocationData = [
    { name: t.metals.gold, value: currentAllocation.gold, target: data.config.targetAllocation.gold, color: '#FFD700' },
    { name: t.metals.silver, value: currentAllocation.silver, target: data.config.targetAllocation.silver, color: '#C0C0C0' },
    { name: t.metals.platinum, value: currentAllocation.platinum, target: data.config.targetAllocation.platinum, color: '#E5E4E2' },
  ];

  const unreadAlerts = data.alerts.filter(a => !a.read);
  const criticalAlerts = unreadAlerts.filter(a =>
    a.type === 'stop_loss_warning' || a.type === 'rsi_low' || a.type === 'gsr_extreme'
  );

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t.dashboard.portfolioSummary}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">{t.dashboard.currentValue}</p>
            <p className="stat-value text-primary-600">{formatCurrency(currentValue)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">{t.dashboard.totalInvested}</p>
            <p className="stat-value">{formatCurrency(totalInvested)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">{t.dashboard.unrealizedGain}</p>
            <div className="flex items-center gap-2">
              <p className={`stat-value ${unrealizedGain >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(unrealizedGain)}
              </p>
              {unrealizedGain >= 0 ? (
                <TrendingUp className="w-6 h-6 text-success-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-danger-600" />
              )}
            </div>
            <p className={`text-sm ${unrealizedGain >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {formatPercentage(unrealizedGainPercent)}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">{t.dashboard.daysRemaining}</p>
            <p className="stat-value">{daysRemaining}</p>
            <p className="text-sm text-gray-600">{t.dashboard.untilAccumulationEnds}</p>
          </div>
        </div>
      </div>

      {/* Investment Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t.dashboard.investmentProgress}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {formatCurrency(totalInvested)} / {formatCurrency(data.config.totalCapital)}
            </span>
            <span className="font-medium">{formatPercentage(targetProgress)}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(targetProgress, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Allocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t.dashboard.currentAllocation}</h3>
          {currentValue > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={entry => `${entry.name}: ${formatPercentage(entry.value, 1)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPercentage(value, 2)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              {t.dashboard.noHoldings}
            </div>
          )}
        </div>

        {/* Allocation vs Target */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{t.dashboard.allocationVsTarget}</h3>
          <div className="space-y-4">
            {allocationData.map(item => {
              const deviation = item.value - item.target;
              const isOnTarget = Math.abs(deviation) < 5;
              return (
                <div key={item.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {formatPercentage(item.value, 1)} / {formatPercentage(item.target, 1)}
                      </span>
                      {isOnTarget ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-warning-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 progress-bar">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{
                          width: `${(item.value / Math.max(item.value, item.target)) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                    <div className="flex-1 progress-bar">
                      <div
                        className="bg-gray-400 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${(item.target / Math.max(item.value, item.target)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  {!isOnTarget && (
                    <p className="text-xs text-gray-600 mt-1">
                      {t.dashboard.deviation}: {deviation > 0 ? '+' : ''}
                      {formatPercentage(deviation, 1)} {t.dashboard.fromTarget}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {unreadAlerts.length > 0 && (
        <div className="card border-l-4 border-warning-500">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning-600" />
            {t.dashboard.activeAlerts} ({unreadAlerts.length})
          </h3>
          <div className="space-y-2">
            {criticalAlerts.slice(0, 5).map(alert => (
              <div
                key={alert.id}
                className="p-3 bg-warning-50 border border-warning-200 rounded-lg text-sm"
              >
                <p className="font-medium text-warning-900">{alert.message}</p>
                <p className="text-xs text-warning-700 mt-1">{alert.date}</p>
              </div>
            ))}
            {unreadAlerts.length > 5 && (
              <p className="text-sm text-gray-600 text-center pt-2">
                +{unreadAlerts.length - 5} {t.dashboard.moreAlerts}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t.dashboard.quickStats}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">{t.dashboard.totalTransactions}</p>
            <p className="text-xl font-bold">{data.transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.dashboard.pendingOrders}</p>
            <p className="text-xl font-bold">
              {data.limitOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.dashboard.priceDataPoints}</p>
            <p className="text-xl font-bold">{data.priceData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">{t.dashboard.monthlyReports}</p>
            <p className="text-xl font-bold">{data.monthlyReports.length}</p>
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      {hasDeepSeekKey && (
        <>
          {/* Header with Refresh Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
                <p className="text-sm text-gray-600">Powered by DeepSeek AI</p>
              </div>
            </div>
            <button
              onClick={handleRefreshAI}
              disabled={aiAnalysis.loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${aiAnalysis.loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh AI Analysis</span>
            </button>
          </div>

          {/* AI Error Message */}
          {aiAnalysis.error && (
            <div className="card border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">AI Analysis Error</p>
                  <p className="text-sm text-red-700 mt-1">{aiAnalysis.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {aiAnalysis.loading && (
            <div className="card bg-purple-50 border-2 border-purple-200">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                  <p className="text-purple-900 font-medium">AI is analyzing your portfolio...</p>
                  <p className="text-sm text-purple-700 mt-1">This may take a few moments</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Market Sentiment */}
          {aiAnalysis.marketSentiment && !aiAnalysis.loading && (
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Market Sentiment Analysis</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      aiAnalysis.marketSentiment.sentiment === 'bullish'
                        ? 'bg-green-100 text-green-800'
                        : aiAnalysis.marketSentiment.sentiment === 'bearish'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {aiAnalysis.marketSentiment.sentiment.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      Confidence: {(aiAnalysis.marketSentiment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{aiAnalysis.marketSentiment.analysis}</p>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="text-sm font-semibold text-blue-900 mb-2">AI Recommendations:</p>
                    <ul className="space-y-1">
                      {aiAnalysis.marketSentiment.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Investment Recommendations */}
          {aiAnalysis.investmentRec && !aiAnalysis.loading && (
            <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">AI Investment Recommendations</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      aiAnalysis.investmentRec.riskLevel === 'low'
                        ? 'bg-green-100 text-green-800'
                        : aiAnalysis.investmentRec.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Risk: {aiAnalysis.investmentRec.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-3">{aiAnalysis.investmentRec.recommendation}</p>

                  {/* Suggested Allocation */}
                  <div className="bg-white rounded-lg p-3 border border-emerald-100 mb-3">
                    <p className="text-sm font-semibold text-emerald-900 mb-2">Suggested Allocation:</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Gold</p>
                        <p className="text-lg font-bold text-yellow-600">{aiAnalysis.investmentRec.allocation.gold}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Silver</p>
                        <p className="text-lg font-bold text-gray-500">{aiAnalysis.investmentRec.allocation.silver}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Platinum</p>
                        <p className="text-lg font-bold text-gray-400">{aiAnalysis.investmentRec.allocation.platinum}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-sm font-semibold text-emerald-900 mb-2">Reasoning:</p>
                    <ul className="space-y-1">
                      {aiAnalysis.investmentRec.reasoning.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-emerald-600 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Risk Assessment */}
          {aiAnalysis.portfolioRisk && !aiAnalysis.loading && (
            <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Portfolio Risk Assessment</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      aiAnalysis.portfolioRisk.riskLevel === 'low'
                        ? 'bg-green-100 text-green-800'
                        : aiAnalysis.portfolioRisk.riskLevel === 'moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : aiAnalysis.portfolioRisk.riskLevel === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {aiAnalysis.portfolioRisk.riskLevel.toUpperCase()} RISK
                    </span>
                    <span className="text-sm text-gray-600">
                      Risk Score: {aiAnalysis.portfolioRisk.riskScore}/100
                    </span>
                  </div>

                  {/* Risk Factors */}
                  <div className="bg-white rounded-lg p-3 border border-amber-100 mb-3">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Risk Factors:</p>
                    <ul className="space-y-1">
                      {aiAnalysis.portfolioRisk.factors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">⚠</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mitigation Suggestions */}
                  <div className="bg-white rounded-lg p-3 border border-amber-100">
                    <p className="text-sm font-semibold text-amber-900 mb-2">Mitigation Strategies:</p>
                    <ul className="space-y-1">
                      {aiAnalysis.portfolioRisk.mitigationSuggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* No AI Key Message */}
      {!hasDeepSeekKey && (
        <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🤖 AI Features Available</h3>
              <p className="text-gray-700 mb-3">
                Add your DeepSeek API key to unlock powerful AI-driven insights including market sentiment analysis,
                investment recommendations, and portfolio risk assessment.
              </p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to API Keys settings - this would require adding navigation
                  alert('Navigate to API Keys in the sidebar to configure DeepSeek');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Brain className="w-4 h-4" />
                Configure AI Features
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
