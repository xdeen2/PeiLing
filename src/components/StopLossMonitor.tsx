import { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { calculateHoldings, calculateStopLossStatus, calculate30DayVolatility, formatCurrency, formatPercentage } from '../utils/calculations';
import { Shield, AlertTriangle } from 'lucide-react';
import { Metal } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface StopLossMonitorProps extends ReturnType<typeof useAppData> {}

export default function StopLossMonitor({ data }: StopLossMonitorProps) {
  const { t } = useLanguage();
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
        <p className="text-gray-600">{t.stopLoss.noPriceData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t.stopLoss.title}</h2>
        <p className="text-gray-600">{t.stopLoss.subtitle}</p>
      </div>

      {/* Stop-Loss Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stopLossStatuses.map(status => (
          <div key={status.metal} className={`card border-2 ${getStatusBg(status.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{t.metals[status.metal as keyof typeof t.metals]}</h3>
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
                <p className="text-sm text-gray-600">{t.common.price}</p>
                <p className="text-xl font-bold">{formatCurrency(status.currentPrice)}/g</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">{t.stopLoss.averageCost}</p>
                <p className="text-lg">{formatCurrency(status.averageCost)}/g</p>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-600">{t.stopLoss.dynamicStopLoss}</p>
                <p className={`text-lg font-semibold ${getStatusColor(status.status)}`}>
                  {formatCurrency(status.dynamicStopLoss)}/g
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {t.stopLoss.distance}: {formatPercentage(status.distanceFromStop, 1)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">{t.stopLoss.hardStopLoss}</p>
                <p className="text-lg text-danger-600 font-semibold">
                  {formatCurrency(status.hardStopLoss)}/g
                </p>
              </div>

              <div className={`p-3 rounded-lg ${status.status === 'safe' ? 'bg-success-100' : status.status === 'warning' ? 'bg-warning-100' : 'bg-danger-100'}`}>
                <p className={`text-sm font-medium ${getStatusColor(status.status)}`}>
                  {status.status === 'safe' && t.stopLoss.statusSafe}
                  {status.status === 'warning' && t.stopLoss.statusWarning}
                  {status.status === 'danger' && t.stopLoss.statusDanger}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="card border-l-4 border-primary-500">
        <h3 className="font-semibold mb-3">{t.stopLoss.understandingTitle}</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>{t.stopLoss.dynamicStopLoss}:</strong> {t.stopLoss.dynamicDescription}</p>
          <p><strong>{t.stopLoss.hardStopLoss}:</strong> {t.stopLoss.hardDescription}</p>
          <p><strong>{t.stopLoss.statusIndicators}</strong></p>
          <ul className="ml-4 space-y-1">
            <li className="text-success-600">• <strong>{t.stopLoss.statusSafeDesc}</strong></li>
            <li className="text-warning-600">• <strong>{t.stopLoss.statusWarningDesc}</strong></li>
            <li className="text-danger-600">• <strong>{t.stopLoss.statusDangerDesc}</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
