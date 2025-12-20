import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.username, formData.password);
        if (!result.success) {
          setError(t.auth[result.message as keyof typeof t.auth] || result.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError(t.auth.passwordMismatch);
          setLoading(false);
          return;
        }
        const result = await register(formData.username, formData.password, formData.email);
        if (!result.success) {
          setError(t.auth[result.message as keyof typeof t.auth] || result.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.appName}</h1>
          <p className="text-gray-600">{t.appSubtitle}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t.auth.username}</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              required
              className="input"
              placeholder={t.auth.username}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="label">{t.auth.email}</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="input"
                placeholder={t.auth.email}
              />
            </div>
          )}

          <div>
            <label className="label">{t.auth.password}</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="input"
              placeholder={t.auth.password}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="label">{t.auth.confirmPassword}</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="input"
                placeholder={t.auth.confirmPassword}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {loading ? t.common.loading : (isLogin ? t.auth.loginButton : t.auth.registerButton)}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '', confirmPassword: '', email: '' });
            }}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
          <p>Demo Credentials (for testing):</p>
          <p className="font-mono text-xs mt-1">Username: demo | Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
