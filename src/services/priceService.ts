/**
 * Price Service - Fetches real-time precious metals prices from APIs
 * Supports MetalpriceAPI and Metals-API with CNY pricing
 */

export interface PriceData {
  goldPrice: number;
  silverPrice: number;
  goldSilverRatio: number;
  timestamp: string;
  source: string;
  success: boolean;
  error?: string;
}

// Constants for conversion
const TROY_OUNCE_TO_GRAMS = 31.1035; // 1 troy ounce = 31.1035 grams

/**
 * Fetches prices from MetalpriceAPI
 * Free tier available at https://metalpriceapi.com/
 */
async function fetchFromMetalpriceAPI(apiKey: string): Promise<PriceData> {
  const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=XAU&currencies=XAG,CNY`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch prices from MetalpriceAPI');
  }

  // MetalpriceAPI returns rates with base=XAU (gold)
  // XAG rate tells us how many ounces of silver equal 1 ounce of gold
  // CNY rate tells us how many CNY equal 1 ounce of gold

  const goldPricePerOunce = data.rates.CNY; // CNY per troy ounce of gold
  const goldSilverRatio = data.rates.XAG; // oz of silver per oz of gold
  const silverPricePerOunce = goldPricePerOunce / goldSilverRatio;

  // Convert to CNY per gram
  const goldPrice = goldPricePerOunce / TROY_OUNCE_TO_GRAMS;
  const silverPrice = silverPricePerOunce / TROY_OUNCE_TO_GRAMS;

  return {
    goldPrice: Number(goldPrice.toFixed(2)),
    silverPrice: Number(silverPrice.toFixed(2)),
    goldSilverRatio: Number(goldSilverRatio.toFixed(2)),
    timestamp: new Date(data.timestamp * 1000).toISOString(),
    source: 'MetalpriceAPI',
    success: true,
  };
}

/**
 * Fetches prices from Metals-API
 * Free tier available at https://metals-api.com/
 */
async function fetchFromMetalsAPI(apiKey: string): Promise<PriceData> {
  const url = `https://api.metals.live/v1/latest?access_key=${apiKey}&base=CNY&symbols=XAU,XAG`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.info || 'Failed to fetch prices from Metals-API');
  }

  // Metals-API returns rates with base=CNY
  // XAU and XAG rates tell us how many troy ounces per 1 CNY
  // We need to invert and convert to CNY per gram

  const goldPricePerOunce = 1 / data.rates.XAU; // CNY per troy ounce
  const silverPricePerOunce = 1 / data.rates.XAG; // CNY per troy ounce

  const goldPrice = goldPricePerOunce / TROY_OUNCE_TO_GRAMS;
  const silverPrice = silverPricePerOunce / TROY_OUNCE_TO_GRAMS;
  const goldSilverRatio = goldPricePerOunce / silverPricePerOunce;

  return {
    goldPrice: Number(goldPrice.toFixed(2)),
    silverPrice: Number(silverPrice.toFixed(2)),
    goldSilverRatio: Number(goldSilverRatio.toFixed(2)),
    timestamp: new Date(data.timestamp * 1000).toISOString(),
    source: 'Metals-API',
    success: true,
  };
}

/**
 * Alternative: Fetch from a public API that doesn't require key
 * Using goldapi.io free tier or similar
 */
async function fetchFromPublicAPI(): Promise<PriceData> {
  // Using a mock endpoint for demonstration
  // In production, replace with actual public API
  const url = 'https://api.gold-api.com/price/XAU_CNY,XAG_CNY';

  try {
    const response = await fetch(url);
    const data = await response.json();

    const goldPricePerOunce = data.XAU_CNY;
    const silverPricePerOunce = data.XAG_CNY;

    const goldPrice = goldPricePerOunce / TROY_OUNCE_TO_GRAMS;
    const silverPrice = silverPricePerOunce / TROY_OUNCE_TO_GRAMS;
    const goldSilverRatio = goldPricePerOunce / silverPricePerOunce;

    return {
      goldPrice: Number(goldPrice.toFixed(2)),
      silverPrice: Number(silverPrice.toFixed(2)),
      goldSilverRatio: Number(goldSilverRatio.toFixed(2)),
      timestamp: new Date().toISOString(),
      source: 'Public API',
      success: true,
    };
  } catch (error) {
    throw new Error('Public API not available');
  }
}

/**
 * Main function to fetch current precious metals prices
 * Tries multiple APIs in order of preference
 */
export async function fetchCurrentPrices(): Promise<PriceData> {
  // Check for API keys in environment or localStorage
  const metalpriceApiKey = import.meta.env.VITE_METALPRICE_API_KEY ||
                           localStorage.getItem('metalprice_api_key');
  const metalsApiKey = import.meta.env.VITE_METALS_API_KEY ||
                       localStorage.getItem('metals_api_key');

  // Try MetalpriceAPI first
  if (metalpriceApiKey) {
    try {
      return await fetchFromMetalpriceAPI(metalpriceApiKey);
    } catch (error) {
      console.warn('MetalpriceAPI failed:', error);
    }
  }

  // Try Metals-API second
  if (metalsApiKey) {
    try {
      return await fetchFromMetalsAPI(metalsApiKey);
    } catch (error) {
      console.warn('Metals-API failed:', error);
    }
  }

  // Try public API as fallback
  try {
    return await fetchFromPublicAPI();
  } catch (error) {
    console.warn('Public API failed:', error);
  }

  // All APIs failed
  return {
    goldPrice: 0,
    silverPrice: 0,
    goldSilverRatio: 0,
    timestamp: new Date().toISOString(),
    source: 'None',
    success: false,
    error: 'Unable to fetch prices from any API. Please configure an API key or enter prices manually.',
  };
}

/**
 * Save API keys to localStorage
 */
export function saveApiKeys(metalpriceKey?: string, metalsKey?: string, deepseekKey?: string) {
  if (metalpriceKey !== undefined) {
    localStorage.setItem('metalprice_api_key', metalpriceKey);
  }
  if (metalsKey !== undefined) {
    localStorage.setItem('metals_api_key', metalsKey);
  }
  if (deepseekKey !== undefined) {
    localStorage.setItem('deepseek_api_key', deepseekKey);
  }
}

/**
 * Get saved API keys
 */
export function getApiKeys() {
  return {
    metalpriceApiKey: localStorage.getItem('metalprice_api_key') || '',
    metalsApiKey: localStorage.getItem('metals_api_key') || '',
    deepseekApiKey: localStorage.getItem('deepseek_api_key') || '',
  };
}

/**
 * Clear saved API keys
 */
export function clearApiKeys() {
  localStorage.removeItem('metalprice_api_key');
  localStorage.removeItem('metals_api_key');
  localStorage.removeItem('deepseek_api_key');
}
