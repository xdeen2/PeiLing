import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, LogOut, Save } from 'lucide-react';
import { authService } from '../auth/authService';

export default function UserProfile() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: t.auth.passwordMismatch });
      return;
    }

    if (!user) return;

    const result = authService.changePassword(user.username, passwords.current, passwords.new);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPasswordChange(false);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">{t.auth.profile}</h2>
        <p className="text-gray-600">{t.auth.welcomeBack}, {user.username}!</p>
      </div>

      {/* User Info */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{user.username}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t.auth.changePassword}</h3>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="btn btn-secondary"
          >
            {showPasswordChange ? t.common.cancel : t.common.edit}
          </button>
        </div>

        {showPasswordChange && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">{t.auth.currentPassword}</label>
              <input
                type="password"
                value={passwords.current}
                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.auth.newPassword}</label>
              <input
                type="password"
                value={passwords.new}
                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                required
                minLength={6}
                className="input"
              />
            </div>
            <div>
              <label className="label">{t.auth.confirmPassword}</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                required
                minLength={6}
                className="input"
              />
            </div>

            {message.text && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-success-50 border border-success-200 text-success-700'
                    : 'bg-danger-50 border border-danger-200 text-danger-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t.common.save}
            </button>
          </form>
        )}
      </div>

      {/* Logout */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">{t.auth.logout}</h3>
            <p className="text-sm text-gray-600">Sign out of your account</p>
          </div>
          <button onClick={logout} className="btn btn-danger flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            {t.auth.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
