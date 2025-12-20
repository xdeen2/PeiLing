import { createContext, useContext, useState, ReactNode } from 'react';
import { authService, User } from '../auth/authService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  const login = async (username: string, password: string) => {
    const result = authService.login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, message: result.message };
  };

  const register = async (username: string, password: string, email: string) => {
    const result = authService.register(username, password, email);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, message: result.message };
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    // Reload to clear any cached data
    window.location.reload();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
