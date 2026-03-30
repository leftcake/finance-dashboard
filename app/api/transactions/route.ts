import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserIdFromCookies, unauthorized } from '@/lib/session'

type TxCategory = 'income' | 'expense' | 'savings'

async function resolveGoalIdForSavings(
  userId: string,
  category: TxCategory,
  goalId: string | null | undefined,
  options?: {
    allowReachedForCurrentGoalId?: string | null
  }
): Promise<string | null> {
  if (category !== 'savings') return null
  if (!goalId) return null
  const g = await prisma.goal.findFirst({ where: { id: goalId, userId } })
  if (!g) return null
  const sum = await prisma.transaction.aggregate({
    where: {
      userId,
      goalId,
      category: 'savings',
    } as { userId: string; goalId: string; category: 'savings' },
    _sum: { amount: true },
  })
  const saved = sum._sum.amount ?? 0
  const isReached = g.target > 0 && saved >= g.target
  if (isReached && options?.allowReachedForCurrentGoalId !== goalId) return null
  return goalId
}

// GET — list for signed-in user only
export async function GET() {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error loading transactions:', error)
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}

// POST — create
export async function POST(request: Request) {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const { date, desc, cat, amt, isInvestment, goalId } = await request.json()

    if (!date || !desc || !cat || amt === undefined || amt === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const category = cat as TxCategory
    const resolvedGoalId = await resolveGoalIdForSavings(userId, category, goalId ?? null)
    if (category === 'savings' && goalId && !resolvedGoalId) {
      return NextResponse.json(
        { error: 'Invalid savings goal (goal not found or already reached)' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        date: new Date(date),
        description: desc,
        category,
        amount: amt,
        isInvestment: Boolean(isInvestment),
        goalId: resolvedGoalId,
      } as Parameters<typeof prisma.transaction.create>[0]['data'],
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error adding transaction:', error)
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 })
  }
}

// PUT — update (editable history)
export async function PUT(request: Request) {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const { id, date, desc, cat, amt, isInvestment, goalId } = await request.json()

    if (!id || !date || !desc || !cat || amt === undefined || amt === null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const category = cat as TxCategory
    const resolvedGoalId = await resolveGoalIdForSavings(userId, category, goalId ?? null, {
      allowReachedForCurrentGoalId: existing.goalId ?? null,
    })
    if (category === 'savings' && goalId && !resolvedGoalId) {
      return NextResponse.json(
        { error: 'Invalid savings goal (goal not found or already reached)' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        date: new Date(date),
        description: desc,
        category,
        amount: amt,
        isInvestment: Boolean(isInvestment),
        goalId: category === 'savings' ? resolvedGoalId : null,
      } as Parameters<typeof prisma.transaction.update>[0]['data'],
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(request: Request) {
  try {
    const userId = await getSessionUserIdFromCookies()
    if (!userId) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
    }

    await prisma.transaction.delete({
      where: { id, userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
