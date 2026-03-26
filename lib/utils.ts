import { Transaction, MonthlyData } from './types';

export const formatCurrency = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  return sign + 'S$' + Math.abs(amount).toLocaleString('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const getAvailableMonths = (txs: Transaction[]): string[] => {
  const months = new Set(txs.map(t => t.date.slice(0, 7)));
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  months.add(currentMonth);
  return Array.from(months).sort().reverse();
};

export const filterByMonth = (txs: Transaction[], month: string): Transaction[] => {
  return txs.filter(t => t.date.startsWith(month));
};

export const calculateMetrics = (transactions: Transaction[]) => {
  const income = transactions
    .filter(t => t.cat === 'income')
    .reduce((sum, t) => sum + t.amt, 0);
  const expense = transactions
    .filter(t => t.cat === 'expense')
    .reduce((sum, t) => sum + t.amt, 0);
  const savings = transactions
    .filter(t => t.cat === 'savings')
    .reduce((sum, t) => sum + t.amt, 0);
  const balance = income - expense - savings;
  
  return { income, expense, savings, balance };
};

export const prepareMonthlyChartData = (transactions: Transaction[], months: string[]): MonthlyData[] => {
  return months.map(month => {
    const monthTxs = filterByMonth(transactions, month);
    return {
      month: new Date(month).toLocaleDateString('en-SG', { month: 'short' }),
      income: monthTxs.filter(t => t.cat === 'income').reduce((s, t) => s + t.amt, 0),
      expense: monthTxs.filter(t => t.cat === 'expense').reduce((s, t) => s + t.amt, 0),
    };
  });
};

export const prepareBreakdownData = (income: number, expense: number, savings: number) => {
  return [
    { name: 'Income', value: income, color: '#5DCAA5' },
    { name: 'Expense', value: expense, color: '#F0997B' },
    { name: 'Savings', value: savings, color: '#85B7EB' },
  ].filter(item => item.value > 0);
};