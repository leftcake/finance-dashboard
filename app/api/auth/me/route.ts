import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserIdFromCookies, unauthorized } from '@/lib/session'

export async function GET() {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
      },
    })

    if (!user) {
      return unauthorized()
    }

    return NextResponse.json(user)
  } catch (e) {
    console.error('auth/me:', e)
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 })
  }
}
