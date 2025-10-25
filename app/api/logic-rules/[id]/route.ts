import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { optionId, nextQuestionId, condition } = body

    const logicRule = await prisma.logicRule.update({
      where: { id },
      data: {
        optionId,
        nextQuestionId,
        condition
      }
    })

    return NextResponse.json(logicRule)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update logic rule' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.logicRule.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete logic rule' }, { status: 500 })
  }
}
