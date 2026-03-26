import { Transaction, Goal } from './types'

export const loadTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const response = await fetch(`/api/transactions?userId=${userId}`)
    const data = await response.json()
    
    return data.map((t: any) => ({
      id: t.id,
      date: t.date.split('T')[0],
      desc: t.description,
      cat: t.category,
      amt: t.amount,
    }))
  } catch (error) {
    console.error('Error loading transactions:', error)
    return []
  }
}

export const addTransaction = async (
  userId: string, 
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction | null> => {
  try {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...transaction })
    })
    
    const data = await response.json()
    
    return {
      id: data.id,
      date: data.date.split('T')[0],
      desc: data.description,
      cat: data.category,
      amt: data.amount,
    }
  } catch (error) {
    console.error('Error adding transaction:', error)
    return null
  }
}

export const deleteTransaction = async (userId: string, id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/transactions?id=${id}&userId=${userId}`, {
      method: 'DELETE'
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return false
  }
}

export const loadGoals = async (userId: string): Promise<Goal[]> => {
  try {
    const response = await fetch(`/api/goals?userId=${userId}`)
    const data = await response.json()
    
    return data.map((g: any) => ({
      id: g.id,
      name: g.name,
      target: g.target,
      saved: g.saved,
    }))
  } catch (error) {
    console.error('Error loading goals:', error)
    return []
  }
}

export const addGoal = async (userId: string, name: string, target: number): Promise<Goal | null> => {
  try {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, target })
    })
    
    const data = await response.json()
    
    return {
      id: data.id,
      name: data.name,
      target: data.target,
      saved: data.saved,
    }
  } catch (error) {
    console.error('Error adding goal:', error)
    return null
  }
}

export const updateGoal = async (userId: string, id: string, saved: number): Promise<boolean> => {
  try {
    const response = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, userId, saved })
    })
    return response.ok
  } catch (error) {
    console.error('Error updating goal:', error)
    return false
  }
}

export const deleteGoal = async (userId: string, id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/goals?id=${id}&userId=${userId}`, {
      method: 'DELETE'
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting goal:', error)
    return false
  }
}