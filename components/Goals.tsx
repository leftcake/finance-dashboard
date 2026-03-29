'use client';

import { Goal } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface GoalsProps {
  goals: Goal[];
  onAdd: (name: string, target: number) => void;
  onDelete: (id: string) => void;
}

function goalStatusLabel(saved: number, target: number): 'reached' | 'almost' | null {
  if (target <= 0) return null;
  if (saved >= target) return 'reached';
  if (saved / target >= 0.9) return 'almost';
  return null;
}

export default function Goals({ goals, onAdd, onDelete }: GoalsProps) {
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

  if (goals.length === 0) {
    return (
      <div className="card mb-6">
        <div className="mb-1 flex items-center justify-between">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Savings goals
          </div>
          <button
            type="button"
            onClick={handleAddGoal}
            className="h-7 cursor-pointer rounded-md border border-[var(--border-md)] bg-none px-2.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            + New goal
          </button>
        </div>
        <p className="mb-3 text-xs text-[var(--text-secondary)]">
          进度仅统计「Savings」类交易且在下拉里关联了本目标 的金额合计，无需手动输入入账。
        </p>
        <div className="py-5 text-center text-sm text-[var(--text-secondary)]">
          No goals yet. Click &quot;+ New goal&quot; to create one.
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Savings goals
        </div>
        <button
          type="button"
          onClick={handleAddGoal}
          className="h-7 cursor-pointer rounded-md border border-[var(--border-md)] bg-none px-2.5 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        >
          + New goal
        </button>
      </div>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">
        已存金额 = 所有关联本目标的 Savings 交易之和；请在「Add transaction」中选择 Savings
        并指定目标。
      </p>
      <div className="mt-3 flex flex-col gap-3.5">
        {goals.map((goal) => {
          const percentage =
            goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
          const status = goalStatusLabel(goal.saved, goal.target);

          return (
            <div key={goal.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">{goal.name}</span>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {status === 'reached' && (
                    <span className="rounded-full bg-[#E1F5EE] px-2 py-0.5 text-xs font-medium text-[#0F6E56]">
                      Reached goal
                    </span>
                  )}
                  {status === 'almost' && (
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#B45309]">
                      即将完成
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-secondary)]">
                    {formatCurrency(goal.saved)} / {formatCurrency(goal.target)} &nbsp;
                    <span className="text-savings">{percentage}%</span>
                  </span>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                <div
                  className="h-full rounded-full bg-savings transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onDelete(goal.id)}
                  className="cursor-pointer border-none bg-none text-xs text-[var(--text-secondary)] hover:text-red-600"
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
