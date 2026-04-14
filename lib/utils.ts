import { Transaction, MonthlyData, type BreakdownSlice } from './types';

/** 列表：按记账时间（创建时间）最新在前 */
export function sortTransactionsByRecordedAt(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function formatTransactionRecordedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'medium',
    });
  } catch {
    return '—';
  }
}

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

  /** 收入：全部入账（含工资、奖金、投资收益等） */
  const income = transactions
    .filter((t) => t.cat === 'income')
    .reduce((sum, t) => sum + t.amt, 0);

  const incomeInvestment = transactions
    .filter((t) => t.cat === 'income' && inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const incomeRegular = income - incomeInvestment;

  const expenseInvestment = transactions
    .filter((t) => t.cat === 'expense' && inv(t))
    .reduce((s, t) => s + t.amt, 0);
  /** 支出：日常花销（餐饮、购物、房租等），不含标记为投资的支出 */
  const expenseRegular = transactions
    .filter((t) => t.cat === 'expense' && !inv(t))
    .reduce((s, t) => s + t.amt, 0);

  const savingsInvestment = transactions
    .filter((t) => t.cat === 'savings' && inv(t))
    .reduce((s, t) => s + t.amt, 0);
  /** 储蓄：日常存钱（定期、应急金等），不含标记为投资的储蓄 */
  const savingsRegular = transactions
    .filter((t) => t.cat === 'savings' && !inv(t))
    .reduce((s, t) => s + t.amt, 0);

  /** 投资流出：从支出/储蓄划出、标记为投资的部分（股票、基金、理财等） */
  const investment = expenseInvestment + savingsInvestment;

  /** 卡片与公式用「日常支出 / 日常储蓄」；净余额含四类 */
  const expense = expenseRegular;
  const savings = savingsRegular;
  const balance = income - expenseRegular - savingsRegular - investment;

  return {
    income,
    expense,
    savings,
    investment,
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

/** 与 calculateMetrics 一致的月度四桶（概览图用） */
const sumMonthlyBuckets = (txs: Transaction[]) => {
  const inv = (t: Transaction) => !!t.isInvestment;
  const income = txs.filter((t) => t.cat === 'income').reduce((s, t) => s + t.amt, 0);
  const expense = txs
    .filter((t) => t.cat === 'expense' && !inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const savings = txs
    .filter((t) => t.cat === 'savings' && !inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const investment = txs
    .filter((t) => inv(t) && (t.cat === 'expense' || t.cat === 'savings'))
    .reduce((s, t) => s + t.amt, 0);
  return { income, expense, savings, investment };
};

/** 全量流水：每月 收入 / 日常支出 / 日常储蓄 / 投资流出 */
export const prepareMonthlyChartData = (
  transactions: Transaction[],
  months: string[]
): MonthlyData[] => {
  return months.map((month) => {
    const monthTxs = filterByMonth(transactions, month);
    const { income, expense, savings, investment } = sumMonthlyBuckets(monthTxs);
    return {
      month: new Date(month).toLocaleDateString('en-SG', { month: 'short' }),
      income,
      expense,
      savings,
      investment,
    };
  });
};

/** 仅标记为投资的流水：同上四桶口径（在该子集上） */
export const prepareMonthlyInvestmentChartData = (
  transactions: Transaction[],
  months: string[]
): MonthlyData[] => {
  return months.map((month) => {
    const monthTxs = filterByMonth(transactions, month).filter((t) => t.isInvestment);
    const { income, expense, savings, investment } = sumMonthlyBuckets(monthTxs);
    return {
      month: new Date(month).toLocaleDateString('en-SG', { month: 'short' }),
      income,
      expense,
      savings,
      investment,
    };
  });
};

export const prepareBreakdownData = (
  income: number,
  expense: number,
  savings: number,
  investment: number
) => {
  return [
    { name: '收入 Income', value: income, color: '#5DCAA5' },
    { name: '支出 Expense', value: expense, color: '#F0997B' },
    { name: '储蓄 Savings', value: savings, color: '#85B7EB' },
    { name: '投资 Investment', value: investment, color: '#7C3AED' },
  ].filter((item) => item.value > 0);
};

const FOOD_DESC_KEYS = new Set(['eat', 'drink']);
const TRANSPORT_DESC_KEYS = new Set(['bus', 'mrt']);

/** 日常支出：首词不区分大小写；Rental fee 首词 rental 或说明以 rental fee 开头 → 房租，其余规则同上 */
function expenseSubcategoryFromDescription(desc: string): 'food' | 'transport' | 'rental' | 'other' {
  const trimmed = desc.trim();
  const lower = trimmed.toLowerCase();
  const first = trimmed.split(/\s+/)[0] ?? '';
  const key = first.toLowerCase();
  if (key === 'rental' || lower.startsWith('rental fee')) return 'rental';
  if (FOOD_DESC_KEYS.has(key)) return 'food';
  if (TRANSPORT_DESC_KEYS.has(key)) return 'transport';
  return 'other';
}

/** 「本月全部分类」饼图：支出拆成饮食 / 交通 / 房租 / 其他，口径与 calculateMetrics 一致 */
export const prepareBreakdownDataAllCategories = (monthTxs: Transaction[]): BreakdownSlice[] => {
  const inv = (t: Transaction) => !!t.isInvestment;

  const income = monthTxs.filter((t) => t.cat === 'income').reduce((s, t) => s + t.amt, 0);
  const savings = monthTxs
    .filter((t) => t.cat === 'savings' && !inv(t))
    .reduce((s, t) => s + t.amt, 0);
  const investment = monthTxs
    .filter((t) => inv(t) && (t.cat === 'expense' || t.cat === 'savings'))
    .reduce((s, t) => s + t.amt, 0);

  let food = 0;
  let transport = 0;
  let rental = 0;
  let otherExpense = 0;
  for (const t of monthTxs) {
    if (t.cat !== 'expense' || inv(t)) continue;
    const sub = expenseSubcategoryFromDescription(t.desc);
    if (sub === 'food') food += t.amt;
    else if (sub === 'transport') transport += t.amt;
    else if (sub === 'rental') rental += t.amt;
    else otherExpense += t.amt;
  }

  return [
    { name: '收入 Income', value: income, color: '#5DCAA5' },
    { name: '饮食 Dining', value: food, color: '#EC4899' },
    { name: '交通 Transport', value: transport, color: '#E8886A' },
    { name: '房租 Rental fee', value: rental, color: '#9CA3AF' },
    { name: '其他 Other', value: otherExpense, color: '#D97B5C' },
    { name: '储蓄 Savings', value: savings, color: '#85B7EB' },
    { name: '投资 Investment', value: investment, color: '#7C3AED' },
  ].filter((item) => item.value > 0);
};

/** True if any investment-tagged amount exists in the given month slice. */
export const hasInvestmentActivity = (monthTxs: Transaction[]): boolean => {
  return monthTxs.some((t) => t.isInvestment && t.amt > 0);
};