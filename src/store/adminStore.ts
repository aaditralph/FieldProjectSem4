import { create } from 'zustand';
import { adminApi, driveApi, pricingApi } from '../api/endpoints';
import { mockApi } from '../api/mock';
import { CreateDrivePayload, Drive, PricingConfig, UpdatePricingPayload } from '../types';

interface AdminState {
  drives: Drive[];
  pricingConfigs: PricingConfig[];
  stats: {
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    totalAmount: number;
  } | null;
  reports: Array<{ date: string; count: number; amount: number }>;
  isLoading: boolean;
  error: string | null;
  
  fetchDrives: () => Promise<void>;
  createDrive: (data: CreateDrivePayload) => Promise<void>;
  updateDrive: (id: string, data: Partial<CreateDrivePayload>) => Promise<void>;
  deleteDrive: (id: string) => Promise<void>;
  fetchPricing: () => Promise<void>;
  updatePricing: (data: UpdatePricingPayload) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchReports: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  clearError: () => void;
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const useAdminStore = create<AdminState>((set, get) => ({
  drives: [],
  pricingConfigs: [],
  stats: null,
  reports: [],
  isLoading: false,
  error: null,

  fetchDrives: async () => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.getDrives() };
      } else {
        response = await driveApi.getAll();
      }
      
      set({ drives: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch drives',
      });
    }
  },

  createDrive: async (data: CreateDrivePayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await driveApi.create(data);
      const drives = [...get().drives, response.data];
      set({ drives, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create drive',
      });
      throw error;
    }
  },

  updateDrive: async (id: string, data: Partial<CreateDrivePayload>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await driveApi.update(id, data);
      const drives = get().drives.map(drive =>
        drive.id === id ? response.data : drive
      );
      set({ drives, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update drive',
      });
      throw error;
    }
  },

  deleteDrive: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await driveApi.delete(id);
      const drives = get().drives.filter(drive => drive.id !== id);
      set({ drives, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete drive',
      });
      throw error;
    }
  },

  fetchPricing: async () => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.getPricing() };
      } else {
        response = await pricingApi.getAll();
      }
      
      set({ pricingConfigs: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch pricing',
      });
    }
  },

  updatePricing: async (data: UpdatePricingPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await pricingApi.update(data);
      const pricingConfigs = get().pricingConfigs.map(config =>
        config.category === data.category ? response.data : config
      );
      set({ pricingConfigs, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update pricing',
      });
      throw error;
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.getStats() };
      } else {
        response = await adminApi.getStats();
      }
      
      set({ stats: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch stats',
      });
    }
  },

  fetchReports: async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.getReports(period) };
      } else {
        response = await adminApi.getReports(period);
      }
      
      set({ reports: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch reports',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
