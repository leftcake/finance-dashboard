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
  if (goals.length === 0) return []

  const savingsByGoal = await prisma.transaction.groupBy({
    by: ['goalId'],
    where: {
      userId,
      category: 'savings',
      goalId: { not: null },
    } as { userId: string; category: 'savings'; goalId: { not: null } },
    _sum: { amount: true },
  })

  const savedMap = new Map<string, number>(
    savingsByGoal
      .filter((row) => typeof row.goalId === 'string')
      .map((row) => [row.goalId as string, row._sum.amount ?? 0])
  )

  return goals.map((g) => ({
    id: g.id,
    name: g.name,
    target: g.target,
    saved: savedMap.get(g.id) ?? 0,
    createdAt: g.createdAt,
  }))
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
