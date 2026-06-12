'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'SuperAdmin' | string;
  usernameSlug: string;
  profileId: string | null;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, departmentId: string, usernameSlug: string, registrationNumber?: string, role?: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('mcc_token');
    const savedUser = localStorage.getItem('mcc_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing stored user data', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;

      localStorage.setItem('mcc_token', token);
      localStorage.setItem('mcc_user', JSON.stringify(userData));
      Cookies.set('mcc_token', token, { expires: 7 });

      setToken(token);
      setUser(userData);

      if (userData.role === 'SuperAdmin' || userData.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    } catch (error: any) {
      setLoading(false);
      throw error.response?.data?.message || 'Login failed. Please verify credentials.';
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    departmentId: string,
    usernameSlug: string,
    registrationNumber?: string,
    role?: string
  ) => {
    setLoading(true);
    try {
      const resolvedRole = role || 'Student';
      const payload = {
        name,
        email,
        password,
        departmentId: resolvedRole === 'Student' ? (departmentId || undefined) : undefined,
        usernameSlug: resolvedRole === 'Student' ? (usernameSlug || undefined) : undefined,
        registrationNumber: resolvedRole === 'Student' ? (registrationNumber || '') : undefined,
        role: resolvedRole,
      };
      console.log('Sending registration payload:', payload);
      const response = await api.post('/api/auth/register', payload);

      if (response.data && response.data.requiresApproval) {
        return response.data;
      }

      const { token, user: userData } = response.data;

      localStorage.setItem('mcc_token', token);
      localStorage.setItem('mcc_user', JSON.stringify(userData));
      Cookies.set('mcc_token', token, { expires: 7 });

      setToken(token);
      setUser(userData);

      if (userData.role === 'SuperAdmin' || userData.role === 'Admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
      return response.data;
    } catch (error: any) {
      setLoading(false);
      const serverError = error.response?.data;
      let errorMsg = 'Registration failed. Try again.';
      if (serverError) {
        if (serverError.message) {
          errorMsg = serverError.message;
        } else if (serverError.errors) {
          const errorDetails = Object.values(serverError.errors).flat().join(' ');
          errorMsg = `${serverError.title || 'Validation Error'}: ${errorDetails}`;
        }
      }
      throw errorMsg;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mcc_token');
    localStorage.removeItem('mcc_user');
    Cookies.remove('mcc_token');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/StudentProfile/me');
      const profileData = response.data;
      if (profileData && user) {
        const updatedUser = {
          ...user,
          name: profileData.user?.name || user.name,
          email: profileData.user?.email || user.email,
          usernameSlug: profileData.usernameSlug || user.usernameSlug,
          profileId: profileData.id,
        };
        setUser(updatedUser);
        localStorage.setItem('mcc_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user profile information', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
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
