export type UserRole = 'ADMIN' | 'CAISSE' | 'CUISINE' | 'BAR' | 'CUSTOMER';

export interface User {
  publicId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  firstLogin?: boolean;
  active?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Product {
  publicId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  available: boolean;
}

export interface MenuItem {
  publicId: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  available: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  tableId?: string;
  status: 'EN_ATTENTE' | 'ACCEPTEE' | 'EN_PREPARATION' | 'PRETE' | 'LIVREE' | 'PAYEE';
  items: OrderItem[];
  totalAmount: number;
  discount?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt?: Date;
}

export interface CustomerSession {
  sessionId: string;
  customerName?: string;
  customerPhone?: string;
  tableId?: string;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  sessionId: string;
  totalAmount: number;
  subtotal: number;
  discount?: number;
  tax: number;
  status: 'PENDING' | 'PAID';
  createdAt: Date;
}

export interface Stock {
  id: string;
  productId: string;
  currentQuantity: number;
  unitOfMeasure: string;
  alertThreshold: number;
  minimumQuantity: number;
}

export interface DailySalesReport {
  date?: string;
  revenue?: number;
  totalRevenue?: number;
  orderCount?: number;
  totalOrders?: number;
  averageOrderValue?: number;
  topProducts?: { name: string; quantity: number }[];
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  qrCodeUrl?: string;
}
