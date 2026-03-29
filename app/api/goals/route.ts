import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserIdFromCookies, unauthorized } from '@/lib/session'

async function savingsSumForGoal(userId: string, goalId: string): Promise<number> {
  const agg = await prisma.transaction.aggregate({
    // Prisma types include goalId after `npx prisma generate`
    where: {
      userId,
      goalId,
      category: 'savings',
    } as { userId: string; goalId: string; category: 'savings' },
    _sum: { amount: true },
  })
  return agg._sum?.amount ?? 0
}

async function goalsWithComputedSaved(userId: string) {
  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  const out = await Promise.all(
    goals.map(async (g) => ({
      id: g.id,
      name: g.name,
      target: g.target,
      saved: await savingsSumForGoal(userId, g.id),
      createdAt: g.createdAt,
    }))
  )
  return out
}

export async function GET() {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const goals = await goalsWithComputedSaved(userId)
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error loading goals:', error)
    return NextResponse.json({ error: 'Failed to load goals' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const { name, target } = await request.json()

    if (!name || !target) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        name,
        target,
        saved: 0,
      },
    })

    const saved = await savingsSumForGoal(userId, goal.id)

    return NextResponse.json(
      {
        id: goal.id,
        name: goal.name,
        target: goal.target,
        saved,
        createdAt: goal.createdAt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding goal:', error)
    return NextResponse.json({ error: 'Failed to add goal' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 })
    }

    await prisma.goal.delete({
      where: { id, userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
