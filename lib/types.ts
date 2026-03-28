export interface Transaction {
  id: string;
  date: string;
  desc: string;
  cat: 'income' | 'expense' | 'savings';
  amt: number;
  /** 投资相关流水（与日常储蓄/支出分账） */
  isInvestment?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export type Category = 'income' | 'expense' | 'savings';

/** Monthly aggregates for charts (category = income | expense | savings). */
export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

export interface BreakdownSlice {
  name: string;
  value: number;
  color: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}