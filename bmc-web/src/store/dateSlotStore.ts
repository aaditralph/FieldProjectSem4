import { create } from 'zustand';
import { api } from '../services/api';
import { DateSlot, CreateDateSlotPayload, GenerateSlotsPayload, TicketCount } from '../types';

interface DateSlotState {
  dateSlots: DateSlot[];
  ticketCount: TicketCount | null;
  isLoading: boolean;
  error: string | null;

  fetchDateSlots: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
  createDateSlot: (data: CreateDateSlotPayload) => Promise<void>;
  updateDateSlot: (id: string, data: Partial<CreateDateSlotPayload>) => Promise<void>;
  deleteDateSlot: (id: string) => Promise<void>;
  generateDefaultSlots: (data: GenerateSlotsPayload) => Promise<void>;
  fetchTicketCount: (date: string) => Promise<void>;
  clearError: () => void;
}

export const useDateSlotStore = create<DateSlotState>((set, get) => ({
  dateSlots: [],
  ticketCount: null,
  isLoading: false,
  error: null,

  fetchDateSlots: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getDateSlots(params);
      set({ dateSlots: response, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch date slots',
      });
    }
  },

  createDateSlot: async (data: CreateDateSlotPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.createDateSlot(data);
      set({ 
        dateSlots: [...get().dateSlots, response],
        isLoading: false 
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create date slot',
      });
      throw error;
    }
  },

  updateDateSlot: async (id: string, data: Partial<CreateDateSlotPayload>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.updateDateSlot(id, data);
      const dateSlots = get().dateSlots.map(slot =>
        slot.id === id ? response : slot
      );
      set({ dateSlots, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update date slot',
      });
      throw error;
    }
  },

  deleteDateSlot: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.deleteDateSlot(id);
      const dateSlots = get().dateSlots.filter(slot => slot.id !== id);
      set({ dateSlots, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to delete date slot',
      });
      throw error;
    }
  },

  generateDefaultSlots: async (data: GenerateSlotsPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.generateDefaultSlots(data);
      set({ 
        dateSlots: [...get().dateSlots, ...response.slots],
        isLoading: false 
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to generate slots',
      });
      throw error;
    }
  },

  fetchTicketCount: async (date: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getTicketCount(date);
      set({ ticketCount: response, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch ticket count',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
