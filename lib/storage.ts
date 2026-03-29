// lib/storage.ts — optional client cache (not used by main app; auth is cookie + API).
import { Transaction, Goal } from './types';

const getStoragePrefix = () => '';

export const loadTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = `${getStoragePrefix()}finance_txs`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTransactions = (txs: Transaction[]): void => {
  if (typeof window === 'undefined') return;
  const key = `${getStoragePrefix()}finance_txs`;
  localStorage.setItem(key, JSON.stringify(txs));
};

export const loadGoals = (): Goal[] => {
  if (typeof window === 'undefined') return [];
  try {
    const key = `${getStoragePrefix()}finance_goals`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveGoals = (goals: Goal[]): void => {
  if (typeof window === 'undefined') return;
  const key = `${getStoragePrefix()}finance_goals`;
  localStorage.setItem(key, JSON.stringify(goals));
};

export const clearUserData = (): void => {
  if (typeof window === 'undefined') return;
  const prefix = getStoragePrefix();
  if (prefix) {
    localStorage.removeItem(`${prefix}finance_txs`);
    localStorage.removeItem(`${prefix}finance_goals`);
  }
};