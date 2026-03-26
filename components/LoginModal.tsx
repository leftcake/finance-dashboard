'use client';

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onRegister: (email: string, password: string, username?: string) => Promise<{ success: boolean; message: string }>;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onRegister }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (isLogin) {
      // 登录
      const result = await onLoginSuccess(email, password);
      if (result.success) {
        onClose();
        setEmail('');
        setPassword('');
      } else {
        setError(result.message);
      }
    } else {
      // 注册
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const result = await onRegister(email, password, username);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
          setUsername('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        setError(result.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
            >
              ×
            </button>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Username (optional)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)]"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-md focus:outline-none focus:border-[var(--border-md)]"
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-md font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccessMessage('');
              }}
              className="text-sm text-[#378ADD] hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-secondary)] text-center">
                Demo account: <span className="font-mono">demo@example.com / demo123</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}