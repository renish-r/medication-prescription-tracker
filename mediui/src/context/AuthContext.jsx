import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'medimanager_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (!data.success || !data.token) throw new Error(data.message || 'Login failed');
    setUser({ token: data.token, role: data.role ? data.role.toUpperCase() : undefined, email });
    return data;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: payload,
    });
    if (!data.success) throw new Error(data.message || 'Signup failed');
    return data;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = {
    user,
    isAuthed: !!user?.token,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
