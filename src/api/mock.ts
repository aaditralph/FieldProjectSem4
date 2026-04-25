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
    items: [{ category: Category.MOBILE, quantity: 2 }],
    address: '123 Main St, Mumbai',
    type: 'HOME_PICKUP',
    status: RequestStatus.CREATED,
    imageUrls: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'req2',
    userId: '1',
    items: [{ category: Category.LAPTOP, quantity: 1 }],
    address: '123 Main St, Mumbai',
    type: 'HOME_PICKUP',
    status: RequestStatus.SCHEDULED,
    scheduledTime: '2024-12-20T10:00:00Z',
    imageUrls: ['example-image.jpg'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    otp: '1234',
  },
];

const mockDrives: Drive[] = [
  {
    id: 'drive1',
    location: 'Community Center, Andheri',
    date: '2024-12-25',
    capacity: 100,
    registeredCount: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'drive2',
    location: 'Municipal Office, Bandra',
    date: '2024-12-28',
    capacity: 150,
    registeredCount: 80,
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
  login: async (phone: string, password?: string) => {
    await delay(500);
    // Allow '123456' as a generic password for demo or any existing user
    if (password && password.length < 6) {
      throw new Error('Invalid password. Must be at least 6 characters.');
    }
    const user = mockUsers.find(u => u.phone === phone) || mockUsers[0];
    return {
      token: `mock_token_${user.id}_${Date.now()}`,
      user,
    };
  },
  signup: async (data: any) => {
    await delay(500);
    if (data.otp !== '1234') {
      throw new Error('Invalid OTP. Must be 1234.');
    }
    const newUser: User = {
      id: `new_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      role: Role.CITIZEN,
      address: data.address,
    };
    mockUsers.push(newUser);
    return {
      token: `mock_token_${newUser.id}_${Date.now()}`,
      user: newUser,
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
    const newRequest: Request = {
      id: `req${Date.now()}`,
      userId: '1',
      ...data,
      status: RequestStatus.CREATED,
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

  uploadImages: async (id: string, formData: any) => {
    await delay(500);
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error('Request not found');
    
    if (!request.imageUrls) {
      request.imageUrls = [];
    }
    
    // Simulate uploaded images with sample filenames
    const newImages = [`uploaded_${Date.now()}_1.jpg`, `uploaded_${Date.now()}_2.jpg`];
    request.imageUrls.push(...newImages);
    request.updatedAt = new Date().toISOString();
    
    return {
      message: 'Images uploaded successfully',
      imageUrls: request.imageUrls,
      newImages: newImages,
    };
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
    if (drive.registeredCount >= drive.capacity) {
      throw new Error('Drive is full');
    }
    drive.registeredCount += 1;
    return drive;
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
    pickup.evaluatedItems = data.evaluatedItems || [];
    pickup.finalPrice = data.finalPrice;
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
