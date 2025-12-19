export type Metal = 'gold' | 'silver' | 'platinum';
export type TransactionType = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'cancelled';
export type Grade = 'A' | 'B' | 'C';

export interface PriceData {
  id: string;
  date: string;
  goldPrice: number;
  silverPrice: number;
  platinumPrice: number;
  goldRSI: number;
  silverRSI: number;
  platinumRSI: number;
  vix?: number;
}

export interface Transaction {
  id: string;
  date: string;
  metal: Metal;
  type: TransactionType;
  quantity: number; // in grams
  price: number; // yuan per gram
  amount: number; // total RMB
  platform: string;
  rsi: number;
  gsr: number;
  notes: string;
}

export interface LimitOrder {
  id: string;
  metal: Metal;
  tier: 1 | 2 | 3 | 4;
  amount: number; // RMB
  targetPrice: number; // yuan per gram
  quantity: number; // grams
  status: OrderStatus;
  createdDate: string;
  filledDate?: string;
  filledPrice?: number;
}

export interface PortfolioSnapshot {
  date: string;
  totalValue: number;
  totalInvested: number;
  goldHoldings: number; // grams
  silverHoldings: number; // grams
  platinumHoldings: number; // grams
  goldValue: number; // RMB
  silverValue: number; // RMB
  platinumValue: number; // RMB
}

export interface Holdings {
  gold: {
    quantity: number; // grams
    averageCost: number; // yuan per gram
    totalCost: number; // RMB
  };
  silver: {
    quantity: number;
    averageCost: number;
    totalCost: number;
  };
  platinum: {
    quantity: number;
    averageCost: number;
    totalCost: number;
  };
}

export interface MonthlyReport {
  month: string; // YYYY-MM format
  invested: number;
  portfolioValueStart: number;
  portfolioValueEnd: number;
  monthlyReturn: number;
  fillRate: number;
  avgCostVsMarket: number;
  ordersPlaced: number;
  ordersFilled: number;
  notes: string;
  grade: Grade;
}

export interface QuarterlyReport {
  quarter: string; // e.g., "2024-Q1"
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  alpha: number;
  totalReturn: number;
  valueAveragingBenefit: number;
  rsiTimingSuccessRate: number;
  gsrArbitrageProfit: number;
}

export interface AnnualReport {
  year: string; // YYYY
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  alpha: number;
  totalInvested: number;
  endingValue: number;
  bestMonth: string;
  worstMonth: string;
  notes: string;
}

export interface StrategyConfig {
  totalCapital: number;
  accumulationStartDate: string;
  accumulationEndDate: string;
  holdingPeriodEndDate: string;
  activeCapitalPercent: number; // default 85
  opportunityCapitalPercent: number; // default 15
  targetAllocation: {
    gold: number; // default 50
    silver: number; // default 35
    platinum: number; // default 15
  };
  limitOrderSpreads: {
    gold: [number, number, number, number]; // default [-1, -2.5, -4, -6]
    silver: [number, number, number, number]; // default [-2, -4, -6.5, -9]
    platinum: [number, number, number, number]; // default [-1.5, -3.5, -5.5, -8]
  };
  rsiThresholds: {
    pause: number; // default 70
    reduce: number; // default 50
    normal: number; // default 30
  };
  gsrParameters: {
    normalMin: number; // default 65
    normalMax: number; // default 75
    silverCheap: number; // default 85
    goldCheap: number; // default 55
  };
  stopLossParameters: {
    volatilityMultiplier: number; // default 2.5
    hardStopPercent: number; // default -25
    trailingStopPercent: number; // default -15
  };
}

export interface Alert {
  id: string;
  date: string;
  type: 'rsi_high' | 'rsi_low' | 'gsr_extreme' | 'price_drop' | 'stop_loss_warning' | 'review_due' | 'rebalance_due' | 'order_filled';
  metal?: Metal;
  message: string;
  read: boolean;
}

export interface AppData {
  config: StrategyConfig;
  priceData: PriceData[];
  transactions: Transaction[];
  limitOrders: LimitOrder[];
  portfolioSnapshots: PortfolioSnapshot[];
  monthlyReports: MonthlyReport[];
  quarterlyReports: QuarterlyReport[];
  annualReports: AnnualReport[];
  alerts: Alert[];
}

export interface MonthlyInvestmentCalculation {
  month: string;
  targetValue: number;
  currentValue: number;
  requiredInvestment: number;
  rsiAdjustments: {
    gold: number; // multiplier
    silver: number;
    platinum: number;
  };
  gsrRebalancing: {
    needed: boolean;
    fromMetal?: Metal;
    toMetal?: Metal;
    amount?: number;
  };
  finalAllocation: {
    gold: number; // RMB
    silver: number;
    platinum: number;
  };
}

export interface StopLossStatus {
  metal: Metal;
  currentPrice: number;
  averageCost: number;
  dynamicStopLoss: number;
  hardStopLoss: number;
  distanceFromStop: number; // percentage
  status: 'safe' | 'warning' | 'danger';
}

export interface RebalancingRecommendation {
  needed: boolean;
  currentAllocation: {
    gold: number;
    silver: number;
    platinum: number;
  };
  targetAllocation: {
    gold: number;
    silver: number;
    platinum: number;
  };
  deviations: {
    gold: number;
    silver: number;
    platinum: number;
  };
  trades?: {
    sell?: { metal: Metal; amount: number; quantity: number };
    buy?: { metal: Metal; amount: number; quantity: number };
  };
}
