import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** HttpOnly session cookie (not readable by JS — reduces XSS session theft). */
export const SESSION_COOKIE = 'fd_session'

/** Default session lifetime (seconds). */
export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 days

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function sessionCookieOptions() {
  const prod = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true as const,
    secure: prod,
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE_SEC,
    path: '/',
  }
}

export async function createUserSession(userId: string): Promise<string> {
  await prisma.session.deleteMany({ where: { userId } })
  const sessionToken = generateSessionToken()
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000)
  await prisma.session.create({
    data: { sessionToken, userId, expires },
  })
  return sessionToken
}

export async function deleteSessionByToken(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({ where: { sessionToken } })
}

/**
 * Resolve logged-in user id from DB session; delete row if expired.
 */
export async function resolveSessionUserId(sessionToken: string | undefined): Promise<string | null> {
  if (!sessionToken) return null
  const session = await prisma.session.findUnique({
    where: { sessionToken },
  })
  if (!session) return null
  if (session.expires < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {})
    return null
  }
  return session.userId
}

export async function getSessionUserIdFromCookies(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  return resolveSessionUserId(token)
}

export function attachSessionCookie(res: NextResponse, sessionToken: string): NextResponse {
  res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions())
  return res
}

export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions(),
    maxAge: 0,
  })
  return res
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
