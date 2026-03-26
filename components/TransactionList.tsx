'use client';

import { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-[var(--text-secondary)] py-5 text-sm">
        No transactions for this month. Add one above.
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs text-[var(--text-secondary)] font-medium p-1.5 pb-2 border-b border-[var(--border)]">
              Date
            </th>
            <th className="text-left text-xs text-[var(--text-secondary)] font-medium p-1.5 pb-2 border-b border-[var(--border)]">
              Description
            </th>
            <th className="text-left text-xs text-[var(--text-secondary)] font-medium p-1.5 pb-2 border-b border-[var(--border)]">
              Category
            </th>
            <th className="text-right text-xs text-[var(--text-secondary)] font-medium p-1.5 pb-2 border-b border-[var(--border)]">
              Amount
            </th>
            <th className="w-8 p-1.5 pb-2 border-b border-[var(--border)]"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx) => (
            <tr key={tx.id}>
              <td className="p-1.5 text-[var(--text-secondary)] border-b border-[var(--border)]">
                {tx.date}
              </td>
              <td className="p-1.5 border-b border-[var(--border)]">
                {tx.desc}
              </td>
              <td className="p-1.5 border-b border-[var(--border)]">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  tx.cat === 'income' ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                  tx.cat === 'expense' ? 'bg-[#FAECE7] text-[#993C1D]' :
                  'bg-[#E6F1FB] text-[#185FA5]'
                }`}>
                  {tx.cat}
                </span>
              </td>
              <td className="p-1.5 text-right border-b border-[var(--border)]">
                {formatCurrency(tx.amt)}
              </td>
              <td className="p-1.5 border-b border-[var(--border)]">
                <button
                  onClick={() => onDelete(tx.id)}
                  className="bg-none border-none text-[var(--text-secondary)] text-lg cursor-pointer hover:text-expense"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}