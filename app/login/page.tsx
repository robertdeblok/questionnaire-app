'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [wachtwoord, setWachtwoord] = useState('')
  const [fout, setFout] = useState('')
  const [bezig, setBezig] = useState(false)
  const router = useRouter()
  const params = useSearchParams()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBezig(true); setFout('')
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: wachtwoord }),
    })
    setBezig(false)
    if (r.ok) router.push(params.get('naar') || '/admin')
    else setFout('Onjuist wachtwoord')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-1">Voedselbankanalyse</h1>
        <p className="text-sm text-gray-500 mb-6">Log in om het beheer te openen.</p>
        <input type="password" value={wachtwoord} onChange={e => setWachtwoord(e.target.value)}
          placeholder="Wachtwoord" required autoFocus
          className="w-full border rounded-md px-3 py-2 mb-3" />
        {fout && <p className="text-sm text-red-600 mb-3">{fout}</p>}
        <button type="submit" disabled={bezig}
          className="w-full bg-blue-600 text-white rounded-md py-2 font-medium disabled:opacity-50">
          {bezig ? 'Bezig…' : 'Inloggen'}
        </button>
      </form>
    </div>
  )
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>
}
