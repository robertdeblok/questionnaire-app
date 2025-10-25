import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, questionId, optionId, textAnswer } = body

    const answer = await prisma.answer.create({
      data: {
        sessionId,
        questionId,
        optionId,
        textAnswer
      }
    })

    return NextResponse.json(answer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body

    // Batch create/update answers
    const results = await Promise.all(
      answers.map((ans: any) =>
        prisma.answer.create({
          data: {
            sessionId: ans.sessionId,
            questionId: ans.questionId,
            optionId: ans.optionId,
            textAnswer: ans.textAnswer
          }
        })
      )
    )

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const questionId = searchParams.get('questionId')

    if (!sessionId || !questionId) {
      return NextResponse.json({ error: 'Missing sessionId or questionId' }, { status: 400 })
    }

    await prisma.answer.deleteMany({
      where: {
        sessionId,
        questionId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete answers' }, { status: 500 })
  }
}
