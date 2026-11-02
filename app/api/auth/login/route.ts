import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}))
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Onjuist wachtwoord' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('qa_admin', process.env.ADMIN_TOKEN || '', {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 86400, path: '/',
  })
  return res
}
