import { PriceData, Transaction, AppData } from '../types';
import { generateId } from '../utils/helpers';
import { storage } from '../utils/storage';

export function loadSampleData(): void {
  const currentData = storage.load();

  // Generate sample price data for the past 30 days
  const samplePrices: PriceData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Generate realistic price movements
    const goldBase = 520 + Math.sin(i / 5) * 20 + Math.random() * 10;
    const silverBase = 6.8 + Math.sin(i / 5) * 0.5 + Math.random() * 0.3;
    const platinumBase = 215 + Math.sin(i / 5) * 15 + Math.random() * 8;

    // Generate RSI values
    const goldRSI = 30 + Math.random() * 40; // 30-70 range
    const silverRSI = 35 + Math.random() * 35;
    const platinumRSI = 32 + Math.random() * 38;

    samplePrices.push({
      id: generateId(),
      date: date.toISOString().split('T')[0],
      goldPrice: parseFloat(goldBase.toFixed(2)),
      silverPrice: parseFloat(silverBase.toFixed(2)),
      platinumPrice: parseFloat(platinumBase.toFixed(2)),
      goldRSI: parseFloat(goldRSI.toFixed(2)),
      silverRSI: parseFloat(silverRSI.toFixed(2)),
      platinumRSI: parseFloat(platinumRSI.toFixed(2)),
      vix: parseFloat((15 + Math.random() * 15).toFixed(2)),
    });
  }

  // Generate sample transactions
  const sampleTransactions: Transaction[] = [
    {
      id: generateId(),
      date: samplePrices[5].date,
      metal: 'gold',
      type: 'buy',
      quantity: 30.5,
      price: samplePrices[5].goldPrice,
      amount: 30.5 * samplePrices[5].goldPrice,
      platform: 'Huaan ETF',
      rsi: samplePrices[5].goldRSI,
      gsr: samplePrices[5].goldPrice / samplePrices[5].silverPrice,
      notes: 'Initial purchase - gold allocation',
    },
    {
      id: generateId(),
      date: samplePrices[5].date,
      metal: 'silver',
      type: 'buy',
      quantity: 1500,
      price: samplePrices[5].silverPrice,
      amount: 1500 * samplePrices[5].silverPrice,
      platform: 'E Fund ETF',
      rsi: samplePrices[5].silverRSI,
      gsr: samplePrices[5].goldPrice / samplePrices[5].silverPrice,
      notes: 'Initial purchase - silver allocation',
    },
    {
      id: generateId(),
      date: samplePrices[5].date,
      metal: 'platinum',
      type: 'buy',
      quantity: 25,
      price: samplePrices[5].platinumPrice,
      amount: 25 * samplePrices[5].platinumPrice,
      platform: 'ICBC Paper Gold',
      rsi: samplePrices[5].platinumRSI,
      gsr: samplePrices[5].goldPrice / samplePrices[5].silverPrice,
      notes: 'Initial purchase - platinum allocation',
    },
    {
      id: generateId(),
      date: samplePrices[15].date,
      metal: 'gold',
      type: 'buy',
      quantity: 25,
      price: samplePrices[15].goldPrice,
      amount: 25 * samplePrices[15].goldPrice,
      platform: 'Huaan ETF',
      rsi: samplePrices[15].goldRSI,
      gsr: samplePrices[15].goldPrice / samplePrices[15].silverPrice,
      notes: 'Second month purchase',
    },
    {
      id: generateId(),
      date: samplePrices[15].date,
      metal: 'silver',
      type: 'buy',
      quantity: 1200,
      price: samplePrices[15].silverPrice,
      amount: 1200 * samplePrices[15].silverPrice,
      platform: 'E Fund ETF',
      rsi: samplePrices[15].silverRSI,
      gsr: samplePrices[15].goldPrice / samplePrices[15].silverPrice,
      notes: 'Second month purchase',
    },
  ];

  const updatedData: AppData = {
    ...currentData,
    priceData: [...currentData.priceData, ...samplePrices].sort((a, b) => a.date.localeCompare(b.date)),
    transactions: [...currentData.transactions, ...sampleTransactions].sort((a, b) => b.date.localeCompare(a.date)),
  };

  storage.save(updatedData);
}

export function hasSampleData(): boolean {
  const data = storage.load();
  return data.priceData.length > 0 || data.transactions.length > 0;
}
