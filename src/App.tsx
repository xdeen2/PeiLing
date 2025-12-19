import { useState } from 'react';
import { useAppData } from './hooks/useAppData';
import Dashboard from './components/Dashboard';
import MonthlyInvestmentCalculator from './components/MonthlyInvestmentCalculator';
import LimitOrderGenerator from './components/LimitOrderGenerator';
import PriceDataEntry from './components/PriceDataEntry';
import TransactionLog from './components/TransactionLog';
import PortfolioHoldings from './components/PortfolioHoldings';
import StopLossMonitor from './components/StopLossMonitor';
import RebalancingTool from './components/RebalancingTool';
import PerformanceReports from './components/PerformanceReports';
import Settings from './components/Settings';
import Alerts from './components/Alerts';
import DataManagement from './components/DataManagement';
import HelpSection from './components/HelpSection';
import {
  LayoutDashboard,
  Calculator,
  ListOrdered,
  TrendingUp,
  Receipt,
  Wallet,
  Shield,
  RefreshCw,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
  Database,
  HelpCircle,
} from 'lucide-react';

type Tab =
  | 'dashboard'
  | 'calculator'
  | 'orders'
  | 'prices'
  | 'transactions'
  | 'portfolio'
  | 'stoploss'
  | 'rebalancing'
  | 'reports'
  | 'settings'
  | 'alerts'
  | 'data'
  | 'help';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const appData = useAppData();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator', name: 'Investment Calculator', icon: Calculator },
    { id: 'orders', name: 'Limit Orders', icon: ListOrdered },
    { id: 'prices', name: 'Price Data', icon: TrendingUp },
    { id: 'transactions', name: 'Transactions', icon: Receipt },
    { id: 'portfolio', name: 'Portfolio', icon: Wallet },
    { id: 'stoploss', name: 'Stop Loss', icon: Shield },
    { id: 'rebalancing', name: 'Rebalancing', icon: RefreshCw },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'alerts', name: 'Alerts', icon: Bell },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'help', name: 'Help', icon: HelpCircle },
  ] as const;

  const unreadAlerts = appData.data.alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PeiLing</h1>
              <p className="text-sm text-gray-600">Precious Metals Investment Manager</p>
            </div>
            <div className="flex items-center gap-4">
              {unreadAlerts > 0 && (
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-danger-600 rounded-full">
                    {unreadAlerts}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-thin">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${
                      isActive
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                  {tab.id === 'alerts' && unreadAlerts > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-danger-600 text-white rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard {...appData} />}
        {activeTab === 'calculator' && <MonthlyInvestmentCalculator {...appData} />}
        {activeTab === 'orders' && <LimitOrderGenerator {...appData} />}
        {activeTab === 'prices' && <PriceDataEntry {...appData} />}
        {activeTab === 'transactions' && <TransactionLog {...appData} />}
        {activeTab === 'portfolio' && <PortfolioHoldings {...appData} />}
        {activeTab === 'stoploss' && <StopLossMonitor {...appData} />}
        {activeTab === 'rebalancing' && <RebalancingTool {...appData} />}
        {activeTab === 'reports' && <PerformanceReports {...appData} />}
        {activeTab === 'settings' && <Settings {...appData} />}
        {activeTab === 'alerts' && <Alerts {...appData} />}
        {activeTab === 'data' && <DataManagement {...appData} />}
        {activeTab === 'help' && <HelpSection />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            PeiLing - Precious Metals Investment Manager v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
