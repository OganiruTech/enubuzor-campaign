// src/lib/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [isAuthenticated, setIsAuth]  = useState(false);
  const [isLoadingAuth, setLoading]   = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setIsAuth(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
      setIsAuth(true);
    } catch {
      // Token expired or invalid — clear it silently
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    setUser(response.data.user);
    setIsAuth(true);
    return response.data;
  };

  const register = async (email, password, full_name, phone) => {
    const response = await apiClient.post('/auth/register', { email, password, full_name, phone });
    localStorage.setItem('auth_token', response.data.token);
    setUser(response.data.user);
    setIsAuth(true);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth,
      login, register, logout, checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};