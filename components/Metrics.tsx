'use client';

import { formatCurrency, type MonthMetrics } from '@/lib/utils';

type MetricsProps = MonthMetrics;

export default function Metrics({
  income,
  expense,
  savings,
  investment,
  balance,
  savingsRegular,
  savingsInvestment,
  expenseRegular,
  expenseInvestment,
  incomeRegular,
  incomeInvestment,
}: MetricsProps) {
  const showSplit =
    savingsInvestment > 0 || expenseInvestment > 0 || incomeInvestment > 0;

  return (
    <div className="mb-6">
      
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        <div className="metric-card border-l-4 border-l-[#1D9E75] transition-all duration-200 hover:shadow-md">
          <div className="mb-1.5 text-xs text-[var(--text-secondary)]">收入 Income</div>
          <div className="text-2xl font-bold text-[#1D9E75]">{formatCurrency(income)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#1D9E75]" />
            钱流入：工资、奖金、投资收益
          </div>
        </div>

        <div className="metric-card border-l-4 border-l-[#D85A30] transition-all duration-200 hover:shadow-md">
          <div className="mb-1.5 text-xs text-[var(--text-secondary)]">支出 Expense</div>
          <div className="text-2xl font-bold text-[#D85A30]">{formatCurrency(expense)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#D85A30]" />
            钱花掉：餐饮、购物、房租（不含投资支出）
          </div>
        </div>

        <div className="metric-card border-l-4 border-l-[#378ADD] transition-all duration-200 hover:shadow-md">
          <div className="mb-1.5 text-xs text-[var(--text-secondary)]">储蓄 Savings</div>
          <div className="text-2xl font-bold text-[#378ADD]">{formatCurrency(savings)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#378ADD]" />
            钱存起：定期存款（不含投资储蓄）
          </div>
        </div>

        <div className="metric-card border-l-4 border-l-[#7C3AED] transition-all duration-200 hover:shadow-md">
          <div className="mb-1.5 text-xs text-[var(--text-secondary)]">投资 Investment</div>
          <div className="text-2xl font-bold text-[#7C3AED]">{formatCurrency(investment)}</div>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#7C3AED]" />
            钱增值：股票、基金、理财（标记投资的支出+储蓄）
          </div>
        </div>

        <div
          className={`metric-card border-l-4 transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1 ${
            balance >= 0 ? 'border-l-[#2C5282]' : 'border-l-[#D85A30]'
          }`}
        >
          <div className="mb-1.5 text-xs text-[var(--text-secondary)]">净余额 Net</div>
          <div
            className={`text-2xl font-bold ${balance >= 0 ? 'text-[#2C5282]' : 'text-[#D85A30]'}`}
          >
            {formatCurrency(balance)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <span
              className={`inline-block h-2 w-2 rounded-full ${balance >= 0 ? 'bg-[#2C5282]' : 'bg-[#D85A30]'}`}
            />
            {balance >= 0 ? '结余' : '超支'}
          </div>
        </div>
      </div>

      {showSplit && (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            本月明细 · 日常 vs 标记投资（^）
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <div className="text-xs text-[var(--text-secondary)]">储蓄</div>
              <div className="mt-1 text-sm">
                <span className="text-[var(--text-primary)]">日常 </span>
                <span className="font-semibold text-[#378ADD]">
                  {formatCurrency(savingsRegular)}
                </span>
              </div>
              <div className="mt-0.5 text-sm">
                <span className="text-[var(--text-primary)]">投资 </span>
                <span className="font-semibold text-[#5B21B6]">
                  {formatCurrency(savingsInvestment)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">支出</div>
              <div className="mt-1 text-sm">
                <span className="text-[var(--text-primary)]">日常 </span>
                <span className="font-semibold text-[#D85A30]">
                  {formatCurrency(expenseRegular)}
                </span>
              </div>
              <div className="mt-0.5 text-sm">
                <span className="text-[var(--text-primary)]">投资 </span>
                <span className="font-semibold text-[#7C3AED]">
                  {formatCurrency(expenseInvestment)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)]">收入</div>
              <div className="mt-1 text-sm">
                <span className="text-[var(--text-primary)]">日常 </span>
                <span className="font-semibold text-[#1D9E75]">
                  {formatCurrency(incomeRegular)}
                </span>
              </div>
              <div className="mt-0.5 text-sm">
                <span className="text-[var(--text-primary)]">投资 </span>
                <span className="font-semibold text-[#047857]">
                  {formatCurrency(incomeInvestment)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
