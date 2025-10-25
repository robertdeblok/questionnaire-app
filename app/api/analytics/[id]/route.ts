import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionnaireId } = await params

    // Total sessions
    const totalSessions = await prisma.session.count({
      where: { questionnaireId }
    })

    // Completed sessions
    const completedSessions = await prisma.session.count({
      where: {
        questionnaireId,
        completed: true
      }
    })

    // Incomplete sessions (started but not completed)
    const incompleteSessions = totalSessions - completedSessions

    // Sessions by location
    const sessionsByLocation = await prisma.location.findMany({
      where: { questionnaireId },
      include: {
        _count: {
          select: {
            sessions: true
          }
        }
      }
    })

    // Completion rate by location
    const locationStats = await Promise.all(
      sessionsByLocation.map(async (location) => {
        const completed = await prisma.session.count({
          where: {
            locationId: location.id,
            completed: true
          }
        })
        
        return {
          locationName: location.name,
          totalScans: location._count.sessions,
          completedResponses: completed,
          incompleteSessions: location._count.sessions - completed,
          completionRate: location._count.sessions > 0 
            ? ((completed / location._count.sessions) * 100).toFixed(2) 
            : 0
        }
      })
    )

    // Question answer distribution
    const questions = await prisma.question.findMany({
      where: { questionnaireId },
      include: {
        options: {
          include: {
            _count: {
              select: {
                answers: true
              }
            }
          }
        }
      }
    })

    const questionStats = questions.map((question) => ({
      questionId: question.id,
      questionText: question.text,
      type: question.type,
      answerDistribution: question.options.map((option) => ({
        optionText: option.text,
        count: option._count.answers
      }))
    }))

    return NextResponse.json({
      totalSessions,
      completedSessions,
      incompleteSessions,
      completionRate: totalSessions > 0 
        ? ((completedSessions / totalSessions) * 100).toFixed(2) 
        : 0,
      locationStats,
      questionStats
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionnaireId } = await params
    await prisma.session.deleteMany({
      where: { questionnaireId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear analytics' }, { status: 500 })
  }
}
