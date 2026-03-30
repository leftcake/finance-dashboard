import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Baseline security headers for HTML + API responses.
 * Session stays in HttpOnly cookie; proxy does not read DB.
 */
export function proxy(_request: NextRequest) {
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
