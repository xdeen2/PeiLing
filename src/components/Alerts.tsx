import { useAppData } from '../hooks/useAppData';
import { useLanguage } from '../contexts/LanguageContext';
import { Bell, Check, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Alerts({ data, markAlertAsRead, deleteAlert }: ReturnType<typeof useAppData>) {
  const { t } = useLanguage();
  const unreadAlerts = data.alerts.filter(a => !a.read);
  const readAlerts = data.alerts.filter(a => a.read);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rsi_high':
      case 'rsi_low':
        return '📊';
      case 'gsr_extreme':
        return '⚖️';
      case 'price_drop':
        return '📉';
      case 'stop_loss_warning':
        return '⚠️';
      case 'review_due':
      case 'rebalance_due':
        return '📅';
      case 'order_filled':
        return '✅';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t.alerts.title}</h2>
          <p className="text-gray-600">{t.alerts.subtitle}</p>
        </div>
        {unreadAlerts.length > 0 && (
          <button
            onClick={() => unreadAlerts.forEach(a => markAlertAsRead(a.id))}
            className="btn btn-primary"
          >
            <Check className="w-4 h-4 inline mr-2" />
            {t.alerts.markAllRead}
          </button>
        )}
      </div>

      {/* Unread Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{ t.alerts.unreadAlerts} ({unreadAlerts.length})</h3>
        {unreadAlerts.length > 0 ? (
          <div className="space-y-3">
            {unreadAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-start justify-between"
              >
                <div className="flex gap-3">
                  <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                  <div>
                    <p className="font-medium text-primary-900">{alert.message}</p>
                    <p className="text-sm text-primary-700 mt-1">{formatDate(alert.date)}</p>
                    {alert.metal && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary-200 text-primary-800 text-xs rounded">
                        {alert.metal.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAlertAsRead(alert.id)}
                    className="text-primary-600 hover:text-primary-800"
                    title={t.alerts.markAsRead}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="text-danger-600 hover:text-danger-800"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{t.alerts.noUnreadAlerts}</p>
          </div>
        )}
      </div>

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">{ t.alerts.readAlerts} ({readAlerts.length})</h3>
          <div className="space-y-2">
            {readAlerts.slice(0, 10).map(alert => (
              <div
                key={alert.id}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start justify-between opacity-60"
              >
                <div className="flex gap-3">
                  <span className="text-xl">{getAlertIcon(alert.type)}</span>
                  <div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(alert.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="text-gray-400 hover:text-danger-600"
                  title={t.common.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
