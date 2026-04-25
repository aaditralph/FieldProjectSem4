import * as SecureStore from '../utils/storage';
import { create } from 'zustand';
import { authApi } from '../api/endpoints';
import { mockApi } from '../api/mock';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (phone: string, password?: string) => Promise<void>;
  signup: (data: import('../types').SignupRequest) => Promise<void>;
  sendOtp: (phone: string, action?: string) => Promise<string>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  sendOtp: async (phone: string, action?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      let otp: string;
      if (USE_MOCK) {
        const response = await mockApi.sendOtp(phone);
        otp = response.otp || '';
      } else {
        const response = await authApi.sendOtp(phone, action);
        otp = response.data.otp || '';
      }
      
      set({ isLoading: false });
      return otp;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Failed to send OTP' 
      });
      throw error;
    }
  },

  login: async (phone: string, password?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      let response;
      if (USE_MOCK) {
        response = { data: await mockApi.login(phone, password) };
      } else {
        response = await authApi.login({ phone, password });
      }
      
      const { token, user } = response.data;
      
      // Store token securely
      await SecureStore.setItemAsync('auth_token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      });
      throw error;
    }
  },

  signup: async (data: import('../types').SignupRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      let response;
      if (USE_MOCK) {
        response = { data: await mockApi.signup(data) };
      } else {
        response = await authApi.signup(data);
      }
      
      const { token, user } = response.data;
      
      await SecureStore.setItemAsync('auth_token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || error.message || 'Signup failed' 
      });
      throw error;
    }
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      
      if (!token) {
        set({ isAuthenticated: false });
        return;
      }
      
      let response;
      if (USE_MOCK) {
        response = { data: await mockApi.getMe(token) };
      } else {
        response = await authApi.getMe();
      }
      
      set({
        user: response.data,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
