import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role?: 'Customer' | 'Admin';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  driving_license?: string;
  date_of_birth?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('movo_token') || localStorage.getItem('vektor_token');
    const savedUser = localStorage.getItem('movo_user') || localStorage.getItem('vektor_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('movo_token');
        localStorage.removeItem('movo_user');
        localStorage.removeItem('vektor_token');
        localStorage.removeItem('vektor_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { token: newToken, user: newUser } = response.data.data;
    localStorage.setItem('movo_token', newToken);
    localStorage.setItem('movo_user', JSON.stringify(newUser));
    localStorage.setItem('vektor_token', newToken);
    localStorage.setItem('vektor_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser as User;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register(data);
    const { token: newToken, user: newUser } = response.data.data;
    localStorage.setItem('movo_token', newToken);
    localStorage.setItem('movo_user', JSON.stringify(newUser));
    localStorage.setItem('vektor_token', newToken);
    localStorage.setItem('vektor_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser as User;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('movo_token');
    localStorage.removeItem('movo_user');
    localStorage.removeItem('vektor_token');
    localStorage.removeItem('vektor_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('movo_user', JSON.stringify(updatedUser));
    localStorage.setItem('vektor_user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Agent';

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!user, isAdmin, isLoading,
      login, register, logout, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
