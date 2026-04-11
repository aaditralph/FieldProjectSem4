export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'CITIZEN' | 'VENDOR' | 'ADMIN';
  address: string;
}

export interface Request {
  id: string;
  userId: string;
  user?: User;
  address: string;
  contactPhone: string;
  preferredDate: string;
  preferredTimeSlot: string;
  notes?: string;
  imageUrl?: string;
  status: RequestStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  completedAt?: string;
  completedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = 'CREATED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TimeSlot {
  slot: string;
  maxTickets: number;
  bookedTickets: number;
  isActive: boolean;
}

export interface DateSlot {
  id: string;
  date: string;
  timeSlots: TimeSlot[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  date: string;
  timeSlots: {
    slot: string;
    available: number;
    max: number;
  }[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  phone: string;
  otp: string;
}

export interface UpdateRequestStatusPayload {
  status: RequestStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  completedNotes?: string;
}

export interface CreateDateSlotPayload {
  date: string;
  timeSlots: {
    slot: string;
    maxTickets: number;
    bookedTickets?: number;
    isActive?: boolean;
  }[];
}

export interface GenerateSlotsPayload {
  days?: number;
  timeSlots?: string[];
  maxTickets?: number;
}

export interface TicketCount {
  date: string;
  totalTickets: number;
  totalCapacity: number;
  available: number;
  slots: {
    time: string;
    booked: number;
    max: number;
    available: number;
  }[];
}
