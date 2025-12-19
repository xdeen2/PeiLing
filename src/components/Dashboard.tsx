import { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
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
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardProps extends ReturnType<typeof useAppData> {}

export default function Dashboard({ data }: DashboardProps) {
  const latestPrice = data.priceData[data.priceData.length - 1];
  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);

  const currentValue = useMemo(() => {
    if (!latestPrice) return 0;
    return calculatePortfolioValue(
      holdings,
      latestPrice.goldPrice,
      latestPrice.silverPrice,
      latestPrice.platinumPrice
    );
  }, [holdings, latestPrice]);

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
    { name: 'Gold', value: currentAllocation.gold, target: data.config.targetAllocation.gold, color: '#FFD700' },
    { name: 'Silver', value: currentAllocation.silver, target: data.config.targetAllocation.silver, color: '#C0C0C0' },
    { name: 'Platinum', value: currentAllocation.platinum, target: data.config.targetAllocation.platinum, color: '#E5E4E2' },
  ];

  const unreadAlerts = data.alerts.filter(a => !a.read);
  const criticalAlerts = unreadAlerts.filter(a =>
    a.type === 'stop_loss_warning' || a.type === 'rsi_low' || a.type === 'gsr_extreme'
  );

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">Current Total Value</p>
            <p className="stat-value text-primary-600">{formatCurrency(currentValue)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Total Invested</p>
            <p className="stat-value">{formatCurrency(totalInvested)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Unrealized Gain/Loss</p>
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
            <p className="stat-label">Days Remaining</p>
            <p className="stat-value">{daysRemaining}</p>
            <p className="text-sm text-gray-600">Until accumulation ends</p>
          </div>
        </div>
      </div>

      {/* Investment Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Investment Progress</h3>
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
          <h3 className="text-lg font-semibold mb-4">Current Allocation</h3>
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
              No holdings yet. Start investing to see your allocation.
            </div>
          )}
        </div>

        {/* Allocation vs Target */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Allocation vs Target</h3>
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
                      Deviation: {deviation > 0 ? '+' : ''}
                      {formatPercentage(deviation, 1)} from target
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
            Active Alerts ({unreadAlerts.length})
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
                +{unreadAlerts.length - 5} more alerts
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-xl font-bold">{data.transactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-xl font-bold">
              {data.limitOrders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Price Data Points</p>
            <p className="text-xl font-bold">{data.priceData.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Monthly Reports</p>
            <p className="text-xl font-bold">{data.monthlyReports.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
