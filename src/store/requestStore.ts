import { create } from 'zustand';
import { auditApi, requestApi } from '../api/endpoints';
import { mockApi } from '../api/mock';
import { AuditLog, CreateRequestPayload, Request, UpdateRequestStatusPayload, AvailableSlot } from '../types';

interface RequestState {
  requests: Request[];
  currentRequest: Request | null;
  auditLogs: AuditLog[];
  availableSlots: AvailableSlot[];
  isLoading: boolean;
  error: string | null;

  fetchRequests: (params?: { status?: string; startDate?: string; endDate?: string }) => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: CreateRequestPayload) => Promise<Request>;
  updateRequestStatus: (id: string, data: UpdateRequestStatusPayload) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  fetchAvailableSlots: () => Promise<void>;
  fetchAuditLogs: (requestId: string) => Promise<void>;
  clearError: () => void;
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  currentRequest: null,
  auditLogs: [],
  availableSlots: [],
  isLoading: false,
  error: null,

  fetchRequests: async (params) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.getRequests() };
      } else {
        response = await requestApi.getAll(params);
      }

      set({ requests: response.data, isLoading: false });
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
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.getRequestById(id) };
      } else {
        response = await requestApi.getById(id);
      }

      set({ currentRequest: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch request',
      });
    }
  },

  createRequest: async (data: CreateRequestPayload) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.createRequest(data) };
      } else {
        response = await requestApi.create(data);
      }

      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create request',
      });
      throw error;
    }
  },

  updateRequestStatus: async (id: string, data: UpdateRequestStatusPayload) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.updateRequestStatus?.(id, data) || {} };
      } else {
        response = await requestApi.updateStatus(id, data);
      }

      // Update in requests list
      const requests = get().requests.map(req =>
        req.id === id ? response.data : req
      );

      set({ requests, currentRequest: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update request status',
      });
      throw error;
    }
  },

  cancelRequest: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.cancelRequest(id) };
      } else {
        response = await requestApi.cancel(id);
      }

      const requests = get().requests.map(req =>
        req.id === id ? response.data : req
      );

      set({ requests, currentRequest: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to cancel request',
      });
      throw error;
    }
  },

  fetchAvailableSlots: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await requestApi.getAvailableSlots();
      set({ availableSlots: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch available slots',
      });
    }
  },

  fetchAuditLogs: async (requestId: string) => {
    try {
      set({ isLoading: true, error: null });
      let response;

      if (USE_MOCK) {
        response = { data: await mockApi.getAuditLogs(requestId) };
      } else {
        response = await auditApi.getByRequestId(requestId);
      }

      set({ auditLogs: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch audit logs',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
