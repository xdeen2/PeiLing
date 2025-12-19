import { Metal, Grade } from '../types';

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get metal display name
 */
export function getMetalName(metal: Metal): string {
  const names = {
    gold: 'Gold',
    silver: 'Silver',
    platinum: 'Platinum',
  };
  return names[metal];
}

/**
 * Get metal color for charts
 */
export function getMetalColor(metal: Metal): string {
  const colors = {
    gold: '#FFD700',
    silver: '#C0C0C0',
    platinum: '#E5E4E2',
  };
  return colors[metal];
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Add months to a date
 */
export function addMonths(date: string, months: number): string {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get month string from date (YYYY-MM)
 */
export function getMonthString(date: string): string {
  return date.substring(0, 7);
}

/**
 * Get quarter string from date (YYYY-Q#)
 */
export function getQuarterString(date: string): string {
  const d = new Date(date);
  const quarter = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${quarter}`;
}

/**
 * Get year string from date (YYYY)
 */
export function getYearString(date: string): string {
  return date.substring(0, 4);
}

/**
 * Calculate grade based on performance
 */
export function calculateGrade(
  fillRate: number,
  returnRate: number,
  avgCostVsMarket: number
): Grade {
  let score = 0;

  // Fill rate (0-40 points)
  if (fillRate >= 80) score += 40;
  else if (fillRate >= 60) score += 30;
  else if (fillRate >= 40) score += 20;
  else score += 10;

  // Return rate (0-40 points)
  if (returnRate >= 10) score += 40;
  else if (returnRate >= 5) score += 30;
  else if (returnRate >= 0) score += 20;
  else score += 10;

  // Cost efficiency (0-20 points)
  if (avgCostVsMarket <= -5) score += 20; // 5% below market
  else if (avgCostVsMarket <= -2) score += 15;
  else if (avgCostVsMarket <= 0) score += 10;
  else score += 5;

  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  return 'C';
}

/**
 * Download data as file
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file
 */
export function parseCSV(csvString: string): string[][] {
  const lines = csvString.trim().split('\n');
  return lines.map(line => {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    values.push(currentValue);
    return values;
  });
}

/**
 * Validate price data
 */
export function validatePrice(price: number): boolean {
  return !isNaN(price) && price > 0 && isFinite(price);
}

/**
 * Validate RSI value
 */
export function validateRSI(rsi: number): boolean {
  return !isNaN(rsi) && rsi >= 0 && rsi <= 100;
}

/**
 * Validate quantity
 */
export function validateQuantity(quantity: number): boolean {
  return !isNaN(quantity) && quantity > 0 && isFinite(quantity);
}

/**
 * Get status color class
 */
export function getStatusColor(status: 'safe' | 'warning' | 'danger'): string {
  const colors = {
    safe: 'text-success-600',
    warning: 'text-warning-600',
    danger: 'text-danger-600',
  };
  return colors[status];
}

/**
 * Get status background color class
 */
export function getStatusBgColor(status: 'safe' | 'warning' | 'danger'): string {
  const colors = {
    safe: 'bg-success-100',
    warning: 'bg-warning-100',
    danger: 'bg-danger-100',
  };
  return colors[status];
}
