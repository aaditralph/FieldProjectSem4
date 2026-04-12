import {
  AuditLog,
  AuthResponse,
  CreateRequestPayload,
  DateSlot,
  AvailableSlot,
  LoginRequest,
  Request,
  UpdateRequestStatusPayload,
  CreateDateSlotPayload,
  GenerateSlotsPayload,
  TicketCount,
  User,
} from '../types';
import apiClient from './client';

// Auth endpoints
export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<{ message: string; otp?: string }>('/auth/send-otp', { phone }),
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', data),
  getMe: () =>
    apiClient.get<User>('/auth/me'),
};

// Request endpoints
export const requestApi = {
  create: (data: CreateRequestPayload) =>
    apiClient.post<Request>('/requests', data),
  getAll: (params?: { status?: string; startDate?: string; endDate?: string }) =>
    apiClient.get<Request[]>('/requests', { params }),
  getById: (id: string) =>
    apiClient.get<Request>(`/requests/${id}`),
  updateStatus: (id: string, data: UpdateRequestStatusPayload) =>
    apiClient.put<Request>(`/requests/${id}/status`, data),
  cancel: (id: string) =>
    apiClient.post<Request>(`/requests/${id}/cancel`),
  getAvailableSlots: () =>
    apiClient.get<AvailableSlot[]>('/requests/available-slots'),
};

// Audit endpoints
export const auditApi = {
  getByRequestId: (requestId: string) =>
    apiClient.get<AuditLog[]>(`/audit/request/${requestId}`),
  log: (data: { action: string; actorRole: string; actorId: string; meta?: Record<string, any> }) =>
    apiClient.post<AuditLog>('/audit', data),
};

// Admin endpoints
export const adminApi = {
  getStats: () =>
    apiClient.get<{
      totalRequests: number;
      completedRequests: number;
      pendingRequests: number;
      totalAmount: number;
    }>('/audit/admin/stats'),
  getReports: (period: 'daily' | 'weekly' | 'monthly') =>
    apiClient.get<Array<{ date: string; count: number; amount: number }>>('/audit/admin/reports', {
      params: { period }
    }),
};

// Date Slot endpoints (Admin only)
export const dateSlotApi = {
  getAll: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get<DateSlot[]>('/admin/date-slots', { params }),
  create: (data: CreateDateSlotPayload) =>
    apiClient.post<DateSlot>('/admin/date-slots', data),
  update: (id: string, data: Partial<CreateDateSlotPayload>) =>
    apiClient.put<DateSlot>(`/admin/date-slots/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/admin/date-slots/${id}`),
  generateDefault: (data: GenerateSlotsPayload) =>
    apiClient.post<{ message: string; slots: DateSlot[] }>('/admin/date-slots/generate', data),
  getTicketCount: (date: string) =>
    apiClient.get<TicketCount>('/admin/date-slots/ticket-count', { params: { date } }),
};

// Upload endpoints
export const uploadApi = {
  uploadImage: (formData: FormData) =>
    apiClient.post<{ success: boolean; url: string; filename: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (filename: string) =>
    apiClient.delete(`/upload/${filename}`),
};
