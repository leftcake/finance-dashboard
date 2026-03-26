import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取所有目标
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

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error loading goals:', error)
    return NextResponse.json(
      { error: 'Failed to load goals' },
      { status: 500 }
    )
  }
}

// POST - 添加目标
export async function POST(request: Request) {
  try {
    const { userId, name, target } = await request.json()

    if (!userId || !name || !target) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        name,
        target,
        saved: 0,
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error adding goal:', error)
    return NextResponse.json(
      { error: 'Failed to add goal' },
      { status: 500 }
    )
  }
}

// PUT - 更新目标
export async function PUT(request: Request) {
  try {
    const { id, userId, saved } = await request.json()

    if (!id || !userId || saved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.update({
      where: { id, userId },
      data: { saved }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error updating goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}

// DELETE - 删除目标
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Goal ID and User ID required' },
        { status: 400 }
      )
    }

    await prisma.goal.delete({
      where: { id, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}