import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Beheer achter login: /admin/* en alle API's die het publieke formulier niet nodig heeft.
const PUBLIC_API = [
  /^POST \/api\/auth\/(login|logout)$/,
  /^GET \/api\/questionnaires\/[^/]+$/,   // formulier laadt de vragenlijst
  /^GET \/api\/settings\/[^/]+$/,        // formulier laadt labels/talen
  /^POST \/api\/sessions$/,              // sessie starten
  /^PUT \/api\/sessions\/[^/]+$/,        // sessie afronden
  /^[A-Z]+ \/api\/answers(\/.*)?$/,      // antwoorden opslaan/wijzigen
]

export function middleware(req: NextRequest) {
  const pad = req.nextUrl.pathname
  const isAdmin = pad === '/admin' || pad.startsWith('/admin/')
  if (!isAdmin && PUBLIC_API.some(re => re.test(`${req.method} ${pad}`))) return NextResponse.next()
  const token = req.cookies.get('qa_admin')?.value
  if (token && token === process.env.ADMIN_TOKEN) return NextResponse.next()
  if (pad.startsWith('/api/')) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  // achter de proxy: neem het publieke domein mee, niet de interne host
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
  const proto = (req.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim()
  return NextResponse.redirect(`${proto}://${host}/login?naar=${encodeURIComponent(pad)}`)
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] }
