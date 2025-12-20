# PeiLing - Precious Metals Investment Manager

A comprehensive web-based application for managing precious metals investments using a sophisticated value averaging strategy. Built with React, TypeScript, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🌟 Overview

PeiLing is a production-ready investment management tool designed to help you systematically invest in precious metals (gold, silver, and platinum) using proven quantitative strategies including:

- **Value Averaging**: Monthly investment amounts adjust based on portfolio performance
- **RSI-Based Timing**: Technical indicators guide purchase decisions
- **Gold-Silver Ratio Arbitrage**: Exploit relative value discrepancies
- **Tiered Limit Orders**: Capture price dips with strategic order placement
- **Dynamic Stop-Loss**: Volatility-adjusted risk management

## 🚀 Features

### Core Functionality

- **📊 Dashboard**: Real-time portfolio overview with allocation charts and performance metrics
- **💰 Investment Calculator**: Monthly investment amount calculator using value averaging
- **📝 Limit Order Generator**: Create tiered orders based on market conditions
- **📈 Price Data Management**: Track daily prices and technical indicators (RSI, GSR)
- **💸 Transaction Log**: Comprehensive record of all buys and sells
- **🏦 Portfolio Holdings**: Real-time valuation and performance tracking
- **🛡️ Stop-Loss Monitor**: Dynamic and hard stop-loss tracking
- **🔄 Rebalancing Tool**: Automatic rebalancing recommendations
- **📑 Performance Reports**: Monthly, quarterly, and annual analytics
- **⚙️ Settings**: Fully configurable strategy parameters
- **🔔 Alerts**: Smart notifications for market conditions
- **💾 Data Management**: Export/import backups and CSV exports
- **❓ Help Section**: Comprehensive educational resources

### 🔐 User Management & Security

- **Multi-User Support**: Multiple users can manage separate portfolios on the same device
- **Secure Authentication**: Password-protected accounts with encrypted storage
- **User Profiles**: Personalized settings and data isolation per user
- **Password Management**: Change password functionality
- **Session Management**: Secure login/logout with persistent sessions

### 🌐 Internationalization

- **Bilingual Support**: Full Chinese (Simplified) and English translations
- **Language Toggle**: Seamless switching between languages
- **Localized UI**: All interface elements, navigation, and messages translated
- **Default Language**: Chinese (中文) for China market, easily switchable to English
- **Persistent Preference**: Language choice saved across sessions

### Investment Strategy

**Capital Structure:**
- Total Capital: ¥100,000 (configurable)
- Accumulation Period: 6 months
- Holding Period: Minimum 3 years
- Active Capital: 85% (¥85,000)
- Opportunity Capital: 15% (¥15,000)

**Asset Allocation:**
- Gold: 50%
- Silver: 35%
- Platinum: 15%

**Key Methodologies:**

1. **Value Averaging**: Invest more when portfolio underperforms, less when it overperforms
   - Monthly Investment = Target Value - Current Value
   - Target Value = (Months Passed / 6) × Total Capital

2. **RSI Filtering**:
   - RSI > 70: Pause buying (overbought)
   - RSI 50-70: Reduce to 50% allocation
   - RSI 30-50: Normal 100% allocation
   - RSI < 30: Aggressive 150% allocation

3. **GSR Arbitrage**:
   - Normal Range: 65-75
   - GSR > 85: Silver undervalued → buy more silver
   - GSR < 55: Gold undervalued → buy more gold

4. **Tiered Limit Orders**:
   - Tier 1: 40% allocation at -1% to -2%
   - Tier 2: 30% allocation at -2.5% to -4%
   - Tier 3: 20% allocation at -4% to -6.5%
   - Tier 4: 10% allocation at -6% to -9%

5. **Dynamic Stop-Loss**:
   - Formula: Avg Cost - (30-day volatility × 2.5 × 20 days)
   - Hard Stop: Avg Cost - 25%

## 📋 Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd PeiLing
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

5. **Preview production build:**
```bash
npm run preview
```

## 📖 User Guide

### First Time Setup

1. **Create Account:**
   - Open the application
   - Click "Register" on the login screen
   - Enter username, email, and password (minimum 6 characters)
   - Click "Create Account"
   - You'll be automatically logged in

   **Demo Credentials (for testing):**
   - Username: `demo`
   - Password: `demo123`

2. **Login:**
   - Enter your username and password
   - Click "Sign In"
   - Your portfolio data is isolated and secure
   - Each user has completely separate data

3. **Language Selection:**
   - Click the language toggle button (🌐) in the header
   - Switch between Chinese (中文) and English
   - Language preference is saved automatically
   - Default language is Chinese for China market

### Getting Started

1. **Configure Settings:**
   - Navigate to the Settings tab
   - Set your total capital amount (default: ¥100,000)
   - Configure accumulation start date
   - Adjust target allocation percentages if desired
   - Set RSI and GSR thresholds
   - Save settings

2. **Add Price Data:**
   - Go to the Price Data tab
   - Enter daily prices for gold, silver, and platinum (¥/gram)
   - Input RSI values (30-period recommended)
   - Optionally add VIX for volatility context
   - Save price data

3. **Calculate Monthly Investment:**
   - Open the Investment Calculator tab
   - Select the current date
   - Review the calculated investment amount based on value averaging
   - Check RSI recommendations for each metal
   - Review Gold-Silver Ratio analysis
   - Note the recommended allocation amounts

4. **Generate Limit Orders:**
   - Navigate to Limit Orders tab
   - Select metal (gold/silver/platinum)
   - Enter allocation amount from calculator
   - Input current market price
   - Click "Generate Orders" to create 4-tier orders
   - Review preview before saving

5. **Record Transactions:**
   - Go to Transaction Log tab
   - Click "Add Transaction"
   - Enter date, metal, quantity, and price
   - Select trading platform
   - Add optional notes
   - Submit to log transaction

6. **Monitor Portfolio:**
   - Dashboard: View overall performance and allocation
   - Portfolio tab: See detailed holdings and unrealized P/L
   - Stop-Loss tab: Monitor risk levels
   - Alerts tab: Check important notifications

7. **Monthly Workflow:**
   - Update price data regularly (daily/weekly)
   - Run monthly investment calculator
   - Generate and place limit orders
   - Record filled orders in transaction log
   - Review performance reports
   - Check rebalancing needs

### Recommended Price Data Sources (China Market)

For accurate yuan-denominated precious metals pricing, use these reputable Chinese sources:

**Official Exchanges:**
- **Shanghai Gold Exchange (SGE)** - Most authoritative source for direct bullion trading
  - Provides real-time yuan/gram prices for gold, silver, and platinum
  - Official benchmark for Chinese precious metals market
  - Website: www.sge.com.cn

- **Bank of China Precious Metals** - Paper gold/silver accounts
  - Daily quotes for paper gold and silver
  - Accessible through BOC online banking
  - No physical delivery, pure price tracking

- **ICBC Precious Metals** - Physical and paper options
  - Real-time pricing for both physical and paper metals
  - Available through ICBC mobile app and online banking
  - Competitive spreads and liquidity

**ETF Options:**
- **Huaan Gold ETF (518880)** - Tracks physical gold prices
  - High liquidity and low tracking error
  - Traded on Shanghai Stock Exchange
  - Easy to access through any Chinese brokerage

- **E Fund Gold ETF (159934)** - Alternative gold tracking
  - Similar to Huaan with slightly different structure
  - Also tracks physical gold prices
  - Good for diversification across ETF providers

**For RSI Calculations:**
- Use 30-period RSI calculated from daily closing prices
- Most Chinese trading platforms (Tonghuashun, Futu, etc.) provide RSI indicators
- Alternatively, calculate manually from 30 days of price data
- RSI formula: RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss

**Best Practices:**
- Use consistent data source throughout your investment period
- SGE provides the most reliable benchmark prices
- Update prices during market hours (9:00-15:30 CST)
- Cross-check prices across multiple sources for accuracy
- Save source information with each price entry for audit trail

### Data Management

**Export Backups:**
- Full JSON backup: Includes all settings, transactions, and data
- CSV exports: Available for transactions, price data, and orders
- Regular exports recommended (monthly)

**Import Data:**
- Use previously exported JSON backups
- Replaces all current data

## 🔧 Technical Stack

- **Frontend Framework**: React 18
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: Custom local authentication with encrypted passwords
- **Internationalization**: Custom i18n implementation (English & Chinese)
- **State Management**: React Context API
- **Data Storage**: localStorage with multi-user support
- **Date Handling**: date-fns

## 📊 Calculation Methodologies

### Value Averaging
```typescript
targetValue = (monthsPassed / 6) * totalCapital
requiredInvestment = max(0, targetValue - currentValue)
```

### Gold-Silver Ratio
```typescript
GSR = goldPrice / silverPrice
```

### Sharpe Ratio
```typescript
sharpeRatio = (portfolioReturn - riskFreeRate) / standardDeviation
```

### Maximum Drawdown
```typescript
maxDrawdown = max((peak - trough) / peak) * 100
```

### Volatility (Annualized)
```typescript
volatility = standardDeviation(dailyReturns) * sqrt(252)
```

### Dynamic Stop-Loss
```typescript
dynamicStopLoss = avgCost - (30dayVolatility * 2.5 * 20)
```

## 🔒 Privacy & Security

- **100% Client-Side**: All data stored locally in browser
- **No Server Communication**: Zero data transmission
- **Export Backups**: User-controlled data portability
- **No Cookies**: No tracking or analytics

## 🎯 Best Practices

1. **Update price data regularly** (daily or at least weekly)
2. **Stick to the monthly investment schedule** consistently
3. **Use tiered limit orders** to improve average entry prices
4. **Monitor RSI** to avoid buying overbought metals
5. **Rebalance** when allocation deviates >15% from target
6. **Respect stop-loss levels** to limit downside risk
7. **Export backups regularly** to prevent data loss
8. **Review performance monthly** and adjust as needed
9. **Maintain discipline** - avoid emotional decisions
10. **Think long-term** - minimum 3-year holding period

## 📁 Project Structure

```
PeiLing/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.tsx
│   │   ├── MonthlyInvestmentCalculator.tsx
│   │   ├── LimitOrderGenerator.tsx
│   │   ├── PriceDataEntry.tsx
│   │   ├── TransactionLog.tsx
│   │   ├── PortfolioHoldings.tsx
│   │   ├── StopLossMonitor.tsx
│   │   ├── RebalancingTool.tsx
│   │   ├── PerformanceReports.tsx
│   │   ├── Settings.tsx
│   │   ├── Alerts.tsx
│   │   ├── DataManagement.tsx
│   │   └── HelpSection.tsx
│   ├── hooks/           # Custom React hooks
│   │   └── useAppData.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── calculations.ts
│   │   ├── helpers.ts
│   │   └── storage.ts
│   ├── data/            # Sample data utilities
│   │   └── sampleData.ts
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md            # This file
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Browser Compatibility
- Ensure you're using a modern browser
- Clear browser cache and localStorage if issues persist
- Check browser console for errors

### Data Loss Prevention
- Export backups regularly (Settings → Data Management)
- Store backups in multiple locations
- Test imports periodically

## 🔮 Future Enhancements

- Real-time price API integration
- Multi-currency support
- Advanced charting and analytics
- Mobile app version
- Portfolio comparison tools
- Tax reporting features
- Automated order execution (via broker APIs)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or issues, please open an issue on GitHub.

## ⚠️ Disclaimer

This tool is for educational and informational purposes only. It is not financial advice. Past performance does not guarantee future results. Always consult with a qualified financial advisor before making investment decisions. The developers are not responsible for any financial losses incurred through the use of this software.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for a secure, performant user experience.

---

**Made with ❤️ for systematic precious metals investors**
