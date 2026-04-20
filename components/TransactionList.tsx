'use client';

import { useMemo, useState } from 'react';
import type { Transaction, Goal, TransactionSaveInput, Category } from '@/lib/types';
import { formatCurrency, formatTransactionRecordedAt, sortTransactionsByRecordedAt } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  goals: Goal[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: TransactionSaveInput) => Promise<boolean>;
}

function draftFromTx(tx: Transaction): TransactionSaveInput {
  return {
    date: tx.date,
    desc: tx.desc,
    cat: tx.cat,
    amt: tx.amt,
    isInvestment: Boolean(tx.isInvestment),
    goalId: tx.goalId ?? null,
  };
}

export default function TransactionList({
  transactions,
  goals,
  onDelete,
  onUpdate,
}: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TransactionSaveInput | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const sorted = sortTransactionsByRecordedAt(transactions);
  const visibleTransactions = expanded ? sorted : sorted.slice(0, 10);
  const sortedGoals = useMemo(
    () =>
      [...goals].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      }),
    [goals]
  );

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setDraft(draftFromTx(tx));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    if (!draft.desc.trim() || draft.amt <= 0 || Number.isNaN(draft.amt)) {
      alert('Description and a positive amount are required.');
      return;
    }
    setSaving(true);
    const ok = await onUpdate(editingId, draft);
    setSaving(false);
    if (ok) {
      cancelEdit();
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="py-5 text-center text-sm text-[var(--text-secondary)]">
        No transactions for this month. Add one above.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-b border-[var(--border)] p-1.5 pb-2 text-left text-xs font-medium text-[var(--text-secondary)]">
              Date
            </th>
            <th className="border-b border-[var(--border)] p-1.5 pb-2 text-left text-xs font-medium text-[var(--text-secondary)]">
              Recorded at
            </th>
            <th className="border-b border-[var(--border)] p-1.5 pb-2 text-left text-xs font-medium text-[var(--text-secondary)]">
              Description
            </th>
            <th className="border-b border-[var(--border)] p-1.5 pb-2 text-left text-xs font-medium text-[var(--text-secondary)]">
              分类 Cat.
            </th>
            <th className="border-b border-[var(--border)] p-1.5 pb-2 text-right text-xs font-medium text-[var(--text-secondary)]">
              Amount
            </th>
            <th className="w-24 border-b border-[var(--border)] p-1.5 pb-2 text-left text-xs font-medium text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleTransactions.map((tx) => {
            const isEditing = editingId === tx.id && draft;

            if (isEditing && draft) {
              return (
                <tr key={tx.id} className="bg-[var(--bg-secondary)]/50">
                  <td className="border-b border-[var(--border)] p-1.5 align-top">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                      className="h-8 w-full min-w-[8.5rem] rounded border border-[var(--border)] bg-[var(--bg-primary)] px-1 text-xs"
                    />
                  </td>
                  <td className="border-b border-[var(--border)] p-1.5 align-top text-xs text-[var(--text-secondary)]">
                    {formatTransactionRecordedAt(tx.createdAt)}
                  </td>
                  <td className="border-b border-[var(--border)] p-1.5 align-top">
                    <input
                      type="text"
                      value={draft.desc}
                      onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                      className="h-8 w-full min-w-[8rem] rounded border border-[var(--border)] bg-[var(--bg-primary)] px-1 text-xs"
                    />
                  </td>
                  <td className="border-b border-[var(--border)] p-1.5 align-top">
                    <select
                      value={draft.cat}
                      onChange={(e) => {
                        const c = e.target.value as Category;
                        setDraft({
                          ...draft,
                          cat: c,
                          goalId: c === 'savings' ? draft.goalId : null,
                        });
                      }}
                      className="h-8 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-1 text-xs"
                    >
                    <option value="expense">支出 Expense</option>
                    <option value="income">收入 Income</option>
                    <option value="savings">储蓄 Savings</option>
                    </select>
                    {draft.cat === 'savings' && goals.length > 0 && (
                      <select
                        value={draft.goalId ?? ''}
                        onChange={(e) =>
                          setDraft({ ...draft, goalId: e.target.value || null })
                        }
                        className="mt-1 h-8 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-1 text-xs"
                      >
                        <option value="">No goal</option>
                        {sortedGoals.map((g) => {
                          const isReached = g.target > 0 && g.saved >= g.target;
                          const keepSelected = draft.goalId === g.id;
                          return (
                            <option key={g.id} value={g.id} disabled={isReached && !keepSelected}>
                              {g.name}
                              {isReached ? ' (reached)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    )}
                    <label className="mt-1 flex cursor-pointer items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={draft.isInvestment ?? false}
                        onChange={(e) =>
                          setDraft({ ...draft, isInvestment: e.target.checked })
                        }
                      />
                      投资
                    </label>
                  </td>
                  <td className="border-b border-[var(--border)] p-1.5 align-top">
                    <input
                      type="number"
                      value={draft.amt}
                      onChange={(e) =>
                        setDraft({ ...draft, amt: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                      className="h-8 w-full min-w-[5rem] rounded border border-[var(--border)] bg-[var(--bg-primary)] px-1 text-xs text-right"
                    />
                  </td>
                  <td className="border-b border-[var(--border)] p-1.5 align-top">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={saveEdit}
                        className="rounded bg-[var(--text-primary)] px-2 py-0.5 text-xs text-[var(--bg-primary)] disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded border border-[var(--border)] px-2 py-0.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={tx.id}>
                <td className="border-b border-[var(--border)] p-1.5 text-[var(--text-secondary)]">
                  {tx.date}
                </td>
                <td className="border-b border-[var(--border)] p-1.5 text-xs text-[var(--text-secondary)]">
                  {formatTransactionRecordedAt(tx.createdAt)}
                </td>
                <td className="border-b border-[var(--border)] p-1.5">
                  <span className="inline-flex flex-wrap items-center gap-1.5">
                    {tx.isInvestment && (
                      <span
                        className="shrink-0 rounded-full bg-[#EDE9FE] px-2 py-0.5 text-xs font-medium text-[#5B21B6] dark:bg-violet-950/50 dark:text-violet-300"
                        title="投资相关"
                      >
                        投资
                      </span>
                    )}
                    <span>{tx.desc}</span>
                  </span>
                </td>
                <td className="border-b border-[var(--border)] p-1.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      tx.cat === 'income'
                        ? 'bg-[#E1F5EE] text-[#0F6E56]'
                        : tx.cat === 'expense'
                          ? 'bg-[#FAECE7] text-[#993C1D]'
                          : 'bg-[#E6F1FB] text-[#185FA5]'
                    }`}
                  >
                  {tx.cat === 'income'
                    ? '收入'
                    : tx.cat === 'expense'
                      ? '支出'
                      : '储蓄'}{' '}
                  <span className="opacity-70">({tx.cat})</span>
                </span>
                  {tx.cat === 'savings' && tx.goalId && (
                    <div className="mt-0.5 text-[10px] text-[var(--text-secondary)]">
                      → {sortedGoals.find((g) => g.id === tx.goalId)?.name ?? 'goal'}
                    </div>
                  )}
                </td>
                <td
                  className={`border-b border-[var(--border)] p-1.5 text-right ${
                    tx.amt > 150
                      ? tx.cat === 'income'
                        ? 'font-semibold text-[#0F6E56]'
                        : 'font-semibold text-red-600'
                      : ''
                  }`}
                >
                  {formatCurrency(tx.amt)}
                </td>
                <td className="border-b border-[var(--border)] p-1.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(tx)}
                      className="text-xs text-[#378ADD] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(tx.id)}
                      className="text-lg leading-none text-[var(--text-secondary)] hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
        {sorted.length > 10 && (
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-xs text-[#378ADD] hover:underline"
            >
              {expanded ? 'Collapse (latest 10)' : 'Expand (all this month)'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {visibleTransactions.map((tx) => {
          const isEditing = editingId === tx.id && draft;

          if (isEditing && draft) {
            return (
              <div key={tx.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]/40 p-3">
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                    className="h-9 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 text-sm"
                  />
                  <input
                    type="text"
                    value={draft.desc}
                    onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
                    className="h-9 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 text-sm"
                    placeholder="Description"
                  />
                  <select
                    value={draft.cat}
                    onChange={(e) => {
                      const c = e.target.value as Category;
                      setDraft({
                        ...draft,
                        cat: c,
                        goalId: c === 'savings' ? draft.goalId : null,
                      });
                    }}
                    className="h-9 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 text-sm"
                  >
                    <option value="expense">支出 Expense</option>
                    <option value="income">收入 Income</option>
                    <option value="savings">储蓄 Savings</option>
                  </select>
                  {draft.cat === 'savings' && sortedGoals.length > 0 && (
                    <select
                      value={draft.goalId ?? ''}
                      onChange={(e) => setDraft({ ...draft, goalId: e.target.value || null })}
                      className="h-9 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 text-sm"
                    >
                      <option value="">No goal</option>
                      {sortedGoals.map((g) => {
                        const isReached = g.target > 0 && g.saved >= g.target;
                        const keepSelected = draft.goalId === g.id;
                        return (
                          <option key={g.id} value={g.id} disabled={isReached && !keepSelected}>
                            {g.name}
                            {isReached ? ' (reached)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={draft.isInvestment ?? false}
                        onChange={(e) => setDraft({ ...draft, isInvestment: e.target.checked })}
                      />
                      投资
                    </label>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {formatTransactionRecordedAt(tx.createdAt)}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={draft.amt}
                    onChange={(e) => setDraft({ ...draft, amt: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="h-9 w-full rounded border border-[var(--border)] bg-[var(--bg-primary)] px-2 text-right text-sm"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={saveEdit}
                      className="flex-1 rounded bg-[var(--text-primary)] px-2 py-1.5 text-xs text-[var(--bg-primary)] disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex-1 rounded border border-[var(--border)] px-2 py-1.5 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={tx.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="text-sm font-medium">{tx.desc}</div>
                <div
                  className={`text-sm font-semibold ${
                    tx.amt > 150
                      ? tx.cat === 'income'
                        ? 'text-[#0F6E56]'
                        : 'text-red-600'
                      : ''
                  }`}
                >
                  {formatCurrency(tx.amt)}
                </div>
              </div>
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    tx.cat === 'income'
                      ? 'bg-[#E1F5EE] text-[#0F6E56]'
                      : tx.cat === 'expense'
                        ? 'bg-[#FAECE7] text-[#993C1D]'
                        : 'bg-[#E6F1FB] text-[#185FA5]'
                  }`}
                >
                  {tx.cat}
                </span>
                {tx.isInvestment && (
                  <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-xs font-medium text-[#5B21B6]">
                    投资
                  </span>
                )}
                {tx.cat === 'savings' && tx.goalId && (
                  <span className="text-xs text-[var(--text-secondary)]">
                    → {sortedGoals.find((g) => g.id === tx.goalId)?.name ?? 'goal'}
                  </span>
                )}
              </div>
              <div className="mb-2 text-xs text-[var(--text-secondary)]">
                {tx.date} · {formatTransactionRecordedAt(tx.createdAt)}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => startEdit(tx)}
                  className="text-xs text-[#378ADD] hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(tx.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {sorted.length > 10 && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-xs text-[#378ADD] hover:underline"
            >
              {expanded ? 'Collapse (latest 10)' : 'Expand (all this month)'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
