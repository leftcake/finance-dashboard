import { Transaction, Goal, type TransactionSaveInput } from './types'

const fetchOpts: RequestInit = {
  credentials: 'include',
  cache: 'no-store',
}

function mapTransaction(data: Record<string, unknown>): Transaction {
  const dateRaw = data.date as string
  const createdRaw = data.createdAt as string
  return {
    id: data.id as string,
    date: typeof dateRaw === 'string' ? dateRaw.split('T')[0] : '',
    desc: data.description as string,
    cat: data.category as Transaction['cat'],
    amt: data.amount as number,
    isInvestment: Boolean(data.isInvestment),
    goalId: (data.goalId as string | null | undefined) ?? null,
    createdAt:
      typeof createdRaw === 'string'
        ? createdRaw
        : createdRaw
          ? new Date(createdRaw as string).toISOString()
          : new Date().toISOString(),
  }
}

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await fetch('/api/transactions', fetchOpts)
    const data = await response.json()
    if (!response.ok || !Array.isArray(data)) {
      return []
    }

    return data.map((t: Record<string, unknown>) => mapTransaction(t))
  } catch (error) {
    console.error('Error loading transactions:', error)
    return []
  }
}

export const addTransaction = async (
  transaction: TransactionSaveInput
): Promise<Transaction | null> => {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
      ...fetchOpts,
    })

    const data = await response.json()

    if (!response.ok || !data?.id || typeof data?.date !== 'string') {
      console.error('Error adding transaction:', data?.error ?? response.statusText)
      return null
    }

    return mapTransaction(data as Record<string, unknown>)
  } catch (error) {
    console.error('Error adding transaction:', error)
    return null
  }
}

export const updateTransaction = async (
  id: string,
  patch: TransactionSaveInput
): Promise<Transaction | null> => {
  try {
    const response = await fetch('/api/transactions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
      ...fetchOpts,
    })
    const data = await response.json()
    if (!response.ok || !data?.id) {
      console.error('Error updating transaction:', data?.error ?? response.statusText)
      return null
    }
    return mapTransaction(data as Record<string, unknown>)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return null
  }
}

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      ...fetchOpts,
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return false
  }
}

export const loadGoals = async (): Promise<Goal[]> => {
  try {
    const response = await fetch('/api/goals', fetchOpts)
    const data = await response.json()
    if (!response.ok || !Array.isArray(data)) {
      return []
    }

    return data.map((g: Record<string, unknown>) => ({
      id: g.id as string,
      name: g.name as string,
      target: g.target as number,
      saved: (g.saved as number) ?? 0,
      createdAt: (g.createdAt as string | undefined) ?? undefined,
    }))
  } catch (error) {
    console.error('Error loading goals:', error)
    return []
  }
}

export const addGoal = async (name: string, target: number): Promise<Goal | null> => {
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, target }),
      ...fetchOpts,
    })

    const data = await response.json()
    if (!response.ok || !data?.id) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      target: data.target,
      saved: data.saved ?? 0,
      createdAt: data.createdAt ?? undefined,
    }
  } catch (error) {
    console.error('Error adding goal:', error)
    return null
  }
}

export const deleteGoal = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/goals?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      ...fetchOpts,
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting goal:', error)
    return false
  }
}
