import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionnaireId, locationId, ipAddress, userAgent } = body

    // Onbekende of kapotte QR-code: toch de vragenlijst tonen, zonder locatie
    let geldigeLocatie: string | null = null
    if (locationId) {
      const loc = await prisma.location.findUnique({ where: { id: String(locationId) } })
      geldigeLocatie = loc ? loc.id : null
    }

    const session = await prisma.session.create({
      data: {
        questionnaireId,
        locationId: geldigeLocatie,
        ipAddress,
        userAgent
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
