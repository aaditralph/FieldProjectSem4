import { create } from 'zustand';
import { auditApi, driveApi, requestApi } from '../api/endpoints';
import { mockApi } from '../api/mock';
import { AuditLog, CreateRequestPayload, Drive, Request, SchedulePayload } from '../types';

interface RequestState {
  requests: Request[];
  currentRequest: Request | null;
  drives: Drive[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  
  fetchRequests: () => Promise<void>;
  fetchRequestById: (id: string) => Promise<void>;
  createRequest: (data: CreateRequestPayload) => Promise<Request>;
  scheduleRequest: (id: string, data: SchedulePayload) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  fetchDrives: () => Promise<void>;
  joinDrive: (id: string) => Promise<void>;
  fetchAuditLogs: (requestId: string) => Promise<void>;
  clearError: () => void;
}

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  currentRequest: null,
  drives: [],
  auditLogs: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.getRequests() };
      } else {
        response = await requestApi.getAll();
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

  scheduleRequest: async (id: string, data: SchedulePayload) => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.scheduleRequest(id, data) };
      } else {
        response = await requestApi.schedule(id, data);
      }
      
      // Update in requests list
      const requests = get().requests.map(req =>
        req.id === id ? response.data : req
      );
      
      set({ requests, currentRequest: response.data, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to schedule request',
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

  joinDrive: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      let response;
      
      if (USE_MOCK) {
        response = { data: await mockApi.joinDrive(id) };
      } else {
        response = await driveApi.join(id);
      }
      
      const drives = get().drives.map(drive =>
        drive.id === id ? response.data : drive
      );
      
      set({ drives, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to join drive',
      });
      throw error;
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
