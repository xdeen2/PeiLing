import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../auth/authService';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);

  // Initialize demo accounts on mount
  useEffect(() => {
    authService.initializeDemoAccounts();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-300/30 to-amber-300/30 rounded-full blur-3xl opacity-50 animate-pulse -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-300/30 to-yellow-300/30 rounded-full blur-3xl opacity-50 animate-pulse translate-y-1/2 -translate-x-1/2" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-amber-300/20 to-yellow-300/20 rounded-full blur-2xl opacity-60 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-10 border border-amber-100/50 relative z-10 hover:shadow-amber-200/50 transition-shadow duration-300">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-3xl mb-5 shadow-xl shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 tracking-tight">
            {t.appName}
          </h1>
          <p className="text-gray-600 text-sm font-medium">{t.appSubtitle}</p>
        </div>

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="text-gray-500 text-sm">{isLogin ? t.auth.welcomeBack : t.auth.registerTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.username}</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 outline-none hover:bg-gray-100"
              placeholder={t.auth.username}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.email}</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 outline-none hover:bg-gray-100"
                placeholder={t.auth.email}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.password}</label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 outline-none hover:bg-gray-100"
              placeholder="••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.auth.confirmPassword}</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 outline-none hover:bg-gray-100"
                placeholder="••••••"
              />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-600 hover:via-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <span>{loading ? t.common.loading : (isLogin ? t.auth.loginButton : t.auth.registerButton)}</span>
          </button>
        </form>

        <div className="mt-7 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', password: '', confirmPassword: '', email: '' });
            }}
            className="text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors duration-200 hover:underline"
          >
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}
          </button>
        </div>

        <div className="mt-7 pt-6 border-t border-amber-100/50 text-center">
          <p className="text-gray-500 text-xs font-medium mb-2">{t.auth.demoCredentials || 'Demo Credentials (for testing)'}:</p>
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5 rounded-lg border border-amber-200/50">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">{t.auth.username}:</span>
              <code className="text-xs font-mono font-bold text-amber-700 bg-white/80 px-2 py-1 rounded">jayla</code>
            </div>
            <div className="w-px h-4 bg-amber-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">{t.auth.password}:</span>
              <code className="text-xs font-mono font-bold text-amber-700 bg-white/80 px-2 py-1 rounded">jayla123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
