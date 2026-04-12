import { create } from 'zustand';
import { api } from '../services/api';
import { Request, RequestStatus, UpdateRequestStatusPayload } from '../types';

interface RequestState {
  requests: Request[];
  currentRequest: Request | null;
  isLoading: boolean;
  error: string | null;

  fetchRequests: (params?: { status?: string; startDate?: string; endDate?: string }) => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  updateRequestStatus: (id: string, data: UpdateRequestStatusPayload) => Promise<void>;
  clearError: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  currentRequest: null,
  isLoading: false,
  error: null,

  fetchRequests: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getRequests(params);
      // Map _id to id for frontend compatibility
      const mappedRequests = response.map((req: any) => ({
        ...req,
        id: req._id || req.id,
      }));
      set({ requests: mappedRequests, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch requests',
      });
    }
  },

  fetchRequestById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.getRequestById(id);
      // Map _id to id for frontend compatibility
      const mappedRequest = {
        ...response,
        id: response._id || response.id,
      };
      set({ currentRequest: mappedRequest, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch request',
      });
    }
  },

  updateRequestStatus: async (id: string, data: UpdateRequestStatusPayload) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.updateRequestStatus(id, data);
      
      // Map _id to id for frontend compatibility
      const mappedResponse = {
        ...response,
        id: response._id || response.id,
      };
      
      // Update in requests list
      const requests = get().requests.map(req =>
        req.id === id ? mappedResponse : req
      );

      set({ requests, currentRequest: mappedResponse, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update request status',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
