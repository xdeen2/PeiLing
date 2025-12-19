import { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { calculateHoldings, calculateStopLossStatus, calculate30DayVolatility, formatCurrency, formatPercentage } from '../utils/calculations';
import { Shield, AlertTriangle } from 'lucide-react';
import { Metal } from '../types';

interface StopLossMonitorProps extends ReturnType<typeof useAppData> {}

export default function StopLossMonitor({ data }: StopLossMonitorProps) {
  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);
  const latestPrice = data.priceData[data.priceData.length - 1];

  const stopLossStatuses = useMemo(() => {
    if (!latestPrice) return [];

    const metals: Metal[] = ['gold', 'silver', 'platinum'];
    return metals.map(metal => {
      const volatility = calculate30DayVolatility(data.priceData, metal);
      const currentPrice =
        metal === 'gold' ? latestPrice.goldPrice :
        metal === 'silver' ? latestPrice.silverPrice :
        latestPrice.platinumPrice;

      return calculateStopLossStatus(metal, holdings, currentPrice, volatility, data.config);
    });
  }, [holdings, latestPrice, data.priceData, data.config]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-success-600';
      case 'warning': return 'text-warning-600';
      case 'danger': return 'text-danger-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-success-50 border-success-200';
      case 'warning': return 'bg-warning-50 border-warning-200';
      case 'danger': return 'bg-danger-50 border-danger-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!latestPrice) {
    return (
      <div className="card text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Add price data to monitor stop-loss levels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Stop-Loss Monitor</h2>
        <p className="text-gray-600">Dynamic and hard stop-loss monitoring for risk management.</p>
      </div>

      {/* Stop-Loss Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stopLossStatuses.map(status => (
          <div key={status.metal} className={`card border-2 ${getStatusBg(status.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{status.metal}</h3>
              <div className={`p-2 rounded-full ${status.status === 'safe' ? 'bg-success-100' : status.status === 'warning' ? 'bg-warning-100' : 'bg-danger-100'}`}>
                {status.status === 'danger' ? (
                  <AlertTriangle className={`w-6 h-6 ${getStatusColor(status.status)}`} />
                ) : (
                  <Shield className={`w-6 h-6 ${getStatusColor(status.status)}`} />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-xl font-bold">{formatCurrency(status.currentPrice)}/g</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Average Cost</p>
                <p className="text-lg">{formatCurrency(status.averageCost)}/g</p>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">Dynamic Stop-Loss</p>
                <p className={`text-lg font-semibold ${getStatusColor(status.status)}`}>
                  {formatCurrency(status.dynamicStopLoss)}/g
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Distance: {formatPercentage(status.distanceFromStop, 1)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Hard Stop-Loss (-25%)</p>
                <p className="text-lg text-danger-600 font-semibold">
                  {formatCurrency(status.hardStopLoss)}/g
                </p>
              </div>

              <div className={`p-3 rounded-lg ${status.status === 'safe' ? 'bg-success-100' : status.status === 'warning' ? 'bg-warning-100' : 'bg-danger-100'}`}>
                <p className={`text-sm font-medium ${getStatusColor(status.status)}`}>
                  {status.status === 'safe' && '✓ Price is safe from stop-loss'}
                  {status.status === 'warning' && '⚠ Warning: Approaching stop-loss'}
                  {status.status === 'danger' && '⚠ Danger: Very close to stop-loss!'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="card border-l-4 border-primary-500">
        <h3 className="font-semibold mb-3">Understanding Stop-Loss Levels</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Dynamic Stop-Loss:</strong> Calculated as Average Cost - (30-day volatility × 2.5 × 20). Adjusts based on market volatility.</p>
          <p><strong>Hard Stop-Loss:</strong> Fixed at 25% below average cost. Acts as an absolute floor to limit maximum loss.</p>
          <p><strong>Status Indicators:</strong></p>
          <ul className="ml-4 space-y-1">
            <li className="text-success-600">• <strong>Safe:</strong> Price is &gt;10% from stop-loss</li>
            <li className="text-warning-600">• <strong>Warning:</strong> Price is 5-10% from stop-loss</li>
            <li className="text-danger-600">• <strong>Danger:</strong> Price is &lt;5% from stop-loss - consider selling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
