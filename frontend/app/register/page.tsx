'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import { getSafeReturnPath } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      if (data.session) {
        router.replace(getSafeReturnPath(searchParams.get('next')))
      } else {
        setSuccess(`If ${email} can be registered, a confirmation link is on its way. Check your inbox to continue.`)
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-md rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-7 dark:border-white/[0.1] dark:bg-[#121212] sm:p-9">
        <p className="text-center text-xs font-medium uppercase tracking-[0.16em] text-[#86868b]">Start with a clear story</p>
        <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Create your account</h1>
        <p className="mt-2 text-center text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">Save tailored resumes and return to them whenever you need.</p>

        {success && <div role="status" className="mt-6 rounded-2xl border border-black/10 bg-white p-3 text-sm leading-6 text-[#1d1d1f] dark:border-white/15 dark:bg-black dark:text-[#f5f5f7]">{success} <Link href={`/login${searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : ''}`} className="font-medium underline underline-offset-4">Sign in</Link></div>}
        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-7 space-y-5">
          <div>
            <label htmlFor="register-name" className="mb-2 block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Name</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus-visible:ring-black/30 dark:border-white/[0.12] dark:bg-[#000] dark:text-[#f5f5f7] dark:placeholder:text-[#6e6e73]"
              required
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus-visible:ring-black/30 dark:border-white/[0.12] dark:bg-[#000] dark:text-[#f5f5f7] dark:placeholder:text-[#6e6e73]"
              required
            />
          </div>

          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-12 w-full rounded-2xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus-visible:ring-black/30 dark:border-white/[0.12] dark:bg-[#000] dark:text-[#f5f5f7] dark:placeholder:text-[#6e6e73]"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#1d1d1f] underline underline-offset-4 hover:opacity-70 dark:text-[#f5f5f7]">
            Login
          </Link>
        </p>
      </section>
      </main>
    </div>
  )
}
