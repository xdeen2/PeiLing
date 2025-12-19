import { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import {
  calculateHoldings,
  calculateMonthlyInvestment,
  formatCurrency,
  formatPercentage,
  calculateGSR,
} from '../utils/calculations';
import { getCurrentDate } from '../utils/helpers';
import { Calculator, Info } from 'lucide-react';

interface MonthlyInvestmentCalculatorProps extends ReturnType<typeof useAppData> {}

export default function MonthlyInvestmentCalculator({
  data,
}: MonthlyInvestmentCalculatorProps) {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);
  const latestPrice = data.priceData[data.priceData.length - 1];

  const calculation = useMemo(() => {
    if (!latestPrice) return null;
    return calculateMonthlyInvestment(selectedDate, data.config, holdings, latestPrice);
  }, [selectedDate, data.config, holdings, latestPrice]);

  const gsr = latestPrice ? calculateGSR(latestPrice.goldPrice, latestPrice.silverPrice) : 0;

  const getRSIRecommendation = (rsi: number): { text: string; color: string; multiplier: number } => {
    if (rsi > data.config.rsiThresholds.pause) {
      return { text: 'Pause - RSI too high', color: 'text-danger-600', multiplier: 0 };
    }
    if (rsi > data.config.rsiThresholds.reduce) {
      return { text: 'Reduce - 50% allocation', color: 'text-warning-600', multiplier: 0.5 };
    }
    if (rsi >= data.config.rsiThresholds.normal) {
      return { text: 'Normal - 100% allocation', color: 'text-success-600', multiplier: 1 };
    }
    return { text: 'Aggressive - 150% allocation', color: 'text-primary-600', multiplier: 1.5 };
  };

  const getGSRRecommendation = (): { text: string; color: string } => {
    if (gsr > data.config.gsrParameters.silverCheap) {
      return { text: 'Silver is undervalued - Increase silver allocation', color: 'text-primary-600' };
    }
    if (gsr < data.config.gsrParameters.goldCheap) {
      return { text: 'Gold is undervalued - Increase gold allocation', color: 'text-warning-600' };
    }
    return { text: 'GSR in normal range', color: 'text-success-600' };
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
