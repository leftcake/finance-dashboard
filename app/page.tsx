'use client';

import { useState, useEffect } from 'react';
import ClientOnly from '@/components/ClientOnly';
import Metrics from '@/components/Metrics';
import TransactionForm from '@/components/TransactionForm';
import Charts from '@/components/Charts';
import TransactionList from '@/components/TransactionList';
import Goals from '@/components/Goals';
import LoginModal from '@/components/LoginModal';
import { Transaction, Goal } from '@/lib/types';
import { register, login } from '@/lib/auth';
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
  loadGoals,
  addGoal,
  updateGoal,
  deleteGoal,
} from '@/lib/database';
import {
  getAvailableMonths,
  filterByMonth,
  calculateMetrics,
  prepareMonthlyChartData,
  prepareBreakdownData,
} from '@/lib/utils';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; username?: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 检查登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      loadUserData(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  // 加载用户数据
  const loadUserData = async (userId: string) => {
    const [loadedTxs, loadedGoals] = await Promise.all([
      loadTransactions(userId),
      loadGoals(userId),
    ]);
    
    setTransactions(loadedTxs);
    setGoals(loadedGoals);

    const months = getAvailableMonths(loadedTxs);
    setAvailableMonths(months);
    if (months.length > 0) {
      setSelectedMonth(months[0]);
    }
    setLoading(false);
  };

  // 登录成功
  const handleLoginSuccess = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success && result.user) {
      const user = result.user as { id: string; email: string; username?: string };
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      await loadUserData(user.id);
      setShowLoginModal(false);
    }
    return result;
  };

  // 注册
  const handleRegister = async (email: string, password: string, username?: string) => {
    const result = await register(email, password, username);
    if (result.success && result.user) {
      // 注册成功后自动登录
      return handleLoginSuccess(email, password);
    }
    return result;
  };

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setTransactions([]);
    setGoals([]);
    setSelectedMonth('');
    setAvailableMonths([]);
  };

  const filteredTransactions = filterByMonth(transactions, selectedMonth);
  const metrics = calculateMetrics(filteredTransactions);
  
  const monthlyData = prepareMonthlyChartData(transactions, availableMonths.slice(0, 6).reverse());
  const breakdownData = prepareBreakdownData(metrics.income, metrics.expense, metrics.savings);

  // 添加交易
  const handleAddTransaction = async (tx: Omit<Transaction, 'id'>) => {
    if (!currentUser) return;
    const newTx = await addTransaction(currentUser.id, tx);
    if (newTx) {
      setTransactions([newTx, ...transactions]);
      const months = getAvailableMonths([newTx, ...transactions]);
      setAvailableMonths(months);
    }
  };

  // 删除交易
  const handleDeleteTransaction = async (id: string) => {
    if (!currentUser) return;
    if (!confirm('Delete this transaction?')) return;
    const success = await deleteTransaction(currentUser.id, id);
    if (success) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // 添加目标
  const handleAddGoal = async (name: string, target: number) => {
    if (!currentUser) return;
    const newGoal = await addGoal(currentUser.id, name, target);
    if (newGoal) {
      setGoals([newGoal, ...goals]);
    }
  };

  // 添加储蓄到目标
  const handleAddToGoal = async (id: string, amount: number) => {
    if (!currentUser) return;
    const goal = goals.find(g => g.id === id);
    if (goal) {
      const newSaved = Math.min(goal.target, goal.saved + amount);
      const success = await updateGoal(currentUser.id, id, newSaved);
      if (success) {
        setGoals(goals.map(g => 
          g.id === id ? { ...g, saved: newSaved } : g
        ));
      }
    }
  };

  // 删除目标
  const handleDeleteGoal = async (id: string) => {
    if (!currentUser) return;
    if (!confirm('Remove this goal?')) return;
    const success = await deleteGoal(currentUser.id, id);
    if (success) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="container-custom min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[var(--text-secondary)]">Loading...</div>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isLoggedIn) {
    return (
      <ClientOnly>
        <div className="container-custom min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Finance Dashboard</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Personal financial statement tracker
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg font-medium hover:opacity-80 transition-opacity"
            >
              Get Started
            </button>
            <LoginModal
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              onLoginSuccess={handleLoginSuccess}
              onRegister={handleRegister}
            />
          </div>
        </div>
      </ClientOnly>
    );
  }

  // 已登录状态
  return (
    <ClientOnly>
      <div className="container-custom">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-5 flex-wrap gap-2.5">
          <div>
            <h1 className="text-xl font-medium">Finance Dashboard</h1>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              Welcome back, {currentUser?.username || currentUser?.email?.split('@')[0]}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-[var(--text-secondary)]">Viewing</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-9 px-2.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {new Date(month).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Metrics */}
        <Metrics {...metrics} />

        {/* Add Transaction Form */}
        <TransactionForm onAdd={handleAddTransaction} />

        {/* Charts */}
        <Charts monthlyData={monthlyData} breakdownData={breakdownData} />

        {/* Transaction History */}
        <div className="card mb-6">
          <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Transaction history
          </div>
          <TransactionList
            transactions={filteredTransactions}
            onDelete={handleDeleteTransaction}
          />
        </div>

        {/* Savings Goals */}
        <Goals
          goals={goals}
          onAdd={handleAddGoal}
          onAddSavings={handleAddToGoal}
          onDelete={handleDeleteGoal}
        />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegister={handleRegister}
      />
    </ClientOnly>
  );
}