import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取所有交易
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error loading transactions:', error)
    return NextResponse.json(
      { error: 'Failed to load transactions' },
      { status: 500 }
    )
  }
}

// POST - 添加交易
export async function POST(request: Request) {
  try {
    const { userId, date, desc, cat, amt } = await request.json()

    if (!userId || !date || !desc || !cat || !amt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        date: new Date(date),
        description: desc,
        category: cat,
        amount: amt,
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error adding transaction:', error)
    return NextResponse.json(
      { error: 'Failed to add transaction' },
      { status: 500 }
    )
  }
}

// DELETE - 删除交易
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Transaction ID and User ID required' },
        { status: 400 }
      )
    }

    await prisma.transaction.delete({
      where: { id, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}