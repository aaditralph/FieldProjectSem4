import {
    AuditLog,
    AuthResponse,
    CompletePickupPayload,
    CreateDrivePayload,
    CreateRequestPayload,
    Drive,
    LoginRequest,
    Pickup,
    PricingConfig,
    Request,
    SchedulePayload,
    Transaction,
    UpdatePricingPayload,
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
    apiClient.get<User>('/me'),
};

// Request endpoints
export const requestApi = {
  create: (data: CreateRequestPayload) => 
    apiClient.post<Request>('/requests', data),
  getAll: (params?: { status?: string; page?: number }) => 
    apiClient.get<Request[]>('/requests', { params }),
  getById: (id: string) => 
    apiClient.get<Request>(`/requests/${id}`),
  schedule: (id: string, data: SchedulePayload) => 
    apiClient.post<Request>(`/requests/${id}/schedule`, data),
  cancel: (id: string) => 
    apiClient.post<Request>(`/requests/${id}/cancel`),
};

// Drive endpoints
export const driveApi = {
  getAll: () => 
    apiClient.get<Drive[]>('/drives'),
  create: (data: CreateDrivePayload) => 
    apiClient.post<Drive>('/drives', data),
  join: (id: string) => 
    apiClient.post<Drive>(`/drives/${id}/join`),
  update: (id: string, data: Partial<CreateDrivePayload>) => 
    apiClient.put<Drive>(`/drives/${id}`, data),
  delete: (id: string) => 
    apiClient.delete(`/drives/${id}`),
};

// Vendor endpoints
export const vendorApi = {
  getPickups: () => 
    apiClient.get<(Pickup & { request: Request })[]>('/vendor/pickups'),
  getPickupById: (id: string) => 
    apiClient.get<Pickup & { request: Request }>(`/vendor/pickups/${id}`),
  completePickup: (id: string, data: CompletePickupPayload) => 
    apiClient.post<Pickup>(`/vendor/pickups/${id}/complete`, data),
  getDrives: () =>
    apiClient.get<Drive[]>('/vendor/drives'),
  completeDrive: (id: string, data: { otp: string }) =>
    apiClient.post<Drive>(`/vendor/drives/${id}/complete`, data),
};

// Transaction endpoints
export const transactionApi = {
  getByRequestId: (requestId: string) => 
    apiClient.get<Transaction>(`/transactions/request/${requestId}`),
  markPaid: (id: string, upiRef: string) => 
    apiClient.post<Transaction>(`/transactions/${id}/mark-paid`, { upiRef }),
};

// Audit endpoints
export const auditApi = {
  getByRequestId: (requestId: string) => 
    apiClient.get<AuditLog[]>(`/audit/request/${requestId}`),
  log: (data: { action: string; actorRole: string; actorId: string; meta?: Record<string, any> }) => 
    apiClient.post<AuditLog>('/audit', data),
};

// Pricing endpoints
export const pricingApi = {
  getAll: () => 
    apiClient.get<PricingConfig[]>('/pricing'),
  update: (data: UpdatePricingPayload) => 
    apiClient.put<PricingConfig>('/pricing', data),
};

// Admin endpoints
export const adminApi = {
  getStats: () => 
    apiClient.get<{
      totalRequests: number;
      completedRequests: number;
      pendingRequests: number;
      totalAmount: number;
    }>('/admin/stats'),
  getReports: (period: 'daily' | 'weekly' | 'monthly') => 
    apiClient.get<Array<{ date: string; count: number; amount: number }>>('/admin/reports', { 
      params: { period } 
    }),
  getVendors: () => 
    apiClient.get<User[]>('/admin/vendors'),
  getDriveRequests: () => 
    apiClient.get<Request[]>('/admin/drive-requests'),
  approveDriveRequest: (id: string, vendorId: string) => 
    apiClient.post<Drive>(`/admin/drive-requests/${id}/approve`, { vendorId }),
  rejectDriveRequest: (id: string) => 
    apiClient.post<Request>(`/admin/drive-requests/${id}/reject`),
};
