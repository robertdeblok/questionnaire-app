import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { text, type, required, options } = body

    console.log('Updating question:', { id, text, type, optionsCount: options?.length })
    console.log('Options to save:', JSON.stringify(options, null, 2))

    // Use a transaction to ensure atomic operations
    const question = await prisma.$transaction(async (tx) => {
      // First, delete existing options
      await tx.option.deleteMany({
        where: { questionId: id }
      })

      // Then update question with new options
      return await tx.question.update({
        where: { id },
        data: {
          text,
          type,
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
    })

    console.log('Question updated successfully:', { id: question.id, optionsCount: question.options.length })
    return NextResponse.json(question)
  } catch (error: any) {
    console.error('Error updating question:', error)
    
    // Get detailed error info
    const errorDetails = {
      message: error.message || 'Unknown error',
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
    
    console.error('Full error details:', JSON.stringify(errorDetails, null, 2))
    
    return NextResponse.json({ 
      error: 'Failed to update question', 
      details: errorDetails
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.question.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
