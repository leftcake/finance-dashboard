// 这个文件现在只作为 API 调用的包装器
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