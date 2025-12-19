import { BookOpen, Calculator, TrendingUp } from 'lucide-react';

export default function HelpSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Help & Educational Resources</h2>
        <p className="text-gray-600">Learn about the investment strategy and how to use PeiLing effectively.</p>
      </div>

      {/* Strategy Overview */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Investment Strategy Overview</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Total Capital:</strong> ¥100,000 over 6 months accumulation period
              </p>
              <p>
                <strong>Asset Allocation:</strong> Gold 50%, Silver 35%, Platinum 15%
              </p>
              <p>
                <strong>Capital Split:</strong> Active 85% (¥85,000), Opportunity 15% (¥15,000)
              </p>
              <p>
                <strong>Holding Period:</strong> Minimum 3 years for optimal returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Key Concepts & Glossary</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-primary-600 mb-1">Value Averaging</h4>
            <p className="text-sm text-gray-700">
              A disciplined investment strategy where you invest more when prices are low and less when prices are high.
              Monthly investment = Target portfolio value - Current market value
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">RSI (Relative Strength Index)</h4>
            <p className="text-sm text-gray-700">
              A momentum indicator measuring overbought/oversold conditions (0-100 scale):
            </p>
            <ul className="text-sm text-gray-700 ml-4 mt-1 space-y-1">
              <li>• <strong>RSI &gt; 70:</strong> Overbought - pause buying</li>
              <li>• <strong>RSI 50-70:</strong> Reduce to 50% allocation</li>
              <li>• <strong>RSI 30-50:</strong> Normal - 100% allocation</li>
              <li>• <strong>RSI &lt; 30:</strong> Oversold - aggressive buying at 150%</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">Gold-Silver Ratio (GSR)</h4>
            <p className="text-sm text-gray-700">
              The price of gold divided by the price of silver. Historical average is 65-75:
            </p>
            <ul className="text-sm text-gray-700 ml-4 mt-1 space-y-1">
              <li>• <strong>GSR &gt; 85:</strong> Silver is undervalued - buy more silver</li>
              <li>• <strong>GSR &lt; 55:</strong> Gold is undervalued - buy more gold</li>
              <li>• <strong>GSR 65-75:</strong> Normal range - follow standard allocation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">Tiered Limit Orders</h4>
            <p className="text-sm text-gray-700">
              Divide monthly allocation into 4 orders at different price levels to catch price dips:
            </p>
            <ul className="text-sm text-gray-700 ml-4 mt-1 space-y-1">
              <li>• <strong>Tier 1:</strong> 40% of allocation at smallest discount</li>
              <li>• <strong>Tier 2:</strong> 30% at medium discount</li>
              <li>• <strong>Tier 3:</strong> 20% at larger discount</li>
              <li>• <strong>Tier 4:</strong> 10% at deepest discount</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">Dynamic Stop-Loss</h4>
            <p className="text-sm text-gray-700">
              Automatically adjusts based on market volatility: Average Cost - (30-day volatility × 2.5 × 20 days)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">Sharpe Ratio</h4>
            <p className="text-sm text-gray-700">
              Risk-adjusted return metric. Higher is better. Above 1.0 is good, above 2.0 is excellent.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">Maximum Drawdown</h4>
            <p className="text-sm text-gray-700">
              Largest peak-to-trough decline in portfolio value. Indicates worst-case loss scenario.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <Calculator className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-3">How to Use PeiLing</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li>
                <strong>1. Configure Settings:</strong> Go to Settings and set your total capital, start date, and allocation preferences.
              </li>
              <li>
                <strong>2. Add Price Data:</strong> Regularly update gold, silver, and platinum prices with RSI values in the Price Data section.
              </li>
              <li>
                <strong>3. Calculate Monthly Investment:</strong> Use the Investment Calculator to determine how much to invest based on value averaging.
              </li>
              <li>
                <strong>4. Generate Orders:</strong> Create tiered limit orders based on the calculated allocation.
              </li>
              <li>
                <strong>5. Record Transactions:</strong> Log all purchases and sales in the Transaction Log.
              </li>
              <li>
                <strong>6. Monitor Portfolio:</strong> Track holdings, stop-loss levels, and rebalancing needs regularly.
              </li>
              <li>
                <strong>7. Review Performance:</strong> Analyze monthly and quarterly reports to assess strategy effectiveness.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Update price data daily or at least weekly for accurate calculations</li>
              <li>✓ Stick to the value averaging schedule - invest monthly without fail</li>
              <li>✓ Use tiered limit orders to improve average entry price</li>
              <li>✓ Monitor RSI to avoid buying when metals are overbought</li>
              <li>✓ Rebalance when allocation deviates more than 15% from target</li>
              <li>✓ Respect stop-loss levels to limit downside risk</li>
              <li>✓ Export data backups regularly to prevent data loss</li>
              <li>✓ Review performance monthly and adjust strategy as needed</li>
              <li>✓ Maintain discipline - avoid emotional buying or selling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Q: How is the monthly investment amount calculated?</h4>
            <p className="text-sm text-gray-700">
              A: Using value averaging: (Months passed / 6) × Total Capital - Current Portfolio Value = Required Investment
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Q: What if my RSI values show I should pause buying?</h4>
            <p className="text-sm text-gray-700">
              A: Hold the cash for that month's allocation and deploy it when RSI drops to more favorable levels.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Q: When should I rebalance my portfolio?</h4>
            <p className="text-sm text-gray-700">
              A: Rebalance when any metal's allocation deviates more than 15 percentage points from the target, or when GSR indicates extreme valuations.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Q: Is my data secure?</h4>
            <p className="text-sm text-gray-700">
              A: All data is stored locally in your browser's localStorage. Nothing is transmitted to any server. Export backups regularly for safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
