export enum Role {
  CITIZEN = 'CITIZEN',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
}

export enum RequestStatus {
  CREATED = 'CREATED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export enum Category {
  MOBILE = 'Mobile Phone',
  LAPTOP = 'Laptop',
  COMPUTER = 'Desktop Computer',
  TV = 'Television',
  PRINTER = 'Printer',
  BATTERY = 'Battery',
  OTHER = 'Other Electronics',
}

export enum Condition {
  WORKING = 'WORKING',
  PARTIAL = 'PARTIAL',
  SCRAP = 'SCRAP',
}
