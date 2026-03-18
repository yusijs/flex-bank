import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const TOKEN_KEY = 'auth_token';
const IS_ELECTRON = typeof window !== 'undefined' && window.electronAPI !== undefined;

interface AuthContextValue {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (IS_ELECTRON) return 'electron';
    return localStorage.getItem(TOKEN_KEY);
  });

  const login = useCallback((t: string) => {
    if (IS_ELECTRON) return;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    if (IS_ELECTRON) return;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: token !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
