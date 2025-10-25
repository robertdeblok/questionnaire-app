import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' }
            },
            logicRules: {
              include: {
                option: true
              }
            }
          }
        },
        locations: true
      }
    })

    if (!questionnaire) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 })
    }

    return NextResponse.json(questionnaire)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch questionnaire' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description } = body

    const questionnaire = await prisma.questionnaire.update({
      where: { id },
      data: {
        title,
        description
      }
    })

    return NextResponse.json(questionnaire)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update questionnaire' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.questionnaire.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete questionnaire' }, { status: 500 })
  }
}
