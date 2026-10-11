'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/firebase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send a reset link. Try again.')
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
          <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-premium-gold">Reset your password</h1>
          <p className="mt-2 text-center text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">We’ll email you a secure link to choose a new password.</p>
          {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
          {sent ? (
            <div role="status" className="mt-7 rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-[#1d1d1f] dark:border-white/15 dark:bg-black dark:text-[#f5f5f7]">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox and spam folder.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Email</label>
                <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] dark:border-white/[0.12] dark:bg-black dark:text-[#f5f5f7]" />
              </div>
              <button type="submit" disabled={busy} className="min-h-12 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">{busy ? 'Sending link…' : 'Send reset link'}</button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Remembered it? <Link href="/login" className="font-medium underline underline-offset-4">Back to sign in</Link></p>
        </section>
      </main>
    </div>
  )
}
