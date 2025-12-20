import { AppData, StrategyConfig } from '../types';
import { authService } from '../auth/authService';

function getStorageKey(): string {
  const user = authService.getCurrentUser();
  return user ? `peiling-metals-data-${user.username}` : 'peiling-metals-data-guest';
}

const defaultConfig: StrategyConfig = {
  totalCapital: 100000,
  accumulationStartDate: new Date().toISOString().split('T')[0],
  accumulationEndDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  holdingPeriodEndDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  activeCapitalPercent: 85,
  opportunityCapitalPercent: 15,
  targetAllocation: {
    gold: 50,
    silver: 35,
    platinum: 15,
  },
  limitOrderSpreads: {
    gold: [-1, -2.5, -4, -6],
    silver: [-2, -4, -6.5, -9],
    platinum: [-1.5, -3.5, -5.5, -8],
  },
  rsiThresholds: {
    pause: 70,
    reduce: 50,
    normal: 30,
  },
  gsrParameters: {
    normalMin: 65,
    normalMax: 75,
    silverCheap: 85,
    goldCheap: 55,
  },
  stopLossParameters: {
    volatilityMultiplier: 2.5,
    hardStopPercent: -25,
    trailingStopPercent: -15,
  },
};

const defaultData: AppData = {
  config: defaultConfig,
  priceData: [],
  transactions: [],
  limitOrders: [],
  portfolioSnapshots: [],
  monthlyReports: [],
  quarterlyReports: [],
  annualReports: [],
  alerts: [],
};

export const storage = {
  load(): AppData {
    try {
      const key = getStorageKey();
      const data = localStorage.getItem(key);
      if (!data) return { ...defaultData };
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      return { ...defaultData };
    }
  },

  save(data: AppData): void {
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  },

  export(): string {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  },

  import(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as AppData;
      this.save(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  reset(): void {
    this.save(defaultData);
  },

  exportCSV(type: 'transactions' | 'priceData' | 'limitOrders'): string {
    const data = this.load();

    if (type === 'transactions') {
      const headers = ['Date', 'Metal', 'Type', 'Quantity (g)', 'Price (¥/g)', 'Amount (¥)', 'Platform', 'RSI', 'GSR', 'Notes'];
      const rows = data.transactions.map(t => [
        t.date,
        t.metal,
        t.type,
        t.quantity,
        t.price,
        t.amount,
        t.platform,
        t.rsi,
        t.gsr,
        t.notes,
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    if (type === 'priceData') {
      const headers = ['Date', 'Gold Price', 'Silver Price', 'Platinum Price', 'Gold RSI', 'Silver RSI', 'Platinum RSI', 'VIX'];
      const rows = data.priceData.map(p => [
        p.date,
        p.goldPrice,
        p.silverPrice,
        p.platinumPrice,
        p.goldRSI,
        p.silverRSI,
        p.platinumRSI,
        p.vix || '',
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    if (type === 'limitOrders') {
      const headers = ['Created Date', 'Metal', 'Tier', 'Amount (¥)', 'Target Price (¥/g)', 'Quantity (g)', 'Status', 'Filled Date', 'Filled Price'];
      const rows = data.limitOrders.map(o => [
        o.createdDate,
        o.metal,
        o.tier,
        o.amount,
        o.targetPrice,
        o.quantity,
        o.status,
        o.filledDate || '',
        o.filledPrice || '',
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return '';
  },
};
