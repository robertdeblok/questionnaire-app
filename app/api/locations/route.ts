import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionnaireId, name } = body

    const qrCode = uuidv4()

    const location = await prisma.location.create({
      data: {
        questionnaireId,
        name,
        qrCode
      }
    })

    return NextResponse.json(location)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}
