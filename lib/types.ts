export interface Transaction {
  id: string;
  date: string;
  desc: string;
  cat: 'income' | 'expense' | 'savings';
  amt: number;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export type Category = 'income' | 'expense' | 'savings';

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
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