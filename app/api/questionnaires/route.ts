import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const questionnaires = await prisma.questionnaire.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          }
        },
        locations: true,
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(questionnaires)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questionnaires' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description } = body

    const questionnaire = await prisma.questionnaire.create({
      data: {
        title,
        description
      }
    })

    return NextResponse.json(questionnaire)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create questionnaire' }, { status: 500 })
  }
}
