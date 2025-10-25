import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { questionnaireId, newTitle } = await request.json()

    // Get the original questionnaire with all its relations
    const original = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: { orderBy: { order: 'asc' } },
            logicRules: true
          }
        },
        locations: true,
        settings: true
      }
    })

    if (!original) {
      return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 })
    }

    const duplicated = await prisma.$transaction(async (tx) => {
      const newQuestionnaire = await tx.questionnaire.create({
        data: {
          title: (newTitle && String(newTitle).trim()) || `${original.title} (Copy)`,
          description: original.description || null
        }
      })

      if (original.settings) {
        const { id: _sid, questionnaireId: _qid, createdAt: _sc, updatedAt: _su, ...settingsData } = original.settings
        await tx.questionnaireSettings.create({
          data: {
            ...settingsData,
            questionnaireId: newQuestionnaire.id
          }
        })
      }

      const questionIdMap = new Map<string, string>()
      const optionIdMap = new Map<string, string>()

      for (const question of original.questions) {
        const { id: oldQuestionId, options, logicRules, createdAt: _qc, updatedAt: _qu, questionnaireId: _oqid, ...questionData } = question
        const newQuestion = await tx.question.create({
          data: {
            ...questionData,
            questionnaireId: newQuestionnaire.id
          }
        })
        questionIdMap.set(oldQuestionId, newQuestion.id)

        for (const option of options) {
          const { id: oldOptionId, questionId: _oldQid, ...optionData } = option
          const newOption = await tx.option.create({
            data: {
              ...optionData,
              questionId: newQuestion.id
            }
          })
          optionIdMap.set(oldOptionId, newOption.id)
        }
      }

      for (const question of original.questions) {
        for (const rule of question.logicRules) {
          const { id: _rid, questionId, optionId, nextQuestionId, condition } = rule as any
          await tx.logicRule.create({
            data: {
              questionId: questionIdMap.get(questionId)!,
              optionId: optionId ? optionIdMap.get(optionId)! : null,
              nextQuestionId: nextQuestionId ? questionIdMap.get(nextQuestionId)! : null,
              condition
            }
          })
        }
      }

      for (const location of original.locations) {
        const { id: _lid, questionnaireId: _lqid, createdAt: _lc, ...locationData } = location
        await tx.location.create({
          data: {
            ...locationData,
            qrCode: uuidv4(),
            questionnaireId: newQuestionnaire.id
          }
        })
      }

      return newQuestionnaire
    })

    return NextResponse.json(duplicated)
  } catch (error) {
    console.error('Error duplicating questionnaire:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate questionnaire' },
      { status: 500 }
    )
  }
}
