import {
    AuditLog,
    Category,
    Condition,
    Drive,
    Pickup,
    PricingConfig,
    Request,
    RequestStatus,
    Role,
    Transaction,
    User
} from '../types';

// Mock data storage
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Citizen',
    phone: '9876543210',
    email: 'john@example.com',
    role: Role.CITIZEN,
    address: '123 Main St, Mumbai',
  },
  {
    id: '2',
    name: 'Vendor One',
    phone: '9876543211',
    email: 'vendor@ewaste.com',
    role: Role.VENDOR,
    address: '456 Market St, Mumbai',
  },
  {
    id: '3',
    name: 'BMC Admin',
    phone: '9876543212',
    email: 'admin@bmc.gov.in',
    role: Role.ADMIN,
    address: 'BMC Headquarters, Mumbai',
  },
];

const mockRequests: Request[] = [
  {
    id: 'req1',
    userId: '1',
    category: Category.MOBILE,
    quantity: 2,
    address: '123 Main St, Mumbai',
    status: RequestStatus.CREATED,
    type: 'HOME_PICKUP',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'req2',
    userId: '1',
    category: Category.LAPTOP,
    quantity: 1,
    address: '123 Main St, Mumbai',
    status: RequestStatus.SCHEDULED,
    type: 'HOME_PICKUP',
    scheduledTime: '2024-12-20T10:00:00Z',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    otp: '1234',
  },
  {
    id: 'drivereq1',
    userId: '1',
    address: 'Community Center, Kandivali',
    scheduledTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: RequestStatus.CREATED,
    type: 'DRIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockDrives: Drive[] = [
  {
    id: 'drive1',
    location: 'Community Center, Andheri',
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    capacity: 100,
    registeredCount: 45,
    registeredUsers: ['1'],
    assignedVendorId: '2',
    creatorId: '1',
    otp: '1234',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drive2',
    location: 'Municipal Office, Bandra',
    date: new Date(Date.now() + 14 * 86400000).toISOString(),
    capacity: 150,
    registeredCount: 80,
    registeredUsers: ['1', '2'],
    assignedVendorId: '2',
    creatorId: '1',
    otp: '5678',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drive3',
    location: 'Cultural Complex, Dadar',
    date: new Date(Date.now() + 21 * 86400000).toISOString(),
    capacity: 200,
    registeredCount: 120,
    registeredUsers: ['1','2','3'],
    assignedVendorId: '2',
    creatorId: '1',
    otp: '9999',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const mockPricing: PricingConfig[] = Object.values(Category).map((category, index) => ({
  id: `price${index}`,
  category,
  ratePerKg: 50 + index * 10,
  conditionFactors: {
    [Condition.WORKING]: 1.0,
    [Condition.PARTIAL]: 0.7,
    [Condition.SCRAP]: 0.4,
  },
}));

const mockAuditLogs: AuditLog[] = [];
const mockPickups: (Pickup & { request: Request })[] = [];
const mockTransactions: Transaction[] = [];

// Helper to generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Mock delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Auth
  sendOtp: async (phone: string) => {
    await delay(500);
    return { message: 'OTP sent successfully. Use 1234 for testing.', otp: '1234' };
  },
  login: async (phone: string, otp: string) => {
    await delay(500);
    // Accept any 4-digit OTP for development
    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      throw new Error('Invalid OTP. Must be 4 digits.');
    }
    const user = mockUsers.find(u => u.phone === phone) || mockUsers[0];
    return {
      token: `mock_token_${user.id}_${Date.now()}`,
      user,
    };
  },
  getMe: async (token: string) => {
    await delay(300);
    const userId = token.split('_')[2];
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  },

  // Requests
  createRequest: async (data: any) => {
    await delay(500);
    const requestType: 'HOME_PICKUP' | 'DRIVE' = data.type || 'HOME_PICKUP';
    const newRequest: Request = {
      id: `req${Date.now()}`,
      userId: '1',
      category: data.category || Category.OTHER,
      quantity: data.quantity || 1,
      address: data.address,
      type: requestType,
      status: RequestStatus.CREATED,
      scheduledTime: data.scheduledTime,
      driveId: data.driveId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockRequests.push(newRequest);
    return newRequest;
  },
  getRequests: async (params?: any) => {
    await delay(300);
    let requests = [...mockRequests];
    if (params?.status) {
      requests = requests.filter(r => r.status === params.status);
    }
    return requests;
  },
  getRequestById: async (id: string) => {
    await delay(300);
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error('Request not found');
    return request;
  },
  scheduleRequest: async (id: string, data: any) => {
    await delay(500);
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error('Request not found');
    request.status = RequestStatus.SCHEDULED;
    request.scheduledTime = `${data.date}T${data.timeSlot}`;
    request.otp = generateOTP();
    request.updatedAt = new Date().toISOString();
    return request;
  },
  cancelRequest: async (id: string) => {
    await delay(500);
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error('Request not found');
    request.status = RequestStatus.CANCELLED;
    request.updatedAt = new Date().toISOString();
    return request;
  },

  // Drives
  getDrives: async () => {
    await delay(300);
    return mockDrives;
  },
  createDrive: async (data: any) => {
    await delay(500);
    const newDrive: Drive = {
      id: `drive${Date.now()}`,
      ...data,
      registeredCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockDrives.push(newDrive);
    return newDrive;
  },
  joinDrive: async (id: string) => {
    await delay(500);
    const drive = mockDrives.find(d => d.id === id);
    if (!drive) throw new Error('Drive not found');
    if (!drive.registeredUsers) drive.registeredUsers = [];
    const userId = '1'; // mock: current user is '1'
    if (drive.registeredUsers.includes(userId)) {
      throw new Error('Already registered for this drive');
    }
    if (drive.registeredCount >= drive.capacity) {
      throw new Error('Drive is full');
    }
    drive.registeredUsers.push(userId);
    drive.registeredCount += 1;
    return drive;
  },

  // Vendor drives
  getVendorDrives: async () => {
    await delay(300);
    const vendorId = '2'; // mock: current vendor is '2'
    return mockDrives.filter(d => d.assignedVendorId === vendorId && !d.completed);
  },
  completeDrive: async (id: string, data: { otp: string }) => {
    await delay(500);
    const drive = mockDrives.find(d => d.id === id);
    if (!drive) throw new Error('Drive not found');
    if (drive.otp !== data.otp) {
      throw new Error('Invalid OTP');
    }
    drive.completed = true;
    drive.completedAt = new Date();
    return drive;
  },
  completeDrive: async (id: string) => {
    await delay(500);
    const drive = mockDrives.find(d => d.id === id);
    if (!drive) throw new Error('Drive not found');
    drive.completed = true;
    drive.completedAt = new Date().toISOString();
    return drive;
  },

  // Drive request admin functions
  getDriveRequests: async () => {
    await delay(300);
    return mockRequests.filter(r => r.type === 'DRIVE');
  },
  approveDriveRequest: async (id: string, vendorId: string) => {
    await delay(500);
    const req = mockRequests.find(r => r.id === id);
    if (!req) throw new Error('Request not found');
    if (req.type !== 'DRIVE') throw new Error('Not a drive request');
    if (req.status !== 'CREATED') throw new Error('Drive request cannot be approved');

    // Create drive
    const drive: Drive = {
      id: `drive${Date.now()}`,
      location: req.address,
      date: req.scheduledTime,
      capacity: 100,
      registeredCount: 1,
      registeredUsers: [req.userId],
      assignedVendorId: vendorId,
      createdAt: new Date().toISOString(),
    };
    mockDrives.push(drive);

    // Update request
    req.driveId = drive.id;
    req.assignedVendorId = vendorId;
    req.status = 'SCHEDULED';

    return drive;
  },
  rejectDriveRequest: async (id: string) => {
    await delay(500);
    const req = mockRequests.find(r => r.id === id);
    if (!req) throw new Error('Request not found');
    if (req.type !== 'DRIVE') throw new Error('Not a drive request');
    if (req.status !== 'CREATED') throw new Error('Drive request cannot be rejected');
    req.status = 'REJECTED';
    return req;
  },

  // Vendor
  getPickups: async () => {
    await delay(300);
    return mockPickups;
  },
  getPickupById: async (id: string) => {
    await delay(200);
    const pickup = mockPickups.find(p => p.id === id);
    if (!pickup) throw new Error('Pickup not found');
    return pickup;
  },
  completePickup: async (id: string, data: any) => {
    await delay(500);
    const pickup = mockPickups.find(p => p.id === id);
    if (!pickup) throw new Error('Pickup not found');
    if (pickup.otp !== data.otp) {
      throw new Error('Invalid OTP');
    }
    pickup.weight = data.weight;
    pickup.condition = data.condition;
    pickup.completedAt = new Date().toISOString();
    return pickup;
  },

  // Pricing
  getPricing: async () => {
    await delay(300);
    return mockPricing;
  },
  updatePricing: async (data: any) => {
    await delay(500);
    const pricing = mockPricing.find(p => p.category === data.category);
    if (!pricing) throw new Error('Pricing config not found');
    pricing.ratePerKg = data.ratePerKg;
    if (data.conditionFactors) {
      if (data.conditionFactors.working) pricing.conditionFactors.WORKING = data.conditionFactors.working;
      if (data.conditionFactors.partial) pricing.conditionFactors.PARTIAL = data.conditionFactors.partial;
      if (data.conditionFactors.scrap) pricing.conditionFactors.SCRAP = data.conditionFactors.scrap;
    }
    return pricing;
  },

  // Audit
  logAudit: async (data: any) => {
    await delay(300);
    const log: AuditLog = {
      id: `audit${Date.now()}`,
      ...data,
      timestamp: new Date().toISOString(),
    };
    mockAuditLogs.push(log);
    return log;
  },
  getAuditLogs: async (requestId: string) => {
    await delay(300);
    return mockAuditLogs.filter(log => log.meta?.requestId === requestId);
  },

  // Admin
  getStats: async () => {
    await delay(300);
    return {
      totalRequests: mockRequests.length,
      completedRequests: mockRequests.filter(r => r.status === RequestStatus.COMPLETED).length,
      pendingRequests: mockRequests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.CANCELLED).length,
      totalAmount: mockTransactions.reduce((sum, t) => sum + t.amount, 0),
    };
  },
  getReports: async (period: string) => {
    await delay(300);
    const reports = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      reports.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20),
        amount: Math.floor(Math.random() * 5000),
      });
    }
    return reports;
  },
};
