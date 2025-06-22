import { create } from 'zustand';
import { authAPI } from '../lib/api';
import { toast } from 'react-toastify';

interface User {
  id: number;
  email: string;
  full_name?: string;
  is_admin: boolean;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login({ username: email, password });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      set({ 
        user, 
        token: access_token, 
        isLoading: false,
        isAuthenticated: true 
      });
      
      // Show admin status if applicable
      if (user.is_admin) {
        toast.success('Welcome back, Admin!');
      } else {
        toast.success('Login successful!');
      }
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.detail || 'Invalid email or password';
      toast.error(errorMessage);
      throw error;
    }
  },

  register: async (email, password, full_name) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register({ email, password, full_name });
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      set({ 
        user, 
        token: access_token, 
        isLoading: false,
        isAuthenticated: true 
      });
      toast.success('Registration successful!');
    } catch (error: any) {
      set({ isLoading: false });
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    toast.info('Logged out successfully');
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const response = await authAPI.getMe();
      set({ 
        user: response.data, 
        isAuthenticated: true 
      });
    } catch (error) {
      localStorage.removeItem('token');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      });
    }
  },
}));