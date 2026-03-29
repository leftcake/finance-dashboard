'use client';

import { useState, useEffect } from 'react';
import type { Goal, TransactionSaveInput, Category } from '@/lib/types';
import {
  INVESTMENT_DESC_PREFIX,
  parseInvestmentDescription,
} from '@/lib/investment-marker';
import {
  getDescriptionPresetsForCategory,
  defaultPresetForCategory,
} from '@/lib/daily-description-presets';

interface TransactionFormProps {
  goals: Goal[];
  onAdd: (transaction: TransactionSaveInput) => void;
}

export default function TransactionForm({ goals, onAdd }: TransactionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState<Category>('expense');
  const [preset, setPreset] = useState<string>(() => defaultPresetForCategory('expense'));
  const [customDesc, setCustomDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [goalId, setGoalId] = useState<string>('');

  const presets = getDescriptionPresetsForCategory(cat);

  useEffect(() => {
    if (cat !== 'savings') {
      setGoalId('');
    }
  }, [cat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);

    const rawDesc = preset === 'Other' ? customDesc.trim() : preset;
    if (!rawDesc) {
      alert('请选择一项说明或填写「其它」。');
      return;
    }

    const { description, isInvestment } = parseInvestmentDescription(rawDesc);
    if (!description) {
      alert('说明无效（若用投资标记请写在「其它」里，例如 ^基金）。');
      return;
    }

    if (!date || isNaN(amtNum) || amtNum <= 0) {
      alert('请填写日期与有效金额。');
      return;
    }

    const payload: TransactionSaveInput = {
      date,
      desc: description,
      cat,
      amt: amtNum,
      isInvestment,
      goalId: cat === 'savings' && goalId ? goalId : null,
    };

    onAdd(payload);
    setCustomDesc('');
    setAmount('');
    setPreset(defaultPresetForCategory(cat));
  };

  const presetLabel =
    cat === 'expense'
      ? '支出说明'
      : cat === 'income'
        ? '收入说明'
        : '储蓄说明';

  return (
    <div className="card mb-6">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        Add transaction
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none focus:ring-1 focus:ring-[var(--border-md)]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">Category</label>
            <select
              value={cat}
              onChange={(e) => {
                const next = e.target.value as Category;
                setCat(next);
                setPreset(defaultPresetForCategory(next));
                setCustomDesc('');
              }}
              className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none focus:ring-1 focus:ring-[var(--border-md)]"
            >
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="savings">Savings</option>
            </select>
            <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
              股票、基金、理财等请选「Expenses」或「Savings」，在「其它」说明中以 ^ 开头标记为投资流出；编辑记录时可勾选「投资」。
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">Amount (SGD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none focus:ring-1 focus:ring-[var(--border-md)]"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="h-9 w-full rounded-md bg-[var(--text-primary)] px-4 text-sm font-medium text-[var(--bg-primary)] transition-opacity hover:opacity-80"
            >
              + Add Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[var(--text-secondary)]">
              Description — {presetLabel}
            </label>
            <select
              value={preset}
              onChange={(e) => {
                const v = e.target.value;
                setPreset(v);
                if (v !== 'Other') setCustomDesc('');
              }}
              className="mb-2 h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none"
            >
              {presets.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Other">其它（自定义）</option>
            </select>
            {preset === 'Other' && (
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder={`自定义说明；投资请加 ${INVESTMENT_DESC_PREFIX}，如 ${INVESTMENT_DESC_PREFIX}ETF`}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none focus:ring-1 focus:ring-[var(--border-md)]"
              />
            )}
          </div>

          {cat === 'savings' && goals.length > 0 && (
            <div>
              <label className="mb-1 block text-xs text-[var(--text-secondary)]">
                计入储蓄目标（可选）
              </label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="h-9 w-full rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none"
              >
                <option value="">不关联目标</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                目标进度 = 所有关联本条目标的 Savings 金额合计。
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
