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
  userId: string;
  category: Category;
  quantity: number;
  address: string;
  status: RequestStatus;
  scheduledTime?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
  assignedVendorId?: string;
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
  category: Category;
  quantity: number;
  address: string;
  imageUrls?: string[];
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
  finalPrice?: number;
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
