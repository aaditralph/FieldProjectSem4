import { Category, Condition, RequestStatus, Role, TransactionStatus } from './enums';

export { Category, Condition, RequestStatus, Role, TransactionStatus };

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  address: string;
}

export interface Request {
  id: string;
  userId: string | { _id: string; name: string; phone?: string; address?: string };
  category?: Category;
  quantity: number;
  address: string;
  status: RequestStatus;
  type: 'HOME_PICKUP' | 'DRIVE';
  scheduledTime?: string;
  imageUrl?: string;
  driveId?: string;
  assignedVendorId?: string | { _id: string; name?: string; phone?: string };
  createdAt: string;
  updatedAt: string;
  otp?: string;
}

export interface Pickup {
  id: string;
  requestId: string;
  otp: string;
  weight: number;
  condition: Condition;
  completedAt?: string;
  finalPrice?: number;
}

export interface Transaction {
  id: string;
  requestId: string;
  amount: number;
  status: TransactionStatus;
  upiRef?: string;
  createdAt: string;
}

export interface Drive {
  id: string;
  location: string;
  date: string;
  capacity: number;
  registeredCount: number;
  registeredUsers: any[]; // populated User objects
  assignedVendorId?: any; // populated vendor object
  creatorId?: any; // populated creator object
  otp?: string;
  completed?: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorRole: Role;
  actorId: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface PricingConfig {
  id: string;
  category: Category;
  ratePerKg: number;
  conditionFactors: {
    [Condition.WORKING]: number;
    [Condition.PARTIAL]: number;
    [Condition.SCRAP]: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  phone: string;
  otp: string;
}

export interface CreateRequestPayload {
  category?: Category;
  quantity: number;
  address: string;
  imageUrl?: string;
  type: 'HOME_PICKUP' | 'DRIVE';
  driveId?: string;
  scheduledTime?: string;
}

export interface SchedulePayload {
  timeSlot: string;
  date: string;
}

export interface CompletePickupPayload {
  otp: string;
  weight: number;
  condition: Condition;
}

export interface CreateDrivePayload {
  location: string;
  date: string;
  capacity: number;
}

export interface UpdatePricingPayload {
  category: Category;
  ratePerKg: number;
  conditionFactors?: {
    working?: number;
    partial?: number;
    scrap?: number;
  };
}
