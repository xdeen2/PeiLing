import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Calculator, TrendingUp } from 'lucide-react';

export default function HelpSection() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{ t.help.title}</h2>
        <p className="text-gray-600">{t.help.subtitle}</p>
      </div>

      {/* Strategy Overview */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2">{t.help.strategyOverview}</h3>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>{t.help.totalCapital}:</strong> {t.help.totalCapitalValue}
              </p>
              <p>
                <strong>{t.help.assetAllocation}:</strong> {t.help.assetAllocationValue}
              </p>
              <p>
                <strong>{t.help.capitalSplit}:</strong> {t.help.capitalSplitValue}
              </p>
              <p>
                <strong>{t.help.holdingPeriod}:</strong> {t.help.holdingPeriodValue}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t.help.keyConcepts}</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.valueAveraging}</h4>
            <p className="text-sm text-gray-700">
              {t.help.valueAveragingDesc}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.rsi}</h4>
            <p className="text-sm text-gray-700">
              {t.help.rsiDesc}
            </p>
            <ul className="text-sm text-gray-700 ml-4 mt-1 space-y-1">
              <li>• {t.help.rsiOverbought}</li>
              <li>• {t.help.rsiReduce}</li>
              <li>• {t.help.rsiNormal}</li>
              <li>• {t.help.rsiOversold}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.gsr}</h4>
            <p className="text-sm text-gray-700">
              {t.help.gsrDesc}
            </p>
            <ul className="text-sm text-gray-700 ml-4 mt-1 space-y-1">
              <li>• {t.help.gsrSilverCheap}</li>
              <li>• {t.help.gsrGoldCheap}</li>
              <li>• {t.help.gsrNormal}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.tieredLimitOrders}</h4>
            <p className="text-sm text-gray-700">
              {t.help.tieredLimitOrdersDesc}
            </p>
            <ul className="text-sm text-gray-700 ml-4 mt-1 space-y-1">
              <li>• {t.help.tier1}</li>
              <li>• {t.help.tier2}</li>
              <li>• {t.help.tier3}</li>
              <li>• {t.help.tier4}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.dynamicStopLoss}</h4>
            <p className="text-sm text-gray-700">
              {t.help.dynamicStopLossDesc}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.sharpeRatio}</h4>
            <p className="text-sm text-gray-700">
              {t.help.sharpeRatioDesc}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-600 mb-1">{t.help.maxDrawdown}</h4>
            <p className="text-sm text-gray-700">
              {t.help.maxDrawdownDesc}
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <Calculator className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-3">{t.help.howToUse}</h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li>{t.help.step1}</li>
              <li>{t.help.step2}</li>
              <li>{t.help.step3}</li>
              <li>{t.help.step4}</li>
              <li>{t.help.step5}</li>
              <li>{t.help.step6}</li>
              <li>{t.help.step7}</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Recommended Price Data Sources */}
      <div className="card bg-primary-50 border-l-4 border-primary-500">
        <h3 className="text-lg font-semibold mb-3">{t.help.recommendedSources}</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-primary-700 mb-2">{t.help.officialExchanges}</h4>
            <ul className="ml-4 space-y-1">
              <li>• {t.help.sge}</li>
              <li>• {t.help.boc}</li>
              <li>• {t.help.icbc}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-700 mb-2">{t.help.etfOptions}</h4>
            <ul className="ml-4 space-y-1">
              <li>• {t.help.huaan}</li>
              <li>• {t.help.efund}</li>
            </ul>
          </div>
          <div className="mt-3 p-3 bg-white rounded">
            <p className="text-xs text-gray-600">
              {t.help.sourceTip}
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-3">{t.help.bestPractices}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>{t.help.practice1}</li>
              <li>{t.help.practice2}</li>
              <li>{t.help.practice3}</li>
              <li>{t.help.practice4}</li>
              <li>{t.help.practice5}</li>
              <li>{t.help.practice6}</li>
              <li>{t.help.practice7}</li>
              <li>{t.help.practice8}</li>
              <li>{t.help.practice9}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t.help.faq}</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{t.help.faqQ1}</h4>
            <p className="text-sm text-gray-700">
              {t.help.faqA1}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{t.help.faqQ2}</h4>
            <p className="text-sm text-gray-700">
              {t.help.faqA2}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{t.help.faqQ3}</h4>
            <p className="text-sm text-gray-700">
              {t.help.faqA3}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{t.help.faqQ4}</h4>
            <p className="text-sm text-gray-700">
              {t.help.faqA4}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
