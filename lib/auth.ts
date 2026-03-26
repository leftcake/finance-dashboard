// lib/auth.ts
export interface User {
  id: string
  email: string
  username?: string | null
  name?: string | null
}

export const register = async (email: string, password: string, username?: string) => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, message: data.message, user: data.user }
    } else {
      return { success: false, message: data.error }
    }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, message: 'Something went wrong' }
  }
}

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, message: data.message, user: data.user }
    } else {
      return { success: false, message: data.error }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Something went wrong' }
  }
}

// 获取当前登录用户（从 localStorage）
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem('currentUser')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

// 登出
export const logout = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentUser')
}