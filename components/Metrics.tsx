'use client';

import { formatCurrency } from '@/lib/utils';

interface MetricsProps {
  income: number;
  expense: number;
  savings: number;
  balance: number;
}

export default function Metrics({ income, expense, savings, balance }: MetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
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
  );
}