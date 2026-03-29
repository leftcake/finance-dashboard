import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  SESSION_COOKIE,
  clearSessionCookie,
  deleteSessionByToken,
} from '@/lib/session'

export async function POST() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value
    if (token) {
      await deleteSessionByToken(token)
    }
    const res = NextResponse.json({ success: true })
    return clearSessionCookie(res)
  } catch (e) {
    console.error('logout:', e)
    const res = NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    return clearSessionCookie(res)
  }
}
