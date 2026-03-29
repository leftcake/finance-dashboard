export interface Transaction {
  id: string;
  /** Calendar day (YYYY-MM-DD) */
  date: string;
  desc: string;
  cat: 'income' | 'expense' | 'savings';
  amt: number;
  /** 投资相关流水（与日常储蓄/支出分账） */
  isInvestment?: boolean;
  /** 仅 category=savings 时：计入该目标的进度 */
  goalId?: string | null;
  /** 服务端记录创建时间（ISO），用于列表显示精确时间 */
  createdAt: string;
}

/** 新增/编辑提交（无 id；新增无 createdAt，由服务器生成） */
export type TransactionSaveInput = Omit<Transaction, 'id' | 'createdAt'>;

export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

export type Category = 'income' | 'expense' | 'savings';

/** Monthly aggregates: 收入 / 日常支出 / 日常储蓄 / 投资流出（支出+储蓄且标记投资） */
export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  savings: number;
  investment: number;
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