import { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useLanguage } from '../contexts/LanguageContext';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { PriceData } from '../types';
import { generateId, getCurrentDate, formatDate } from '../utils/helpers';
import { calculateGSR, formatCurrency } from '../utils/calculations';
import { TrendingUp, Plus, Edit2, Trash2, Brain, Sparkles } from 'lucide-react';
import AutoPriceFetcher from './AutoPriceFetcher';
import { getApiKeys } from '../services/priceService';

interface PriceDataEntryProps extends ReturnType<typeof useAppData> {}

export default function PriceDataEntry({
  data,
  addPriceData,
  updatePriceData,
  deletePriceData,
}: PriceDataEntryProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    goldPrice: '',
    silverPrice: '',
    platinumPrice: '',
    goldRSI: '',
    silverRSI: '',
    platinumRSI: '',
    vix: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // AI Analysis
  const aiAnalysis = useAIAnalysis(data);
  const [hasDeepSeekKey, setHasDeepSeekKey] = useState(false);
  const [calculatingRSI, setCalculatingRSI] = useState(false);

  // Check if DeepSeek API key is configured
  useEffect(() => {
    const keys = getApiKeys();
    setHasDeepSeekKey(!!keys.deepseekApiKey);
  }, []);

  // Auto-calculate RSI using AI when prices are entered
  const handleCalculateRSI = async () => {
    if (!formData.goldPrice || !formData.silverPrice || !formData.platinumPrice) {
      alert('Please enter all metal prices first');
      return;
    }

    if (data.priceData.length < 14) {
      alert('Need at least 14 days of historical price data to calculate RSI. Please enter RSI values manually for now.');
      return;
    }

    setCalculatingRSI(true);

    try {
      // Get recent price history and append current prices
      const goldPrices = [...data.priceData.map(p => p.goldPrice), parseFloat(formData.goldPrice)];
      const silverPrices = [...data.priceData.map(p => p.silverPrice), parseFloat(formData.silverPrice)];
      const platinumPrices = [...data.priceData.map(p => p.platinumPrice || 0), parseFloat(formData.platinumPrice)];

      const [goldRSI, silverRSI, platinumRSI] = await Promise.all([
        aiAnalysis.calculateRSI(goldPrices),
        aiAnalysis.calculateRSI(silverPrices),
        aiAnalysis.calculateRSI(platinumPrices),
      ]);

      setFormData(prev => ({
        ...prev,
        goldRSI: goldRSI?.toFixed(2) || '',
        silverRSI: silverRSI?.toFixed(2) || '',
        platinumRSI: platinumRSI?.toFixed(2) || '',
      }));
    } catch (error) {
      console.error('Failed to calculate RSI:', error);
      alert('Failed to calculate RSI. Please check your API key and try again.');
    } finally {
      setCalculatingRSI(false);
    }
  };

  const handlePricesFetched = (goldPrice: number, silverPrice: number) => {
    // Only update if form is empty (not editing)
    if (!editingId && !formData.goldPrice && !formData.silverPrice) {
      setFormData(prev => ({
        ...prev,
        goldPrice: goldPrice.toString(),
        silverPrice: silverPrice.toString(),
        date: getCurrentDate(),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceData: PriceData = {
      id: editingId || generateId(),
      date: formData.date,
      goldPrice: parseFloat(formData.goldPrice),
      silverPrice: parseFloat(formData.silverPrice),
      platinumPrice: parseFloat(formData.platinumPrice),
      goldRSI: parseFloat(formData.goldRSI),
      silverRSI: parseFloat(formData.silverRSI),
      platinumRSI: parseFloat(formData.platinumRSI),
      vix: formData.vix ? parseFloat(formData.vix) : undefined,
    };

    if (editingId) {
      updatePriceData(editingId, priceData);
      setEditingId(null);
    } else {
      addPriceData(priceData);
    }

    // Reset form
    setFormData({
      date: getCurrentDate(),
      goldPrice: '',
      silverPrice: '',
      platinumPrice: '',
      goldRSI: '',
      silverRSI: '',
      platinumRSI: '',
      vix: '',
    });
  };

  const handleEdit = (price: PriceData) => {
    setFormData({
      date: price.date,
      goldPrice: price.goldPrice.toString(),
      silverPrice: price.silverPrice.toString(),
      platinumPrice: price.platinumPrice.toString(),
      goldRSI: price.goldRSI.toString(),
      silverRSI: price.silverRSI.toString(),
      platinumRSI: price.platinumRSI.toString(),
      vix: price.vix?.toString() || '',
    });
    setEditingId(price.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t.priceData.title}</h2>
        <p className="text-gray-600">{t.priceData.subtitle}</p>
      </div>

      {/* Automatic Price Fetcher */}
      <AutoPriceFetcher onPricesFetched={handlePricesFetched} />

      {/* Data Sources Info */}
      <div className="card bg-blue-50 border-l-4 border-blue-500">
        <h4 className="font-semibold text-blue-900 mb-2">📊 {t.priceData.recommendedSources}</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>{t.priceData.officialExchanges}:</strong> Shanghai Gold Exchange (SGE), Bank of China, ICBC Precious Metals</p>
          <p><strong>{t.priceData.etfPlatforms}:</strong> Huaan Gold ETF (518880), E Fund Gold ETF (159934)</p>
          <p className="text-xs text-blue-700 mt-2">
            💡 {t.priceData.sourceNote}
          </p>
        </div>
      </div>

      {/* Entry Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? t.priceData.editPrice : t.priceData.addNewPrice}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">{t.common.date}</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.priceData.goldPrice}</label>
              <input
                type="number"
                step="0.01"
                value={formData.goldPrice}
                onChange={e => setFormData({ ...formData, goldPrice: e.target.value })}
                required
                placeholder="500.00"
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.priceData.silverPrice}</label>
              <input
                type="number"
                step="0.01"
                value={formData.silverPrice}
                onChange={e => setFormData({ ...formData, silverPrice: e.target.value })}
                required
                placeholder="6.50"
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.priceData.platinumPrice}</label>
              <input
                type="number"
                step="0.01"
                value={formData.platinumPrice}
                onChange={e => setFormData({ ...formData, platinumPrice: e.target.value })}
                required
                placeholder="220.00"
                className="input"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">RSI Values (0-100)</label>
              {hasDeepSeekKey && (
                <button
                  type="button"
                  onClick={handleCalculateRSI}
                  disabled={calculatingRSI || !formData.goldPrice || !formData.silverPrice || !formData.platinumPrice}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {calculatingRSI ? (
                    <>
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-3 h-3" />
                      <span>AI Calculate RSI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="label text-xs">{t.priceData.goldRSI}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.goldRSI}
                  onChange={e => setFormData({ ...formData, goldRSI: e.target.value })}
                  required
                  placeholder="50.00"
                  className="input"
                />
              </div>
              <div>
                <label className="label text-xs">{t.priceData.silverRSI}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.silverRSI}
                  onChange={e => setFormData({ ...formData, silverRSI: e.target.value })}
                  required
                  placeholder="50.00"
                  className="input"
                />
              </div>
              <div>
                <label className="label text-xs">{t.priceData.platinumRSI}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.platinumRSI}
                  onChange={e => setFormData({ ...formData, platinumRSI: e.target.value })}
                  required
                  placeholder="50.00"
                  className="input"
                />
              </div>
              <div>
                <label className="label text-xs">{t.priceData.vix} (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.vix}
                  onChange={e => setFormData({ ...formData, vix: e.target.value })}
                  placeholder="20.00"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              <Plus className="w-4 h-4 inline mr-2" />
              {editingId ? t.common.update : t.common.add} {t.nav.prices}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    date: getCurrentDate(),
                    goldPrice: '',
                    silverPrice: '',
                    platinumPrice: '',
                    goldRSI: '',
                    silverRSI: '',
                    platinumRSI: '',
                    vix: '',
                  });
                }}
                className="btn btn-secondary"
              >
                {t.common.cancel}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Price History Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{t.priceData.priceHistory} ({data.priceData.length} {t.priceData.entries})</h3>
        {data.priceData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.common.date}</th>
                  <th>{t.metals.gold} (¥/g)</th>
                  <th>{t.metals.silver} (¥/g)</th>
                  <th>{t.metals.platinum} (¥/g)</th>
                  <th>{t.priceData.goldRSI}</th>
                  <th>{t.priceData.silverRSI}</th>
                  <th>{t.priceData.platinumRSI}</th>
                  <th>{t.priceData.gsr}</th>
                  <th>{t.common.actions}</th>
                </tr>
              </thead>
              <tbody>
                {data.priceData.slice().reverse().slice(0, 30).map(price => {
                  const gsr = calculateGSR(price.goldPrice, price.silverPrice);
                  return (
                    <tr key={price.id}>
                      <td>{formatDate(price.date)}</td>
                      <td>{formatCurrency(price.goldPrice)}</td>
                      <td>{formatCurrency(price.silverPrice)}</td>
                      <td>{formatCurrency(price.platinumPrice)}</td>
                      <td>
                        <span className={`badge ${price.goldRSI > 70 ? 'badge-danger' : price.goldRSI < 30 ? 'badge-success' : 'badge-info'}`}>
                          {price.goldRSI.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${price.silverRSI > 70 ? 'badge-danger' : price.silverRSI < 30 ? 'badge-success' : 'badge-info'}`}>
                          {price.silverRSI.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${price.platinumRSI > 70 ? 'badge-danger' : price.platinumRSI < 30 ? 'badge-success' : 'badge-info'}`}>
                          {price.platinumRSI.toFixed(1)}
                        </span>
                      </td>
                      <td>{gsr.toFixed(2)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(price)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(t.priceData.deleteConfirm)) {
                                deletePriceData(price.id);
                              }
                            }}
                            className="text-danger-600 hover:text-danger-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{t.priceData.noDataYet}</p>
          </div>
        )}
      </div>
    </div>
  );
}
