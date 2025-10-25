import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionnaireId: string }> }
) {
  try {
    const { questionnaireId } = await params
    let settings = await prisma.questionnaireSettings.findUnique({
      where: { questionnaireId }
    })

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.questionnaireSettings.create({
        data: {
          questionnaireId
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionnaireId: string }> }
) {
  try {
    const { questionnaireId } = await params
    const body = await request.json()
    const {
      defaultLanguage,
      enabledLanguages,
      labelPreviousEn,
      labelNextEn,
      labelSubmitEn,
      labelPreviousNl,
      labelNextNl,
      labelSubmitNl,
      labelThankYouEn,
      labelThankYouNl,
      labelCompletedEn,
      labelCompletedNl,
      labelSingleChoiceEn,
      labelSingleChoiceNl,
      labelMultipleChoiceEn,
      labelMultipleChoiceNl,
      labelYourAnswerEn,
      labelYourAnswerNl,
      labelTextPlaceholderEn,
      labelTextPlaceholderNl,
      labelOtherPlaceholderEn,
      labelOtherPlaceholderNl,
      labelLoadingEn,
      labelLoadingNl,
      labelQuestionOfEn,
      labelQuestionOfNl
    } = body

    const settings = await prisma.questionnaireSettings.upsert({
      where: { questionnaireId },
      update: {
        defaultLanguage,
        enabledLanguages,
        labelPreviousEn,
        labelNextEn,
        labelSubmitEn,
        labelPreviousNl,
        labelNextNl,
        labelSubmitNl,
        labelThankYouEn,
        labelThankYouNl,
        labelCompletedEn,
        labelCompletedNl,
        labelSingleChoiceEn,
        labelSingleChoiceNl,
        labelMultipleChoiceEn,
        labelMultipleChoiceNl,
        labelYourAnswerEn,
        labelYourAnswerNl,
        labelTextPlaceholderEn,
        labelTextPlaceholderNl,
        labelOtherPlaceholderEn,
        labelOtherPlaceholderNl,
        labelLoadingEn,
        labelLoadingNl,
        labelQuestionOfEn,
        labelQuestionOfNl
      },
      create: {
        questionnaireId,
        defaultLanguage,
        enabledLanguages,
        labelPreviousEn,
        labelNextEn,
        labelSubmitEn,
        labelPreviousNl,
        labelNextNl,
        labelSubmitNl,
        labelThankYouEn,
        labelThankYouNl,
        labelCompletedEn,
        labelCompletedNl,
        labelSingleChoiceEn,
        labelSingleChoiceNl,
        labelMultipleChoiceEn,
        labelMultipleChoiceNl,
        labelYourAnswerEn,
        labelYourAnswerNl,
        labelTextPlaceholderEn,
        labelTextPlaceholderNl,
        labelOtherPlaceholderEn,
        labelOtherPlaceholderNl,
        labelLoadingEn,
        labelLoadingNl,
        labelQuestionOfEn,
        labelQuestionOfNl
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
