'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Metrics from '@/components/Metrics';
import TransactionForm from '@/components/TransactionForm';
import Charts from '@/components/Charts';
import TransactionList from '@/components/TransactionList';
import Goals from '@/components/Goals';
import { Transaction, Goal, type TransactionSaveInput } from '@/lib/types';
import { logoutSession } from '@/lib/auth';
import {
  loadTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  loadGoals,
  addGoal,
  deleteGoal,
} from '@/lib/database';
import {
  getAvailableMonths,
  filterByMonth,
  calculateMetrics,
  prepareMonthlyChartData,
  prepareMonthlyInvestmentChartData,
  prepareBreakdownData,
} from '@/lib/utils';

export interface DashboardUser {
  id: string;
  email: string;
  username?: string | null;
}

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      const [loadedTxs, loadedGoals] = await Promise.all([loadTransactions(), loadGoals()]);
      setTransactions(loadedTxs);
      setGoals(loadedGoals);
      const months = getAvailableMonths(loadedTxs);
      setAvailableMonths(months);
      if (months.length > 0) {
        setSelectedMonth(months[0]);
      }
    } catch {
      setTransactions([]);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUserData();
  }, [user.id, loadUserData]);

  const handleLogout = async () => {
    await logoutSession();
    router.replace('/login');
  };

  const filteredTransactions = filterByMonth(transactions, selectedMonth);
  const metrics = calculateMetrics(filteredTransactions);
  const chartMonths = availableMonths.slice(0, 6).reverse();
  const monthlyDataAll = prepareMonthlyChartData(transactions, chartMonths);
  const monthlyDataInvestment = prepareMonthlyInvestmentChartData(transactions, chartMonths);
  const breakdownDataAll = prepareBreakdownData(
    metrics.income,
    metrics.expense,
    metrics.savings,
    metrics.investment
  );
  const investmentMonthTxs = filteredTransactions.filter((t) => t.isInvestment);
  const invMonthMetrics = calculateMetrics(investmentMonthTxs);
  const breakdownDataInvestment = prepareBreakdownData(
    invMonthMetrics.income,
    invMonthMetrics.expense,
    invMonthMetrics.savings,
    invMonthMetrics.investment
  );
  const viewingMonthLabel = selectedMonth
    ? new Date(selectedMonth + '-01').toLocaleDateString('en-SG', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handleAddTransaction = async (tx: TransactionSaveInput) => {
    const newTx = await addTransaction(tx);
    if (newTx) {
      setTransactions((prev) => {
        const next = [newTx, ...prev];
        setAvailableMonths(getAvailableMonths(next));
        return next;
      });
      setGoals(await loadGoals());
    }
  };

  const handleUpdateTransaction = async (
    id: string,
    data: TransactionSaveInput
  ): Promise<boolean> => {
    if (!data.desc?.trim() || data.amt <= 0) {
      alert('Description and a positive amount are required.');
      return false;
    }
    const updated = await updateTransaction(id, data);
    if (!updated) {
      alert('Could not save changes.');
      return false;
    }
    setTransactions((prev) => {
      const next = prev.map((t) => (t.id === id ? updated : t));
      setAvailableMonths(getAvailableMonths(next));
      return next;
    });
    setGoals(await loadGoals());
    return true;
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    const success = await deleteTransaction(id);
    if (success) {
      setTransactions((t) => {
        const next = t.filter((x) => x.id !== id);
        setAvailableMonths(getAvailableMonths(next));
        return next;
      });
      setGoals(await loadGoals());
    }
  };

  const handleAddGoal = async (name: string, target: number) => {
    const newGoal = await addGoal(name, target);
    if (newGoal) {
      setGoals((g) => [newGoal, ...g]);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Remove this goal?')) return;
    const success = await deleteGoal(id);
    if (success) {
      setGoals((g) => g.filter((x) => x.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="container-custom flex min-h-screen items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h1 className="text-xl font-medium">Finance Dashboard</h1>
          <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Welcome back, {user.username || user.email.split('@')[0]}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-[var(--text-secondary)]">Viewing</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 text-sm text-[var(--text-primary)]"
            >
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {new Date(month).toLocaleDateString('en-SG', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-tertiary)]"
          >
            Logout
          </button>
        </div>
      </div>

      <Metrics {...metrics} />
      <TransactionForm goals={goals} onAdd={handleAddTransaction} />

      <div className="card mb-6">
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Transaction history
        </div>
        <TransactionList
          transactions={filteredTransactions}
          goals={goals}
          onDelete={handleDeleteTransaction}
          onUpdate={handleUpdateTransaction}
        />
      </div>

      <Goals goals={goals} onAdd={handleAddGoal} onDelete={handleDeleteGoal} />

      <Charts
        monthlyDataAll={monthlyDataAll}
        breakdownDataAll={breakdownDataAll}
        monthlyDataInvestment={monthlyDataInvestment}
        breakdownDataInvestment={breakdownDataInvestment}
        viewingMonthLabel={viewingMonthLabel}
      />
    </div>
  );
}
