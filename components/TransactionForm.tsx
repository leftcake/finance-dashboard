'use client';

import { useState } from 'react';
import { Transaction, Category } from '@/lib/types';
import {
  INVESTMENT_DESC_PREFIX,
  parseInvestmentDescription,
} from '@/lib/investment-marker';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Category>('income');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    const { description, isInvestment } = parseInvestmentDescription(desc);
    if (!date || !description || isNaN(amtNum) || amtNum <= 0) {
      alert('Please fill in all fields with a valid amount.');
      return;
    }
    onAdd({ date, desc: description, cat, amt: amtNum, isInvestment });
    setDesc('');
    setAmount('');
  };

  return (
    <div className="card mb-6">
      <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Add transaction
      </div>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">
        投资相关流水：在描述前加字符{' '}
        <code className="rounded bg-[var(--bg-secondary)] px-1 py-0.5 font-mono text-[var(--text-primary)]">
          {INVESTMENT_DESC_PREFIX}
        </code>
        （例如 <code className="font-mono">{INVESTMENT_DESC_PREFIX}买入基金</code>
        ），会与日常储蓄/支出分开统计；保存时不会保留该符号。
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 px-2.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)] focus:ring-1 focus:ring-[var(--border-md)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={`日常：Salary；投资：${INVESTMENT_DESC_PREFIX}ETF定投`}
              className="w-full h-9 px-2.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)] focus:ring-1 focus:ring-[var(--border-md)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Category</label>
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as Category)}
              className="w-full h-9 px-2.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)] focus:ring-1 focus:ring-[var(--border-md)]"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Amount (SGD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full h-9 px-2.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)] focus:ring-1 focus:ring-[var(--border-md)]"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">&nbsp;</label>
            <button
              type="submit"
              className="w-full h-9 px-4 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-md text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              + Add Transaction
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}