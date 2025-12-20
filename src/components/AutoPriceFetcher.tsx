import { useState, useEffect } from 'react';
import { RefreshCw, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { fetchCurrentPrices, saveApiKeys, getApiKeys, type PriceData } from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';

interface AutoPriceFetcherProps {
  onPricesFetched: (goldPrice: number, silverPrice: number) => void;
}

export default function AutoPriceFetcher({ onPricesFetched }: AutoPriceFetcherProps) {
  const { t } = useLanguage();
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // minutes

  const [metalpriceKey, setMetalpriceKey] = useState('');
  const [metalsKey, setMetalsKey] = useState('');

  // Load saved API keys on mount
  useEffect(() => {
    const keys = getApiKeys();
    setMetalpriceKey(keys.metalpriceApiKey);
    setMetalsKey(keys.metalsApiKey);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleFetchPrices();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleFetchPrices = async () => {
    setLoading(true);
    try {
      const data = await fetchCurrentPrices();
      setPriceData(data);

      if (data.success) {
        // Update parent component with new prices
        onPricesFetched(data.goldPrice, data.silverPrice);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      setPriceData({
        goldPrice: 0,
        silverPrice: 0,
        goldSilverRatio: 0,
        timestamp: new Date().toISOString(),
        source: 'Error',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKeys = () => {
    saveApiKeys(metalpriceKey, metalsKey);
    setShowSettings(false);
    // Fetch prices immediately after saving keys
    handleFetchPrices();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <h2 className="text-xl font-semibold">
            {t.priceData?.autoFetch || 'Automatic Price Fetching'}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title={t.common?.settings || 'Settings'}
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={handleFetchPrices}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? (t.common?.loading || 'Loading...') : (t.common?.refresh || 'Refresh')}
          </button>
        </div>
      </div>

      {/* API Key Settings */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-3">
            {t.priceData?.apiSettings || 'API Settings'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                MetalpriceAPI Key
                <a
                  href="https://metalpriceapi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 text-xs"
                >
                  ({t.common?.getFree || 'Get free key'})
                </a>
              </label>
              <input
                type="password"
                value={metalpriceKey}
                onChange={(e) => setMetalpriceKey(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter MetalpriceAPI key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Metals-API Key
                <a
                  href="https://metals-api.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 text-xs"
                >
                  ({t.common?.getFree || 'Get free key'})
                </a>
              </label>
              <input
                type="password"
                value={metalsKey}
                onChange={(e) => setMetalsKey(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter Metals-API key"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">
                  {t.priceData?.autoRefresh || 'Auto-refresh prices'}
                </span>
              </label>

              {autoRefresh && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.common?.every || 'Every'}</span>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value={5}>5 {t.common?.minutes || 'minutes'}</option>
                    <option value={15}>15 {t.common?.minutes || 'minutes'}</option>
                    <option value={30}>30 {t.common?.minutes || 'minutes'}</option>
                    <option value={60}>60 {t.common?.minutes || 'minutes'}</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveApiKeys}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t.common?.save || 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Price Data Display */}
      {priceData && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 text-sm ${priceData.success ? 'text-green-600' : 'text-red-600'}`}>
            {priceData.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>
              {priceData.success
                ? `${t.priceData?.fetchedFrom || 'Fetched from'} ${priceData.source}`
                : (priceData.error || 'Failed to fetch prices')}
            </span>
          </div>

          {priceData.success && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="text-sm text-gray-600">{t.metals?.gold || 'Gold'}</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    ¥{priceData.goldPrice}
                  </div>
                  <div className="text-xs text-gray-500">{t.common?.perGram || 'per gram'}</div>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm text-gray-600">{t.metals?.silver || 'Silver'}</div>
                  <div className="text-2xl font-bold text-gray-600">
                    ¥{priceData.silverPrice}
                  </div>
                  <div className="text-xs text-gray-500">{t.common?.perGram || 'per gram'}</div>
                </div>

                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">GSR</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {priceData.goldSilverRatio}
                  </div>
                  <div className="text-xs text-gray-500">{t.common?.ratio || 'ratio'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  {t.common?.lastUpdated || 'Last updated'}: {formatTimestamp(priceData.timestamp)}
                </span>
              </div>
            </>
          )}

          {!priceData.success && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                {t.priceData?.noApiKey || 'No API key configured. Please add an API key in settings or enter prices manually below.'}
              </p>
              <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                <li>
                  <a href="https://metalpriceapi.com/" target="_blank" rel="noopener noreferrer" className="underline">
                    MetalpriceAPI
                  </a> - {t.priceData?.freeRealtime || 'Free tier with real-time data'}
                </li>
                <li>
                  <a href="https://metals-api.com/" target="_blank" rel="noopener noreferrer" className="underline">
                    Metals-API
                  </a> - {t.priceData?.freeTier || 'Free tier with daily updates'}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
