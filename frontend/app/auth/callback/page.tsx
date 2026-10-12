'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getSafeReturnPath } from '@/lib/auth'
import { supabase } from '@/lib/firebase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const finishSignIn = async () => {
      const requestedPath = new URL(window.location.href).searchParams.get('next')
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !data.session?.user) {
        if (active) setError(sessionError?.message || 'Google sign-in did not complete. Please try again.')
        return
      }

      const user = data.session.user
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
      const { error: profileError } = await supabase.from('users').upsert(
        { id: user.id, email: user.email, name },
        { onConflict: 'id' },
      )

      if (profileError) {
        console.error('Could not sync Google profile:', profileError)
      }

      if (active) router.replace(getSafeReturnPath(requestedPath))
    }

    finishSignIn().catch((callbackError) => {
      if (active) setError(callbackError instanceof Error ? callbackError.message : 'Google sign-in failed. Please try again.')
    })

    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-md rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-7 text-center dark:border-white/[0.1] dark:bg-[#121212] sm:p-9">
          <h1 className="text-2xl font-semibold tracking-tight text-premium-gold">Finishing sign-in</h1>
          {error ? (
            <>
              <p role="alert" className="mt-4 text-sm leading-6 text-red-700 dark:text-red-200">{error}</p>
              <Link href="/login" className="mt-6 inline-block text-sm font-medium underline underline-offset-4">Back to sign in</Link>
            </>
          ) : (
            <p role="status" className="mt-3 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Please wait while we securely connect your account.</p>
          )}
        </section>
      </main>
    </div>
  )
}
