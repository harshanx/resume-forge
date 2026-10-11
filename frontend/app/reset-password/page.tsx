'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/firebase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const recoveryTimeout = window.setTimeout(() => {
      if (active) setError((current) => current || 'This reset link is invalid or expired. Request a new one to continue.')
    }, 5000)
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setReady(true)
    }).catch(() => {
      if (active) setError('This reset link is invalid or expired. Request a new one to continue.')
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && (event === 'PASSWORD_RECOVERY' || session)) setReady(true)
    })
    return () => {
      active = false
      window.clearTimeout(recoveryTimeout)
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setMessage('Your password has been updated. You can sign in with the new one now.')
      window.setTimeout(() => router.replace('/login'), 1200)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update your password. Request a new reset link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-md rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-7 dark:border-white/[0.1] dark:bg-[#121212] sm:p-9">
          <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#86868b]">Account recovery</p>
          <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-premium-gold">Choose a new password</h1>
          {!ready && !error && !message && <p role="status" className="mt-4 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Checking your secure reset link…</p>}
          {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{error} <Link href="/forgot-password" className="font-medium underline underline-offset-4">Request another link</Link></p>}
          {message && <p role="status" className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-[#1d1d1f] dark:border-white/15 dark:bg-black dark:text-[#f5f5f7]">{message}</p>}
          {ready && !message && (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] dark:border-white/[0.12] dark:bg-black dark:text-[#f5f5f7]" />
              </div>
              <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">{busy ? 'Updating…' : 'Update password'}</button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]"><Link href="/login" className="font-medium underline underline-offset-4">Back to sign in</Link></p>
        </section>
      </main>
    </div>
  )
}
