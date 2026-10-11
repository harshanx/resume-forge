'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import { getSafeReturnPath } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.replace(getSafeReturnPath(searchParams.get('next')))
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-md rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-7 dark:border-white/[0.1] dark:bg-[#121212] sm:p-9">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#86868b]">Welcome back</p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Sign in to ResumeForge</h1>
        <p className="mt-2 text-center text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">Pick up where you left off and keep your applications moving.</p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-7 space-y-5">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus-visible:ring-black/30 dark:border-white/[0.12] dark:bg-[#000] dark:text-[#f5f5f7] dark:placeholder:text-[#6e6e73]"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[#6e6e73] underline underline-offset-4 hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-white">Forgot password?</Link>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus-visible:ring-black/30 dark:border-white/[0.12] dark:bg-[#000] dark:text-[#f5f5f7] dark:placeholder:text-[#6e6e73]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-[#1d1d1f] underline underline-offset-4 hover:opacity-70 dark:text-[#f5f5f7]">
            Register
          </Link>
        </p>
      </section>
      </main>
    </div>
  )
}
