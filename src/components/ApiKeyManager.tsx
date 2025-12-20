import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, ExternalLink, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { getApiKeys, saveApiKeys, clearApiKeys } from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';

export default function ApiKeyManager() {
  const { t } = useLanguage();
  const [metalpriceKey, setMetalpriceKey] = useState('');
  const [metalsKey, setMetalsKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [showMetalpriceKey, setShowMetalpriceKey] = useState(false);
  const [showMetalsKey, setShowMetalsKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing keys on mount
  useEffect(() => {
    const keys = getApiKeys();
    setMetalpriceKey(keys.metalpriceApiKey);
    setMetalsKey(keys.metalsApiKey);
    setDeepseekKey(keys.deepseekApiKey);
  }, []);

  const handleSave = () => {
    saveApiKeys(metalpriceKey, metalsKey, deepseekKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    if (confirm(t.apiKeys?.clearConfirm || 'Are you sure you want to clear all API keys?')) {
      clearApiKeys();
      setMetalpriceKey('');
      setMetalsKey('');
      setDeepseekKey('');
    }
  };

  const hasKeys = metalpriceKey || metalsKey || deepseekKey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
              <Key className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t.apiKeys?.title || 'API Key Management'}
            </h2>
          </div>
          <p className="text-gray-600 ml-12">
            {t.apiKeys?.subtitle || 'Configure your API keys to enable automatic price fetching'}
          </p>
        </div>
        {hasKeys && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">{t.common?.delete || 'Clear All'}</span>
          </button>
        )}
      </div>

      {/* Status Banner */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">
            {t.apiKeys?.saveSuccess || 'API keys saved successfully!'}
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">
            {t.apiKeys?.whyNeeded || 'Why do I need API keys?'}
          </p>
          <p>
            {t.apiKeys?.explanation || 'API keys allow the application to automatically fetch real-time precious metals prices in CNY. Without them, you\'ll need to enter prices manually.'}
          </p>
        </div>
      </div>

      {/* API Key Forms */}
      <div className="grid gap-6">
        {/* MetalpriceAPI */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">MetalpriceAPI</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  {t.apiKeys?.recommended || 'Recommended'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {t.apiKeys?.metalpriceDesc || 'Free tier with real-time updates and CNY support'}
              </p>
            </div>
            <a
              href="https://metalpriceapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>{t.apiKeys?.getKey || 'Get Key'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">
                {t.apiKeys?.apiKey || 'API Key'}
              </span>
              <div className="relative">
                <input
                  type={showMetalpriceKey ? 'text' : 'password'}
                  value={metalpriceKey}
                  onChange={(e) => setMetalpriceKey(e.target.value)}
                  placeholder="Enter your MetalpriceAPI key"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowMetalpriceKey(!showMetalpriceKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
                >
                  {showMetalpriceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {metalpriceKey && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>{t.apiKeys?.keyConfigured || 'Key configured'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metals-API */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-900">Metals-API</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                  {t.apiKeys?.backup || 'Backup'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {t.apiKeys?.metalsDesc || 'Free tier with daily updates, used as fallback'}
              </p>
            </div>
            <a
              href="https://metals-api.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span>{t.apiKeys?.getKey || 'Get Key'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">
                {t.apiKeys?.apiKey || 'API Key'}
              </span>
              <div className="relative">
                <input
                  type={showMetalsKey ? 'text' : 'password'}
                  value={metalsKey}
                  onChange={(e) => setMetalsKey(e.target.value)}
                  placeholder="Enter your Metals-API key"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowMetalsKey(!showMetalsKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
                >
                  {showMetalsKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            {metalsKey && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>{t.apiKeys?.keyConfigured || 'Key configured'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DeepSeek AI */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">DeepSeek AI</h3>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                AI Automation
              </span>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered analysis, RSI calculation, market insights & investment recommendations
            </p>
          </div>
          <a
            href="https://platform.deepseek.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <span>{t.apiKeys?.getKey || 'Get Key'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 mb-2 block">
              {t.apiKeys?.apiKey || 'API Key'}
            </span>
            <div className="relative">
              <input
                type={showDeepseekKey ? 'text' : 'password'}
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
                className="w-full px-4 py-3 pr-12 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
              >
                {showDeepseekKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {deepseekKey && (
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <CheckCircle className="w-4 h-4" />
              <span>{t.apiKeys?.keyConfigured || 'Key configured'} - AI features enabled</span>
            </div>
          )}

          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <p className="text-xs font-semibold text-purple-900 mb-1">🤖 AI Features:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Automatic RSI calculation from price history</li>
              <li>• Market sentiment analysis & predictions</li>
              <li>• Personalized investment recommendations</li>
              <li>• Portfolio risk assessment</li>
              <li>• Transaction pattern analysis</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-gray-500">
          {t.apiKeys?.securityNote || 'Your API keys are stored securely in your browser\'s local storage'}
        </p>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all transform hover:scale-105"
        >
          <Save className="w-5 h-5" />
          <span>{t.common?.save || 'Save API Keys'}</span>
        </button>
      </div>

      {/* How to Get API Keys */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>📖</span>
          <span>{t.apiKeys?.howToTitle || 'How to Get Your API Keys'}</span>
        </h3>
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold text-gray-900 mb-2">MetalpriceAPI:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>{t.apiKeys?.step1 || 'Visit'} <a href="https://metalpriceapi.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">metalpriceapi.com</a></li>
              <li>{t.apiKeys?.step2 || 'Click "Get Free API Key" and sign up'}</li>
              <li>{t.apiKeys?.step3 || 'Copy your API key from the dashboard'}</li>
              <li>{t.apiKeys?.step4 || 'Paste it in the field above and click Save'}</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-2">Metals-API:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>{t.apiKeys?.step1 || 'Visit'} <a href="https://metals-api.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">metals-api.com</a></li>
              <li>{t.apiKeys?.step2 || 'Click "Get Free API Key" and sign up'}</li>
              <li>{t.apiKeys?.step3 || 'Copy your API key from the dashboard'}</li>
              <li>{t.apiKeys?.step4 || 'Paste it in the field above and click Save'}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
