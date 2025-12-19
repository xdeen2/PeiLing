import {
  Transaction,
  Holdings,
  Metal,
  PriceData,
  StrategyConfig,
  MonthlyInvestmentCalculation,
  StopLossStatus,
  RebalancingRecommendation,
} from '../types';

/**
 * Calculate holdings from transactions
 */
export function calculateHoldings(transactions: Transaction[]): Holdings {
  const holdings: Holdings = {
    gold: { quantity: 0, averageCost: 0, totalCost: 0 },
    silver: { quantity: 0, averageCost: 0, totalCost: 0 },
    platinum: { quantity: 0, averageCost: 0, totalCost: 0 },
  };

  transactions.forEach(tx => {
    const holding = holdings[tx.metal];

    if (tx.type === 'buy') {
      holding.totalCost += tx.amount;
      holding.quantity += tx.quantity;
    } else {
      // Sell: reduce quantity proportionally
      const sellRatio = tx.quantity / holding.quantity;
      holding.totalCost -= holding.totalCost * sellRatio;
      holding.quantity -= tx.quantity;
    }

    holding.averageCost = holding.quantity > 0 ? holding.totalCost / holding.quantity : 0;
  });

  return holdings;
}

/**
 * Calculate Gold-Silver Ratio
 */
export function calculateGSR(goldPrice: number, silverPrice: number): number {
  return silverPrice > 0 ? goldPrice / silverPrice : 0;
}

/**
 * Calculate total invested capital
 */
export function calculateTotalInvested(transactions: Transaction[]): number {
  return transactions.reduce((sum, tx) => {
    return tx.type === 'buy' ? sum + tx.amount : sum - tx.amount;
  }, 0);
}

/**
 * Calculate current portfolio value
 */
export function calculatePortfolioValue(
  holdings: Holdings,
  goldPrice: number,
  silverPrice: number,
  platinumPrice: number
): number {
  return (
    holdings.gold.quantity * goldPrice +
    holdings.silver.quantity * silverPrice +
    holdings.platinum.quantity * platinumPrice
  );
}

/**
 * Calculate target portfolio value for value averaging
 * Formula: (monthsPassed / 6) * totalCapital
 */
export function calculateTargetValue(
  startDate: string,
  currentDate: string,
  totalCapital: number
): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  const monthsPassed = (current.getFullYear() - start.getFullYear()) * 12 +
                       (current.getMonth() - start.getMonth());

  return Math.min((monthsPassed / 6) * totalCapital, totalCapital);
}

/**
 * Calculate required investment based on value averaging
 */
export function calculateValueAveragingInvestment(
  targetValue: number,
  currentValue: number
): number {
  return Math.max(0, targetValue - currentValue);
}

/**
 * Calculate RSI adjustment multiplier
 */
export function calculateRSIMultiplier(rsi: number, config: StrategyConfig): number {
  if (rsi > config.rsiThresholds.pause) return 0; // Pause
  if (rsi > config.rsiThresholds.reduce) return 0.5; // Reduce
  if (rsi >= config.rsiThresholds.normal) return 1; // Normal
  return 1.5; // Aggressive (below 30)
}

/**
 * Calculate monthly investment allocation
 */
export function calculateMonthlyInvestment(
  currentDate: string,
  config: StrategyConfig,
  currentHoldings: Holdings,
  latestPrices: PriceData
): MonthlyInvestmentCalculation {
  const targetValue = calculateTargetValue(
    config.accumulationStartDate,
    currentDate,
    config.totalCapital
  );

  const currentValue = calculatePortfolioValue(
    currentHoldings,
    latestPrices.goldPrice,
    latestPrices.silverPrice,
    latestPrices.platinumPrice
  );

  const requiredInvestment = calculateValueAveragingInvestment(targetValue, currentValue);

  // Calculate RSI multipliers
  const rsiAdjustments = {
    gold: calculateRSIMultiplier(latestPrices.goldRSI, config),
    silver: calculateRSIMultiplier(latestPrices.silverRSI, config),
    platinum: calculateRSIMultiplier(latestPrices.platinumRSI, config),
  };

  // Calculate GSR
  const gsr = calculateGSR(latestPrices.goldPrice, latestPrices.silverPrice);

  // Check if GSR rebalancing is needed
  const gsrRebalancing: MonthlyInvestmentCalculation['gsrRebalancing'] = {
    needed: false,
  };

  if (gsr > config.gsrParameters.silverCheap) {
    // Silver is cheap, buy more silver
    gsrRebalancing.needed = true;
    gsrRebalancing.fromMetal = 'gold';
    gsrRebalancing.toMetal = 'silver';
  } else if (gsr < config.gsrParameters.goldCheap) {
    // Gold is cheap, buy more gold
    gsrRebalancing.needed = true;
    gsrRebalancing.fromMetal = 'silver';
    gsrRebalancing.toMetal = 'gold';
  }

  // Calculate base allocation
  let goldAllocation = requiredInvestment * (config.targetAllocation.gold / 100);
  let silverAllocation = requiredInvestment * (config.targetAllocation.silver / 100);
  let platinumAllocation = requiredInvestment * (config.targetAllocation.platinum / 100);

  // Apply RSI adjustments
  goldAllocation *= rsiAdjustments.gold;
  silverAllocation *= rsiAdjustments.silver;
  platinumAllocation *= rsiAdjustments.platinum;

  // Apply GSR adjustments if needed
  if (gsrRebalancing.needed && gsrRebalancing.toMetal) {
    const totalAdjusted = goldAllocation + silverAllocation + platinumAllocation;
    const unusedCapital = requiredInvestment - totalAdjusted;

    if (gsrRebalancing.toMetal === 'silver') {
      silverAllocation += unusedCapital;
    } else if (gsrRebalancing.toMetal === 'gold') {
      goldAllocation += unusedCapital;
    }
  }

  return {
    month: currentDate.substring(0, 7),
    targetValue,
    currentValue,
    requiredInvestment,
    rsiAdjustments,
    gsrRebalancing,
    finalAllocation: {
      gold: goldAllocation,
      silver: silverAllocation,
      platinum: platinumAllocation,
    },
  };
}

/**
 * Generate limit orders for a metal
 */
export function generateLimitOrders(
  _metal: Metal,
  allocation: number,
  currentPrice: number,
  spreads: [number, number, number, number]
): Array<{
  tier: 1 | 2 | 3 | 4;
  amount: number;
  targetPrice: number;
  quantity: number;
  percentage: number;
}> {
  const tierPercentages = [0.4, 0.3, 0.2, 0.1]; // 40%, 30%, 20%, 10%

  return spreads.map((spread, index) => {
    const tier = (index + 1) as 1 | 2 | 3 | 4;
    const percentage = tierPercentages[index];
    const amount = allocation * percentage;
    const targetPrice = currentPrice * (1 + spread / 100);
    const quantity = amount / targetPrice;

    return {
      tier,
      amount,
      targetPrice,
      quantity,
      percentage: percentage * 100,
    };
  });
}

/**
 * Calculate volatility from price data
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Calculate standard deviation
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Annualize (assuming 252 trading days)
  return stdDev * Math.sqrt(252);
}

/**
 * Calculate 30-day volatility for a metal
 */
export function calculate30DayVolatility(
  priceData: PriceData[],
  metal: Metal
): number {
  const last30Days = priceData.slice(-30);
  const prices = last30Days.map(p =>
    metal === 'gold' ? p.goldPrice :
    metal === 'silver' ? p.silverPrice :
    p.platinumPrice
  );

  return calculateVolatility(prices);
}

/**
 * Calculate dynamic stop-loss
 */
export function calculateStopLoss(
  averageCost: number,
  volatility: number,
  config: StrategyConfig
): StopLossStatus['dynamicStopLoss'] {
  return averageCost - (volatility * config.stopLossParameters.volatilityMultiplier * 20);
}

/**
 * Calculate stop-loss status for a metal
 */
export function calculateStopLossStatus(
  metal: Metal,
  holdings: Holdings,
  currentPrice: number,
  volatility: number,
  config: StrategyConfig
): StopLossStatus {
  const holding = holdings[metal];
  const dynamicStopLoss = calculateStopLoss(holding.averageCost, volatility, config);
  const hardStopLoss = holding.averageCost * (1 + config.stopLossParameters.hardStopPercent / 100);

  const distanceFromDynamic = ((currentPrice - dynamicStopLoss) / currentPrice) * 100;
  const distanceFromHard = ((currentPrice - hardStopLoss) / currentPrice) * 100;
  const distanceFromStop = Math.min(distanceFromDynamic, distanceFromHard);

  let status: StopLossStatus['status'] = 'safe';
  if (distanceFromStop < 5) status = 'danger';
  else if (distanceFromStop < 10) status = 'warning';

  return {
    metal,
    currentPrice,
    averageCost: holding.averageCost,
    dynamicStopLoss,
    hardStopLoss,
    distanceFromStop,
    status,
  };
}

/**
 * Calculate current allocation percentages
 */
export function calculateAllocation(
  holdings: Holdings,
  goldPrice: number,
  silverPrice: number,
  platinumPrice: number
): { gold: number; silver: number; platinum: number } {
  const totalValue = calculatePortfolioValue(holdings, goldPrice, silverPrice, platinumPrice);

  if (totalValue === 0) {
    return { gold: 0, silver: 0, platinum: 0 };
  }

  return {
    gold: (holdings.gold.quantity * goldPrice / totalValue) * 100,
    silver: (holdings.silver.quantity * silverPrice / totalValue) * 100,
    platinum: (holdings.platinum.quantity * platinumPrice / totalValue) * 100,
  };
}

/**
 * Calculate rebalancing recommendation
 */
export function calculateRebalancing(
  holdings: Holdings,
  goldPrice: number,
  silverPrice: number,
  platinumPrice: number,
  config: StrategyConfig
): RebalancingRecommendation {
  const currentAllocation = calculateAllocation(holdings, goldPrice, silverPrice, platinumPrice);
  const targetAllocation = config.targetAllocation;

  const deviations = {
    gold: currentAllocation.gold - targetAllocation.gold,
    silver: currentAllocation.silver - targetAllocation.silver,
    platinum: currentAllocation.platinum - targetAllocation.platinum,
  };

  const maxDeviation = Math.max(
    Math.abs(deviations.gold),
    Math.abs(deviations.silver),
    Math.abs(deviations.platinum)
  );

  const needed = maxDeviation > 15;

  if (!needed) {
    return {
      needed: false,
      currentAllocation,
      targetAllocation,
      deviations,
    };
  }

  // Find most overweight and underweight metals
  const metals: Metal[] = ['gold', 'silver', 'platinum'];
  let overweightMetal: Metal = 'gold';
  let underweightMetal: Metal = 'silver';
  let maxPositiveDeviation = deviations.gold;
  let maxNegativeDeviation = deviations.silver;

  metals.forEach(metal => {
    if (deviations[metal] > maxPositiveDeviation) {
      maxPositiveDeviation = deviations[metal];
      overweightMetal = metal;
    }
    if (deviations[metal] < maxNegativeDeviation) {
      maxNegativeDeviation = deviations[metal];
      underweightMetal = metal;
    }
  });

  const totalValue = calculatePortfolioValue(holdings, goldPrice, silverPrice, platinumPrice);
  const rebalanceAmount = (Math.abs(maxPositiveDeviation) / 100) * totalValue;

  const getPrice = (metal: Metal): number => {
    switch (metal) {
      case 'gold': return goldPrice;
      case 'silver': return silverPrice;
      case 'platinum': return platinumPrice;
    }
  };

  const sellPrice = getPrice(overweightMetal);
  const buyPrice = getPrice(underweightMetal);

  return {
    needed: true,
    currentAllocation,
    targetAllocation,
    deviations,
    trades: {
      sell: {
        metal: overweightMetal,
        amount: rebalanceAmount,
        quantity: rebalanceAmount / sellPrice,
      },
      buy: {
        metal: underweightMetal,
        amount: rebalanceAmount,
        quantity: rebalanceAmount / buyPrice,
      },
    },
  };
}

/**
 * Calculate Sharpe Ratio
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0.02
): number {
  if (returns.length === 0) return 0;

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const excessReturn = avgReturn - riskFreeRate;

  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev > 0 ? excessReturn / stdDev : 0;
}

/**
 * Calculate Maximum Drawdown
 */
export function calculateMaxDrawdown(portfolioValues: number[]): number {
  if (portfolioValues.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = portfolioValues[0];

  portfolioValues.forEach(value => {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown * 100;
}

/**
 * Calculate order fill rate
 */
export function calculateFillRate(totalOrders: number, filledOrders: number): number {
  return totalOrders > 0 ? (filledOrders / totalOrders) * 100 : 0;
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format grams
 */
export function formatGrams(value: number): string {
  return `${value.toFixed(2)}g`;
}
