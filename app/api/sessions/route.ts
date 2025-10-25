import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionnaireId, locationId, ipAddress, userAgent } = body

    const session = await prisma.session.create({
      data: {
        questionnaireId,
        locationId,
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
