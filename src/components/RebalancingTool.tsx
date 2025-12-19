import { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { calculateHoldings, calculateRebalancing, formatCurrency, formatGrams, formatPercentage } from '../utils/calculations';
import { RefreshCw } from 'lucide-react';

export default function RebalancingTool({ data }: ReturnType<typeof useAppData>) {
  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);
  const latestPrice = data.priceData[data.priceData.length - 1];

  const rebalancing = useMemo(() => {
    if (!latestPrice) return null;
    return calculateRebalancing(
      holdings,
      latestPrice.goldPrice,
      latestPrice.silverPrice,
      latestPrice.platinumPrice,
      data.config
    );
  }, [holdings, latestPrice, data.config]);

  if (!latestPrice || !rebalancing) {
    return (
      <div className="card text-center py-12">
        <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Add price data and holdings to use rebalancing tool.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Rebalancing Tool</h2>
        <p className="text-gray-600">Monitor allocation drift and rebalance when deviation exceeds 15%.</p>
      </div>

      {/* Status */}
      <div className={`card border-l-4 ${rebalancing.needed ? 'border-warning-500 bg-warning-50' : 'border-success-500 bg-success-50'}`}>
        <h3 className="text-lg font-semibold mb-2">
          {rebalancing.needed ? '⚠ Rebalancing Recommended' : '✓ Portfolio is Balanced'}
        </h3>
        <p className="text-sm text-gray-700">
          {rebalancing.needed
            ? 'Your portfolio allocation has deviated more than 15% from target.'
            : 'Your portfolio allocation is within acceptable range.'}
        </p>
      </div>

      {/* Allocation Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Current vs Target Allocation</h3>
        <div className="space-y-4">
          {(['gold', 'silver', 'platinum'] as const).map(metal => (
            <div key={metal}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium capitalize">{metal}</span>
                <div className="text-sm">
                  <span>{formatPercentage(rebalancing.currentAllocation[metal], 1)}</span>
                  <span className="text-gray-500 mx-2">/</span>
                  <span className="text-gray-600">{formatPercentage(rebalancing.targetAllocation[metal], 1)}</span>
                  <span className={`ml-2 ${Math.abs(rebalancing.deviations[metal]) > 15 ? 'text-danger-600' : Math.abs(rebalancing.deviations[metal]) > 5 ? 'text-warning-600' : 'text-success-600'}`}>
                    ({rebalancing.deviations[metal] > 0 ? '+' : ''}{formatPercentage(rebalancing.deviations[metal], 1)})
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className={`h-2.5 rounded-full ${Math.abs(rebalancing.deviations[metal]) > 15 ? 'bg-danger-500' : Math.abs(rebalancing.deviations[metal]) > 5 ? 'bg-warning-500' : 'bg-success-500'}`}
                  style={{ width: `${rebalancing.currentAllocation[metal]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalancing Trades */}
      {rebalancing.needed && rebalancing.trades && (
        <div className="card bg-primary-50">
          <h3 className="text-lg font-semibold mb-4">Recommended Trades</h3>
          <div className="space-y-4">
            {rebalancing.trades.sell && (
              <div className="p-4 bg-danger-100 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Sell (Overweight)</p>
                <p className="text-xl font-bold capitalize">{rebalancing.trades.sell.metal}</p>
                <p className="text-lg">{formatCurrency(rebalancing.trades.sell.amount)}</p>
                <p className="text-sm text-gray-600">{formatGrams(rebalancing.trades.sell.quantity)}</p>
              </div>
            )}
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-primary-600" />
            </div>
            {rebalancing.trades.buy && (
              <div className="p-4 bg-success-100 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Buy (Underweight)</p>
                <p className="text-xl font-bold capitalize">{rebalancing.trades.buy.metal}</p>
                <p className="text-lg">{formatCurrency(rebalancing.trades.buy.amount)}</p>
                <p className="text-sm text-gray-600">{formatGrams(rebalancing.trades.buy.quantity)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
