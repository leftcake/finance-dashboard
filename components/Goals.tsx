'use client';

import { useState } from 'react';
import { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface GoalsProps {
  goals: Goal[];
  onAdd: (name: string, target: number) => void;
  onAddSavings: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export default function Goals({ goals, onAdd, onAddSavings, onDelete }: GoalsProps) {
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});

  const handleAddGoal = () => {
    const name = prompt('Goal name (e.g. Emergency fund):');
    if (!name || !name.trim()) return;
    const target = parseFloat(prompt('Target amount (S$):') || '');
    if (isNaN(target) || target <= 0) {
      alert('Please enter a valid target amount.');
      return;
    }
    onAdd(name.trim(), target);
  };

  const handleAddSavings = (id: string) => {
    const amount = parseFloat(addAmounts[id] || '');
    if (isNaN(amount) || amount <= 0) {
      alert('Enter a valid amount.');
      return;
    }
    onAddSavings(id, amount);
    setAddAmounts({ ...addAmounts, [id]: '' });
  };

  if (goals.length === 0) {
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-1">
          <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
            Savings goals
          </div>
          <button
            onClick={handleAddGoal}
            className="h-7 text-xs bg-none border border-[var(--border-md)] rounded-md px-2.5 cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            + New goal
          </button>
        </div>
        <div className="text-center text-[var(--text-secondary)] py-5 text-sm">
          No goals yet. Click "+ New goal" to create one.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          Savings goals
        </div>
        <button
          onClick={handleAddGoal}
          className="h-7 text-xs bg-none border border-[var(--border-md)] rounded-md px-2.5 cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        >
          + New goal
        </button>
      </div>
      <div className="flex flex-col gap-3.5 mt-3">
        {goals.map((goal) => {
          const percentage = goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
          return (
            <div key={goal.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{goal.name}</span>
                <span className="text-xs text-[var(--text-secondary)]">
                  {formatCurrency(goal.saved)} / {formatCurrency(goal.target)} &nbsp;
                  <span className="text-savings">{percentage}%</span>
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-savings transition-all duration-300 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="number"
                  value={addAmounts[goal.id] || ''}
                  onChange={(e) => setAddAmounts({ ...addAmounts, [goal.id]: e.target.value })}
                  placeholder="Add amount"
                  min="0"
                  step="1"
                  className="w-32 h-7 px-2 text-xs bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md"
                />
                <button
                  onClick={() => handleAddSavings(goal.id)}
                  className="h-7 text-xs bg-none border border-[var(--border-md)] rounded-md px-2.5 cursor-pointer text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                >
                  Add savings
                </button>
                <button
                  onClick={() => onDelete(goal.id)}
                  className="h-7 text-xs bg-none border-none cursor-pointer text-[var(--text-secondary)] hover:text-expense ml-auto"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}