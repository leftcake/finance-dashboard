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
  const inv = (t: Transaction) => !!t.isInvestment;

  const income = transactions
    .filter((t) => t.cat === 'income')
    .reduce((sum, t) => sum + t.amt, 0);
  const expense = transactions
    .filter((t) => t.cat === 'expense')
    .reduce((sum, t) => sum + t.amt, 0);
  const savings = transactions
    .filter((t) => t.cat === 'savings')
    .reduce((sum, t) => sum + t.amt, 0);
  const balance = income - expense - savings;

  const incomeInvestment = transactions
    .filter((t) => t.cat === 'income' && inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const incomeRegular = income - incomeInvestment;

  const expenseInvestment = transactions
    .filter((t) => t.cat === 'expense' && inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const expenseRegular = expense - expenseInvestment;

  const savingsInvestment = transactions
    .filter((t) => t.cat === 'savings' && inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const savingsRegular = savings - savingsInvestment;

  return {
    income,
    expense,
    savings,
    balance,
    incomeRegular,
    incomeInvestment,
    expenseRegular,
    expenseInvestment,
    savingsRegular,
    savingsInvestment,
  };
};

export type MonthMetrics = ReturnType<typeof calculateMetrics>;

const sumByCat = (txs: Transaction[]) => ({
  income: txs.filter((t) => t.cat === 'income').reduce((s, t) => s + t.amt, 0),
  expense: txs.filter((t) => t.cat === 'expense').reduce((s, t) => s + t.amt, 0),
  savings: txs.filter((t) => t.cat === 'savings').reduce((s, t) => s + t.amt, 0),
});

/** All transactions: full picture per month (income + expense + savings). */
export const prepareMonthlyChartData = (
  transactions: Transaction[],
  months: string[]
): MonthlyData[] => {
  return months.map((month) => {
    const monthTxs = filterByMonth(transactions, month);
    const { income, expense, savings } = sumByCat(monthTxs);
    return {
      month: new Date(month).toLocaleDateString('en-SG', { month: 'short' }),
      income,
      expense,
      savings,
    };
  });
};

/** Only ^ / investment-tagged rows; same three categories. */
export const prepareMonthlyInvestmentChartData = (
  transactions: Transaction[],
  months: string[]
): MonthlyData[] => {
  return months.map((month) => {
    const monthTxs = filterByMonth(transactions, month).filter((t) => t.isInvestment);
    const { income, expense, savings } = sumByCat(monthTxs);
    return {
      month: new Date(month).toLocaleDateString('en-SG', { month: 'short' }),
      income,
      expense,
      savings,
    };
  });
};

export const prepareBreakdownData = (income: number, expense: number, savings: number) => {
  return [
    { name: 'Income', value: income, color: '#5DCAA5' },
    { name: 'Expense', value: expense, color: '#F0997B' },
    { name: 'Savings', value: savings, color: '#85B7EB' },
  ].filter((item) => item.value > 0);
};

/** True if any investment-tagged amount exists in the given month slice. */
export const hasInvestmentActivity = (monthTxs: Transaction[]): boolean => {
  return monthTxs.some((t) => t.isInvestment && t.amt > 0);
};