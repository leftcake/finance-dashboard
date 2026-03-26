'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MonthlyData } from '@/lib/types';
import { useState, useEffect } from 'react';

interface ChartsProps {
  monthlyData: MonthlyData[];
  breakdownData: { name: string; value: number; color: string }[];
}

const COLORS = ['#5DCAA5', '#F0997B', '#85B7EB'];

export default function Charts({ monthlyData, breakdownData }: ChartsProps) {
  const [mounted, setMounted] = useState(false);
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const tickColor = isDark ? '#9e9d99' : '#6b6b67';
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  useEffect(() => {
    setMounted(true);
  }, []);

  // 通用的 tooltip formatter 函数
  const formatTooltipValue = (value: any): [string, string] => {
    if (value === undefined || value === null) {
      return ['S$0.00', ''];
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return ['S$0.00', ''];
    }
    return [`S$${numValue.toLocaleString()}`, ''];
  };

  // 确保有数据才渲染图表
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Monthly overview
          </div>
          <div className="h-52 flex items-center justify-center text-[var(--text-secondary)]">
            Loading charts...
          </div>
        </div>
        <div className="card">
          <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Breakdown
          </div>
          <div className="h-52 flex items-center justify-center text-[var(--text-secondary)]">
            Loading charts...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div className="card">
        <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Monthly overview
        </div>
        <div className="h-52 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
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
                <Tooltip
                  formatter={formatTooltipValue}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    border: '0.5px solid var(--border)', 
                    borderRadius: 8 
                  }}
                />
                <Bar dataKey="income" fill="#5DCAA5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#F0997B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Breakdown
        </div>
        <div className="h-52 w-full">
          {breakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={formatTooltipValue}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    border: '0.5px solid var(--border)', 
                    borderRadius: 8 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}