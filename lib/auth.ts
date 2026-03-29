// lib/auth.ts — client helpers; auth proof is HttpOnly cookie + /api/auth/me

export interface User {
  id: string
  email: string
  username?: string | null
  name?: string | null
}

const fetchOpts: RequestInit = {
  credentials: 'include',
  cache: 'no-store',
}

export const register = async (email: string, password: string, username?: string) => {
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
      ...fetchOpts,
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, message: data.message, user: data.user as User }
    }
    return { success: false, message: data.error as string }
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
      body: JSON.stringify({ email, password }),
      ...fetchOpts,
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, message: data.message, user: data.user as User }
    }
    return { success: false, message: data.error as string }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Something went wrong' }
  }
}

/** Current user from server session (cookie). Use in client after mount. */
export async function fetchSessionUser(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', fetchOpts)
    if (!res.ok) return null
    return (await res.json()) as User
  } catch {
    return null
  }
}

/** End server session and clear HttpOnly cookie. */
export async function logoutSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', ...fetchOpts })
  } catch {
    /* ignore */
  }
}
