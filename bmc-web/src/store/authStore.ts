import { create } from 'zustand';
import { api } from '../services/api';
import { User, LoginRequest } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  sendOtp: (phone: string) => Promise<string | undefined>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  sendOtp: async (phone: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.sendOtp(phone);
      set({ isLoading: false });
      
      // For demo: return the OTP if provided
      if (response.otp) {
        return response.otp;
      }
      return '1234'; // Default OTP for testing
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to send OTP' });
      throw error;
    }
  },

  login: async (data: LoginRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.login(data);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      set({ 
        token: response.token,
        user: response.user,
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Invalid OTP. Please try again.' 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        set({ token, user, isAuthenticated: true });
        
        // Verify token is still valid
        await api.getMe();
      } catch (error) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
