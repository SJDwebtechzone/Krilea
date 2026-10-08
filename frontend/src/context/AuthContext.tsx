import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('krilea_token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('krilea_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      localStorage.removeItem('krilea_token');
      localStorage.removeItem('krilea_refresh_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string): Promise<User> => {
    const res = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', { identifier, password });

    localStorage.setItem('krilea_token', res.accessToken);
    localStorage.setItem('krilea_refresh_token', res.refreshToken);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> => {
    const res = await api.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', data);

    localStorage.setItem('krilea_token', res.accessToken);
    localStorage.setItem('krilea_refresh_token', res.refreshToken);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('krilea_token');
    localStorage.removeItem('krilea_refresh_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; phone?: string }) => {
    const updated = await api.put<User>('/auth/profile', data);
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
