import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId, optionId, nextQuestionId, condition } = body

    const logicRule = await prisma.logicRule.create({
      data: {
        questionId,
        optionId,
        nextQuestionId,
        condition
      }
    })

    return NextResponse.json(logicRule)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create logic rule' }, { status: 500 })
  }
}
