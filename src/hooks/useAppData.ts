import { useState, useEffect, useCallback } from 'react';
import { AppData, PriceData, Transaction, LimitOrder, Alert, MonthlyReport, QuarterlyReport, AnnualReport } from '../types';
import { storage } from '../utils/storage';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => storage.load());

  // Save to localStorage whenever data changes
  useEffect(() => {
    storage.save(data);
  }, [data]);

  const updateConfig = useCallback((updates: Partial<AppData['config']>) => {
    setData(prev => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const addPriceData = useCallback((priceData: PriceData) => {
    setData(prev => ({
      ...prev,
      priceData: [...prev.priceData, priceData].sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, []);

  const updatePriceData = useCallback((id: string, updates: Partial<PriceData>) => {
    setData(prev => ({
      ...prev,
      priceData: prev.priceData.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const deletePriceData = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      priceData: prev.priceData.filter(p => p.id !== id),
    }));
  }, []);

  const addTransaction = useCallback((transaction: Transaction) => {
    setData(prev => ({
      ...prev,
      transactions: [...prev.transactions, transaction].sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, []);

  const addLimitOrder = useCallback((order: LimitOrder) => {
    setData(prev => ({
      ...prev,
      limitOrders: [...prev.limitOrders, order],
    }));
  }, []);

  const updateLimitOrder = useCallback((id: string, updates: Partial<LimitOrder>) => {
    setData(prev => ({
      ...prev,
      limitOrders: prev.limitOrders.map(o => o.id === id ? { ...o, ...updates } : o),
    }));
  }, []);

  const deleteLimitOrder = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      limitOrders: prev.limitOrders.filter(o => o.id !== id),
    }));
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setData(prev => ({
      ...prev,
      alerts: [alert, ...prev.alerts],
    }));
  }, []);

  const markAlertAsRead = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, read: true } : a),
    }));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== id),
    }));
  }, []);

  const addMonthlyReport = useCallback((report: MonthlyReport) => {
    setData(prev => ({
      ...prev,
      monthlyReports: [...prev.monthlyReports, report].sort((a, b) => b.month.localeCompare(a.month)),
    }));
  }, []);

  const updateMonthlyReport = useCallback((month: string, updates: Partial<MonthlyReport>) => {
    setData(prev => ({
      ...prev,
      monthlyReports: prev.monthlyReports.map(r => r.month === month ? { ...r, ...updates } : r),
    }));
  }, []);

  const addQuarterlyReport = useCallback((report: QuarterlyReport) => {
    setData(prev => ({
      ...prev,
      quarterlyReports: [...prev.quarterlyReports, report].sort((a, b) => b.quarter.localeCompare(a.quarter)),
    }));
  }, []);

  const addAnnualReport = useCallback((report: AnnualReport) => {
    setData(prev => ({
      ...prev,
      annualReports: [...prev.annualReports, report].sort((a, b) => b.year.localeCompare(a.year)),
    }));
  }, []);

  const importData = useCallback((jsonString: string) => {
    if (storage.import(jsonString)) {
      setData(storage.load());
      return true;
    }
    return false;
  }, []);

  const resetData = useCallback(() => {
    storage.reset();
    setData(storage.load());
  }, []);

  return {
    data,
    updateConfig,
    addPriceData,
    updatePriceData,
    deletePriceData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addLimitOrder,
    updateLimitOrder,
    deleteLimitOrder,
    addAlert,
    markAlertAsRead,
    deleteAlert,
    addMonthlyReport,
    updateMonthlyReport,
    addQuarterlyReport,
    addAnnualReport,
    importData,
    resetData,
  };
}
