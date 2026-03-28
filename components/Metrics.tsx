'use client';

import { formatCurrency, type MonthMetrics } from '@/lib/utils';

type MetricsProps = MonthMetrics;

export default function Metrics({
  income,
  expense,
  savings,
  balance,
  savingsRegular,
  savingsInvestment,
  expenseRegular,
  expenseInvestment,
  incomeRegular,
  incomeInvestment,
}: MetricsProps) {
  const showSplit =
    savingsInvestment > 0 ||
    expenseInvestment > 0 ||
    incomeInvestment > 0;

  return (
    <div className="mb-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {/* Income - 绿色渐变 */}
      <div className="metric-card border-l-4 border-l-[#1D9E75] hover:shadow-md transition-all duration-200">
        <div className="text-xs text-[var(--text-secondary)] mb-1.5">Income</div>
        <div className="text-2xl font-bold text-[#1D9E75]">
          {formatCurrency(income)}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#1D9E75]"></span>
          Revenue & earnings
        </div>
      </div>

      {/* Expenses - 红色渐变 */}
      <div className="metric-card border-l-4 border-l-[#D85A30] hover:shadow-md transition-all duration-200">
        <div className="text-xs text-[var(--text-secondary)] mb-1.5">Expenses</div>
        <div className="text-2xl font-bold text-[#D85A30]">
          {formatCurrency(expense)}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D85A30]"></span>
          Costs & spending
        </div>
      </div>

      {/* Net Balance - 动态颜色 */}
      <div className={`metric-card border-l-4 ${balance >= 0 ? 'border-l-[#378ADD]' : 'border-l-[#D85A30]'} hover:shadow-md transition-all duration-200`}>
        <div className="text-xs text-[var(--text-secondary)] mb-1.5">
          Net Balance
        </div>
        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-[#378ADD]' : 'text-[#D85A30]'}`}>
          {formatCurrency(balance)}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full ${balance >= 0 ? 'bg-[#378ADD]' : 'bg-[#D85A30]'}`}></span>
          {balance >= 0 ? 'Surplus' : 'Deficit'}
        </div>
      </div>

      {/* Savings - 蓝色渐变 */}
      <div className="metric-card border-l-4 border-l-[#378ADD] hover:shadow-md transition-all duration-200">
        <div className="text-xs text-[var(--text-secondary)] mb-1.5">Savings</div>
        <div className="text-2xl font-bold text-[#378ADD]">
          {formatCurrency(savings)}
        </div>
        <div className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-[#378ADD]"></span>
          Saved this month
        </div>
      </div>
    </div>

    {showSplit && (
      <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          本月分账 · 日常 vs 投资（^）
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs text-[var(--text-secondary)]">储蓄</div>
            <div className="mt-1 text-sm">
              <span className="text-[var(--text-primary)]">日常 </span>
              <span className="font-semibold text-[#378ADD]">{formatCurrency(savingsRegular)}</span>
            </div>
            <div className="mt-0.5 text-sm">
              <span className="text-[var(--text-primary)]">投资 </span>
              <span className="font-semibold text-[#5B21B6]">{formatCurrency(savingsInvestment)}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)]">支出</div>
            <div className="mt-1 text-sm">
              <span className="text-[var(--text-primary)]">日常 </span>
              <span className="font-semibold text-[#D85A30]">{formatCurrency(expenseRegular)}</span>
            </div>
            <div className="mt-0.5 text-sm">
              <span className="text-[var(--text-primary)]">投资 </span>
              <span className="font-semibold text-[#7C3AED]">{formatCurrency(expenseInvestment)}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)]">收入</div>
            <div className="mt-1 text-sm">
              <span className="text-[var(--text-primary)]">日常 </span>
              <span className="font-semibold text-[#1D9E75]">{formatCurrency(incomeRegular)}</span>
            </div>
            <div className="mt-0.5 text-sm">
              <span className="text-[var(--text-primary)]">投资 </span>
              <span className="font-semibold text-[#047857]">{formatCurrency(incomeInvestment)}</span>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}