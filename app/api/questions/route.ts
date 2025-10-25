import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionnaireId, text, type, order, required, options } = body

    console.log('Creating question:', { questionnaireId, text, type, order, optionsCount: options?.length })
    console.log('Options to create:', JSON.stringify(options, null, 2))

    const question = await prisma.question.create({
      data: {
        questionnaireId,
        text,
        type,
        order,
        required,
        options: {
          create: options?.map((opt: any, idx: number) => ({
            text: opt.text,
            order: idx,
            isOther: opt.isOther || false
          })) || []
        }
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        logicRules: true
      }
    })

    console.log('Question created successfully:', { id: question.id, optionsCount: question.options.length })
    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error creating question:', error)
    
    // Get detailed error info
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
    
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2))
    
    return NextResponse.json({ 
      error: 'Failed to create question', 
      details: errorDetails
    }, { status: 500 })
  }
}
