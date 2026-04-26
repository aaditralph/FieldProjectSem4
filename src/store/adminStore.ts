import { create } from 'zustand';
import { adminApi, requestApi, driveApi } from '../api/endpoints';
import { mockApi } from '../api/mock';
import { Drive, Request, User } from '../types';

interface AdminState {
  driveRequests: Request[];
  vendors: User[];
  isLoading: boolean;
  error: string | null;

  fetchDriveRequests: () => Promise<void>;
  fetchVendors: () => Promise<void>;
  approveDriveRequest: (id: string, vendorId: string) => Promise<Drive>;
  rejectDriveRequest: (id: string) => Promise<Request>;
  clearError: () => void;
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const useAdminStore = create<AdminState>((set, get) => ({
  driveRequests: [],
  vendors: [],
  isLoading: false,
  error: null,

  fetchDriveRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.getDriveRequests() };
      } else {
        response = await adminApi.getDriveRequests();
      }

      set({ driveRequests: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch drive requests',
      });
    }
  },

  fetchVendors: async () => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.getVendors() };
      } else {
        response = await adminApi.getVendors();
      }

      set({ vendors: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch vendors',
      });
    }
  },

   approveDriveRequest: async (id: string, vendorId: string) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.approveDriveRequest(id, vendorId) };
      } else {
        response = await adminApi.approveDriveRequest(id, vendorId);
      }

      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to approve drive request',
      });
      throw error;
    }
  },

  rejectDriveRequest: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.rejectDriveRequest(id) };
      } else {
        response = await adminApi.rejectDriveRequest(id);
      }

      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to reject drive request',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
