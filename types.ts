
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In real app, hash this
  householdId?: string;
  avatarColor: string;
}

export interface Household {
  id: string;
  name: string;
  adminId: string;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'user';
  avatarColor: string;
  relation: string; // 'Pai', 'Mãe', 'Filho', etc.
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  limit: number;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
  memberId: string;
  paymentMethod: string;
  establishment?: string;
  receiptUrl?: string; // Base64 or URL
  items?: MarketItem[];
  isFixed?: boolean; // New flag to identify auto-generated expenses
  fixedExpenseId?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  memberId: string;
  frequency: 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
  nextDueDate: string; // ISO YYYY-MM-DD
  isActive: boolean;
  paymentMethod: string;
}

export interface MarketItem {
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  lastPrice: number;
  history: { date: string; price: number; establishment: string; quantity: number }[];
}

export interface Budget {
  month: string; // YYYY-MM
  totalLimit: number;
}
