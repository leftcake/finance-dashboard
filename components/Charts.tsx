'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { BreakdownSlice, MonthlyData } from '@/lib/types';
import { useState, useEffect, type ReactNode } from 'react';

const CAT_COLORS = {
  income: '#5DCAA5',
  expense: '#F0997B',
  savings: '#85B7EB',
} as const;

/** Fixed chart height avoids % chains; initialDimension avoids Recharts -1 / ResizeObserver glitches in grid/flex. */
const CHART_HEIGHT = 224;
const CHART_INITIAL = { width: 400, height: CHART_HEIGHT } as const;

function SizedChartRoot({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-[224px] w-full min-w-0"
      style={{ height: CHART_HEIGHT }}
    >
      {children}
    </div>
  );
}

export interface ChartsProps {
  /** All transactions — full cash picture per month. */
  monthlyDataAll: MonthlyData[];
  breakdownDataAll: BreakdownSlice[];
  /** Only ^ / investment-tagged rows. */
  monthlyDataInvestment: MonthlyData[];
  breakdownDataInvestment: BreakdownSlice[];
  /** Label for the pie subtitles (selected dashboard month). */
  viewingMonthLabel: string;
}

export default function Charts({
  monthlyDataAll,
  breakdownDataAll,
  monthlyDataInvestment,
  breakdownDataInvestment,
  viewingMonthLabel,
}: ChartsProps) {
  const [mounted, setMounted] = useState(false);
  const isDark =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const tickColor = isDark ? '#9e9d99' : '#6b6b67';

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTooltipValue = (value: unknown): [string, string] => {
    if (value === undefined || value === null) {
      return ['S$0.00', ''];
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (Number.isNaN(numValue)) {
      return ['S$0.00', ''];
    }
    return [`S$${numValue.toLocaleString()}`, ''];
  };

  const tooltipStyle = {
    backgroundColor: 'var(--bg-primary)',
    border: '0.5px solid var(--border)',
    borderRadius: 8,
  };

  const hasInvestmentSeries = monthlyDataInvestment.some(
    (d) => d.income + d.expense + d.savings > 0
  );

  const placeholderGrid = (
    <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card">
          <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Loading…
          </div>
          <div className="flex h-52 items-center justify-center text-sm text-[var(--text-secondary)]">
            Loading charts…
          </div>
        </div>
      ))}
    </div>
  );

  if (!mounted) {
    return placeholderGrid;
  }

  const MonthlyBars = ({
    data,
    title,
    subtitle,
  }: {
    data: MonthlyData[];
    title: string;
    subtitle: string;
  }) => (
    <div className="card min-w-0">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        {title}
      </div>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">{subtitle}</p>
      <SizedChartRoot>
        {data.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={CHART_HEIGHT}
            minWidth={0}
            minHeight={CHART_HEIGHT}
            initialDimension={CHART_INITIAL}
          >
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: tickColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: tickColor }}
                tickFormatter={(v) => `S$${v}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={formatTooltipValue} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                name="Income"
                dataKey="income"
                fill={CAT_COLORS.income}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Expense"
                dataKey="expense"
                fill={CAT_COLORS.expense}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Savings"
                dataKey="savings"
                fill={CAT_COLORS.savings}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
            No data available
          </div>
        )}
      </SizedChartRoot>
    </div>
  );

  const BreakdownPie = ({
    data,
    title,
    subtitle,
    emptyHint,
  }: {
    data: BreakdownSlice[];
    title: string;
    subtitle: string;
    emptyHint: string;
  }) => (
    <div className="card min-w-0">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        {title}
      </div>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">{subtitle}</p>
      <SizedChartRoot>
        {data.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height={CHART_HEIGHT}
            minWidth={0}
            minHeight={CHART_HEIGHT}
            initialDimension={CHART_INITIAL}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={1}
                dataKey="value"
                stroke="none"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltipValue} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[var(--text-secondary)]">
            {emptyHint}
          </div>
        )}
      </SizedChartRoot>
    </div>
  );

  return (
    <div className="mb-6 space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">
          Overview — all activity
        </h2>
        <p className="mb-4 max-w-3xl text-xs text-[var(--text-secondary)]">
          Income, Expense, and Savings use your category labels. Totals include both everyday and
          investment (^) flows, so all spending recorded as Expense appears here together with the
          rest.
        </p>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          <MonthlyBars
            data={monthlyDataAll}
            title="Monthly — all categories"
            subtitle="Last months: Income, Expense, Savings (everything)"
          />
          <BreakdownPie
            data={breakdownDataAll}
            title="This month — all categories"
            subtitle={viewingMonthLabel}
            emptyHint="No flows this month."
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">
          Investment (^) only
        </h2>
        <p className="mb-4 max-w-3xl text-xs text-[var(--text-secondary)]">
          Same three categories, filtered to rows you marked with ^ in the description. Compare with
          the overview above to see how much of each category is investment-specific.
        </p>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
          {hasInvestmentSeries ? (
            <MonthlyBars
              data={monthlyDataInvestment}
              title="Monthly — investment only"
              subtitle="Income, Expense, Savings (^ only)"
            />
          ) : (
            <div className="card min-w-0">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                Monthly — investment only
              </div>
              <p className="mb-3 text-xs text-[var(--text-secondary)]">
                Income, Expense, Savings (^ only)
              </p>
              <div
                className="flex items-center justify-center px-4 text-center text-sm text-[var(--text-secondary)]"
                style={{ minHeight: CHART_HEIGHT }}
              >
                No investment-tagged flows in this range. Start a description with ^ when adding a
                transaction.
              </div>
            </div>
          )}
          <BreakdownPie
            data={breakdownDataInvestment}
            title="This month — investment only"
            subtitle={viewingMonthLabel}
            emptyHint="No investment (^) activity in this month."
          />
        </div>
      </div>
    </div>
  );
}
