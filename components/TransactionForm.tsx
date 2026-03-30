'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const savingsGoals = useMemo(
    () =>
      [...goals].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }),
    [goals]
  );

  useEffect(() => {
    if (cat !== 'savings') {
      setGoalId('');
    }
  }, [cat]);

  useEffect(() => {
    if (!goalId) return;
    const selectedGoal = savingsGoals.find((g) => g.id === goalId);
    if (selectedGoal && selectedGoal.saved >= selectedGoal.target) {
      setGoalId('');
    }
  }, [goalId, savingsGoals]);

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
  const labelClass = 'mb-1.5 block text-xs font-medium text-[var(--text-secondary)]';
  const fieldClass =
    'h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--border-md)] focus:outline-none focus:ring-1 focus:ring-[var(--border-md)]';

  return (
    <div className="card mb-6">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        Add transaction
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={cat}
              onChange={(e) => {
                const next = e.target.value as Category;
                setCat(next);
                setPreset(defaultPresetForCategory(next));
                setCustomDesc('');
              }}
              className={fieldClass}
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
            <label className={labelClass}>Amount (SGD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <label className={labelClass}>
              Description — {presetLabel}
            </label>
            <select
              value={preset}
              onChange={(e) => {
                const v = e.target.value;
                setPreset(v);
                if (v !== 'Other') setCustomDesc('');
              }}
              className={`${fieldClass} mb-2`}
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
                className={fieldClass}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>计入储蓄目标（可选）</label>
            <select
              value={cat === 'savings' ? goalId : ''}
              onChange={(e) => setGoalId(e.target.value)}
              disabled={cat !== 'savings' || savingsGoals.length === 0}
              className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">
                {cat === 'savings'
                  ? savingsGoals.length > 0
                    ? '不关联目标'
                    : '暂无可用储蓄目标'
                  : '仅 Savings 分类可选'}
              </option>
              {savingsGoals.map((g) => {
                const isReached = g.target > 0 && g.saved >= g.target;
                return (
                  <option key={g.id} value={g.id} disabled={isReached}>
                    {g.name}
                    {isReached ? ' (已达标，不可选)' : ''}
                  </option>
                );
              })}
            </select>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              目标进度 = 所有关联本条目标的 Savings 金额合计。
            </p>
          </div>
        </div>

        <div className="flex justify-stretch sm:justify-start">
          <button
            type="submit"
            className="h-9 w-full rounded-md bg-[var(--text-primary)] px-4 text-sm font-medium text-[var(--bg-primary)] transition-opacity hover:opacity-80 sm:w-auto sm:min-w-[12rem]"
          >
            + Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}
