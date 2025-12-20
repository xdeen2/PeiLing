import { useAppData } from '../hooks/useAppData';
import { useLanguage } from '../contexts/LanguageContext';
import { storage } from '../utils/storage';
import { downloadFile } from '../utils/helpers';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function DataManagement({ data, importData, resetData }: ReturnType<typeof useAppData>) {
  const { t } = useLanguage();
  const handleExportJSON = () => {
    const jsonData = storage.export();
    downloadFile(jsonData, `peiling-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const handleExportCSV = (type: 'transactions' | 'priceData' | 'limitOrders') => {
    const csvData = storage.exportCSV(type);
    downloadFile(csvData, `peiling-${type}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonString = event.target?.result as string;
        if (importData(jsonString)) {
          alert(t.dataManagement.importSuccess);
        } else {
          alert(t.dataManagement.importFailed);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm(t.dataManagement.resetConfirm)) {
      if (confirm(t.dataManagement.resetConfirm2)) {
        resetData();
        alert(t.dataManagement.resetSuccess);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{ t.dataManagement.title}</h2>
        <p className="text-gray-600">{t.dataManagement.subtitle}</p>
      </div>

      {/* Data Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{ t.dataManagement.dataStatistics}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">{data.priceData.length}</p>
            <p className="text-sm text-gray-600 mt-1">{ t.dataManagement.priceDataPoints}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">{data.transactions.length}</p>
            <p className="text-sm text-gray-600 mt-1">Transactions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">{data.limitOrders.length}</p>
            <p className="text-sm text-gray-600 mt-1">{ t.dataManagement.limitOrders}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600">{data.alerts.length}</p>
            <p className="text-sm text-gray-600 mt-1">{ t.alerts.title}</p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{ t.dataManagement.exportData}</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{ t.dataManagement.fullBackup}</h4>
            <p className="text-sm text-gray-600 mb-3">
              Export all your data including settings, transactions, prices, and reports.
            </p>
            <button onClick={handleExportJSON} className="btn btn-primary">
              <Download className="w-4 h-4 inline mr-2" />
              Export Full Backup
            </button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">{ t.dataManagement.csvExports}</h4>
            <p className="text-sm text-gray-600 mb-3">
              Export specific data types as CSV for use in spreadsheets.
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleExportCSV('transactions')} className="btn btn-secondary">
                Export Transactions
              </button>
              <button onClick={() => handleExportCSV('priceData')} className="btn btn-secondary">
                Export Price Data
              </button>
              <button onClick={() => handleExportCSV('limitOrders')} className="btn btn-secondary">
                Export Limit Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Data */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{ t.dataManagement.importData}</h3>
        <p className="text-sm text-gray-600 mb-3">
          Import a previously exported JSON backup file. This will replace all current data.
        </p>
        <button onClick={handleImport} className="btn btn-primary">
          <Upload className="w-4 h-4 inline mr-2" />
          Import from Backup
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card border-2 border-danger-500 bg-danger-50">
        <h3 className="text-lg font-semibold mb-4 text-danger-900">{ t.dataManagement.dangerZone}</h3>
        <p className="text-sm text-danger-800 mb-3">
          Warning: This action will permanently delete all your data and cannot be undone.
        </p>
        <button onClick={handleReset} className="btn btn-danger">
          <Trash2 className="w-4 h-4 inline mr-2" />
          Reset All Data
        </button>
      </div>
    </div>
  );
}
