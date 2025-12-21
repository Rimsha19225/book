import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface User {
  user_id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      // Token might be expired or invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token, user } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Set user
      setUser(user);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { email, name, password });
      const { access_token, refresh_token, user } = response.data;

      // Store tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Set user
      setUser(user);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens and user data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);

    // Remove authorization header
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};