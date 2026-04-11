import axios, { AxiosInstance } from 'axios';
import { AuthResponse, LoginRequest, Request, UpdateRequestStatusPayload, DateSlot, CreateDateSlotPayload, GenerateSlotsPayload, TicketCount, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async sendOtp(phone: string): Promise<{ otp?: string }> {
    const response = await this.client.post('/auth/send-otp', { phone });
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Requests
  async getRequests(params?: { status?: string; startDate?: string; endDate?: string }): Promise<Request[]> {
    const response = await this.client.get('/requests', { params });
    return response.data;
  }

  async getRequestById(id: string): Promise<Request> {
    const response = await this.client.get(`/requests/${id}`);
    return response.data;
  }

  async updateRequestStatus(id: string, data: UpdateRequestStatusPayload): Promise<Request> {
    const response = await this.client.put(`/requests/${id}/status`, data);
    return response.data;
  }

  // Date Slots
  async getDateSlots(params?: { startDate?: string; endDate?: string }): Promise<DateSlot[]> {
    const response = await this.client.get('/admin/date-slots', { params });
    return response.data;
  }

  async createDateSlot(data: CreateDateSlotPayload): Promise<DateSlot> {
    const response = await this.client.post('/admin/date-slots', data);
    return response.data;
  }

  async updateDateSlot(id: string, data: Partial<CreateDateSlotPayload>): Promise<DateSlot> {
    const response = await this.client.put(`/admin/date-slots/${id}`, data);
    return response.data;
  }

  async deleteDateSlot(id: string): Promise<void> {
    await this.client.delete(`/admin/date-slots/${id}`);
  }

  async generateDefaultSlots(data: GenerateSlotsPayload): Promise<{ message: string; slots: DateSlot[] }> {
    const response = await this.client.post('/admin/date-slots/generate', data);
    return response.data;
  }

  async getTicketCount(date: string): Promise<TicketCount> {
    const response = await this.client.get('/admin/date-slots/ticket-count', { params: { date } });
    return response.data;
  }

  // Stats
  async getStats(): Promise<{
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    totalAmount: number;
  }> {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }
}

export const api = new ApiService();
