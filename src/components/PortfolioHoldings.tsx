import { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { calculateHoldings, calculatePortfolioValue, formatCurrency, formatGrams, formatPercentage } from '../utils/calculations';
import { Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PortfolioHoldingsProps extends ReturnType<typeof useAppData> {}

export default function PortfolioHoldings({ data }: PortfolioHoldingsProps) {
  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);
  const latestPrice = data.priceData[data.priceData.length - 1];

  const currentValue = latestPrice
    ? calculatePortfolioValue(holdings, latestPrice.goldPrice, latestPrice.silverPrice, latestPrice.platinumPrice)
    : 0;

  const portfolioHistory = useMemo(() => {
    return data.priceData.slice(-30).map(price => ({
      date: price.date.substring(5),
      Gold: (holdings.gold.quantity * price.goldPrice) / 1000,
      Silver: (holdings.silver.quantity * price.silverPrice) / 1000,
      Platinum: (holdings.platinum.quantity * price.platinumPrice) / 1000,
      Total: calculatePortfolioValue(holdings, price.goldPrice, price.silverPrice, price.platinumPrice) / 1000,
    }));
  }, [data.priceData, holdings]);

  const metalData = [
    {
      metal: 'Gold',
      quantity: holdings.gold.quantity,
      avgCost: holdings.gold.averageCost,
      currentPrice: latestPrice?.goldPrice || 0,
      currentValue: holdings.gold.quantity * (latestPrice?.goldPrice || 0),
      color: 'bg-yellow-400',
    },
    {
      metal: 'Silver',
      quantity: holdings.silver.quantity,
      avgCost: holdings.silver.averageCost,
      currentPrice: latestPrice?.silverPrice || 0,
      currentValue: holdings.silver.quantity * (latestPrice?.silverPrice || 0),
      color: 'bg-gray-400',
    },
    {
      metal: 'Platinum',
      quantity: holdings.platinum.quantity,
      avgCost: holdings.platinum.averageCost,
      currentPrice: latestPrice?.platinumPrice || 0,
      currentValue: holdings.platinum.quantity * (latestPrice?.platinumPrice || 0),
      color: 'bg-gray-300',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Portfolio Holdings & Valuation</h2>
        <p className="text-gray-600">Track your current holdings and their market value.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Portfolio Value</p>
          <p className="stat-value text-primary-600">{formatCurrency(currentValue)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Cost Basis</p>
          <p className="stat-value">
            {formatCurrency(holdings.gold.totalCost + holdings.silver.totalCost + holdings.platinum.totalCost)}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Unrealized Gain/Loss</p>
          <p className={`stat-value ${currentValue >= (holdings.gold.totalCost + holdings.silver.totalCost + holdings.platinum.totalCost) ? 'text-success-600' : 'text-danger-600'}`}>
            {formatCurrency(currentValue - (holdings.gold.totalCost + holdings.silver.totalCost + holdings.platinum.totalCost))}
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Current Holdings</h3>
        {currentValue > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Metal</th>
                  <th>Quantity</th>
                  <th>Avg Cost</th>
                  <th>Current Price</th>
                  <th>Current Value</th>
                  <th>Unrealized P/L</th>
                  <th>Allocation</th>
                </tr>
              </thead>
              <tbody>
                {metalData.map(item => {
                  const unrealizedPL = item.currentValue - item.quantity * item.avgCost;
                  const unrealizedPLPercent = item.avgCost > 0 ? ((item.currentPrice - item.avgCost) / item.avgCost) * 100 : 0;
                  const allocation = currentValue > 0 ? (item.currentValue / currentValue) * 100 : 0;

                  return (
                    <tr key={item.metal}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="font-medium">{item.metal}</span>
                        </div>
                      </td>
                      <td>{formatGrams(item.quantity)}</td>
                      <td>{formatCurrency(item.avgCost)}/g</td>
                      <td>{formatCurrency(item.currentPrice)}/g</td>
                      <td>{formatCurrency(item.currentValue)}</td>
                      <td className={unrealizedPL >= 0 ? 'text-success-600' : 'text-danger-600'}>
                        {formatCurrency(unrealizedPL)} ({formatPercentage(unrealizedPLPercent)})
                      </td>
                      <td>{formatPercentage(allocation, 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No holdings yet. Start investing to build your portfolio.</p>
          </div>
        )}
      </div>

      {/* Portfolio Value Chart */}
      {portfolioHistory.length > 0 && currentValue > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Portfolio Value History (Last 30 Days, in k¥)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `¥${value.toFixed(2)}k`} />
              <Legend />
              <Line type="monotone" dataKey="Total" stroke="#0ea5e9" strokeWidth={2} />
              <Line type="monotone" dataKey="Gold" stroke="#FFD700" />
              <Line type="monotone" dataKey="Silver" stroke="#C0C0C0" />
              <Line type="monotone" dataKey="Platinum" stroke="#E5E4E2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
