import { create } from 'zustand';
import { vendorApi } from '../api/endpoints';
import { CompletePickupPayload, Pickup, Request, Transaction } from '../types';

interface VendorState {
  pickups: Request[];
  currentPickup: Request | null;
  completionResult: { pickup: Pickup; transaction: Transaction; finalPrice: number } | null;
  isLoading: boolean;
  error: string | null;
  
  fetchPickups: () => Promise<void>;
  fetchPickupById: (id: string) => Promise<void>;
  completePickup: (id: string, data: CompletePickupPayload) => Promise<void>;
  clearError: () => void;
  clearCompletionResult: () => void;
}

export const useVendorStore = create<VendorState>((set, get) => ({
  pickups: [],
  currentPickup: null,
  completionResult: null,
  isLoading: false,
  error: null,

  fetchPickups: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await vendorApi.getPickups();
      set({ pickups: response.data as any, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch pickups',
      });
    }
  },

  fetchPickupById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await vendorApi.getPickupById(id);
      set({ currentPickup: response.data as any, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch pickup',
      });
    }
  },

  completePickup: async (id: string, data: CompletePickupPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await vendorApi.completePickup(id, data);
      
      set({
        completionResult: response.data as any,
        isLoading: false,
      });
      
      // Refresh pickups list
      get().fetchPickups();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to complete pickup',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearCompletionResult: () => set({ completionResult: null }),
}));
