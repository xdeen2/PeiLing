import { useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { calculateHoldings, calculateTotalInvested, calculatePortfolioValue, calculateMaxDrawdown, formatCurrency, formatPercentage } from '../utils/calculations';
import { BarChart3 } from 'lucide-react';

export default function PerformanceReports({ data }: ReturnType<typeof useAppData>) {
  const holdings = useMemo(() => calculateHoldings(data.transactions), [data.transactions]);
  const totalInvested = useMemo(() => calculateTotalInvested(data.transactions), [data.transactions]);
  const latestPrice = data.priceData[data.priceData.length - 1];

  const currentValue = latestPrice
    ? calculatePortfolioValue(holdings, latestPrice.goldPrice, latestPrice.silverPrice, latestPrice.platinumPrice)
    : 0;

  const totalReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  const portfolioValues = useMemo(() => {
    return data.priceData.map(price =>
      calculatePortfolioValue(holdings, price.goldPrice, price.silverPrice, price.platinumPrice)
    );
  }, [data.priceData, holdings]);

  const maxDrawdown = useMemo(() => calculateMaxDrawdown(portfolioValues), [portfolioValues]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Performance Reports</h2>
        <p className="text-gray-600">Track your investment performance and analyze returns.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Return</p>
          <p className={`stat-value ${totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
            {formatPercentage(totalReturn)}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Invested</p>
          <p className="stat-value">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Current Value</p>
          <p className="stat-value text-primary-600">{formatCurrency(currentValue)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Max Drawdown</p>
          <p className="stat-value text-danger-600">{formatPercentage(maxDrawdown)}</p>
        </div>
      </div>

      {/* Monthly Reports */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Monthly Reports</h3>
        {data.monthlyReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Invested</th>
                  <th>Monthly Return</th>
                  <th>Fill Rate</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyReports.map(report => (
                  <tr key={report.month}>
                    <td>{report.month}</td>
                    <td>{formatCurrency(report.invested)}</td>
                    <td className={report.monthlyReturn >= 0 ? 'text-success-600' : 'text-danger-600'}>
                      {formatPercentage(report.monthlyReturn)}
                    </td>
                    <td>{formatPercentage(report.fillRate)}</td>
                    <td>
                      <span className={`badge ${report.grade === 'A' ? 'badge-success' : report.grade === 'B' ? 'badge-warning' : 'badge-danger'}`}>
                        {report.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No monthly reports yet. Reports will be generated as you invest.</p>
          </div>
        )}
      </div>

      {/* Quarterly Reports */}
      {data.quarterlyReports.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quarterly Reports</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Total Return</th>
                  <th>Sharpe Ratio</th>
                  <th>Max Drawdown</th>
                  <th>Volatility</th>
                </tr>
              </thead>
              <tbody>
                {data.quarterlyReports.map(report => (
                  <tr key={report.quarter}>
                    <td>{report.quarter}</td>
                    <td className={report.totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'}>
                      {formatPercentage(report.totalReturn)}
                    </td>
                    <td>{report.sharpeRatio.toFixed(2)}</td>
                    <td className="text-danger-600">{formatPercentage(report.maxDrawdown)}</td>
                    <td>{formatPercentage(report.volatility)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
