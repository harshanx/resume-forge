'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, FileCheck2, FileText, Gauge, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentSessionUser } from '@/lib/auth'

const steps = [
  ['01', 'Add your story', 'Move through a focused form for experience, projects, skills, and education.'],
  ['02', 'Refine the details', 'Use ATS checks and job analysis to make each version more relevant.'],
  ['03', 'Generate with confidence', 'Preview a clean, readable PDF before you download or save it.'],
  ['04', 'Apply with clarity', 'Keep targeted versions in one place for every opportunity.'],
]

export default function Home() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true
    const checkSession = async () => {
      try {
        const user = await getCurrentSessionUser()
        if (!active) return

        if (!user) {
          router.replace('/login')
          return
        }
        setCheckingSession(false)
      } catch (error) {
        console.error('Could not restore the Supabase session:', error)
        if (active) router.replace('/login')
      }
    }
    checkSession()
    return () => { active = false }
  }, [router])

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-white text-sm text-[#6e6e73] dark:bg-black dark:text-[#a1a1a6]">Checking your session…</main>
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-black">
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-24 text-center sm:px-8 sm:pb-28 sm:pt-32">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium tracking-[-0.01em] text-[#6e6e73] dark:border-white/[0.12] dark:bg-[#121212] dark:text-[#a1a1a6]">
            <span className="h-1.5 w-1.5 rounded-full bg-black dark:bg-white" />
            LaTeX Engine 2.0 <span className="text-[#86868b]">•</span> ATS Compliant <span className="text-[#86868b]">•</span> Single Page Guaranteed
          </p>
          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight text-[#1d1d1f] sm:text-6xl md:text-7xl dark:text-[#f5f5f7]">A resume that gets out of your way.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#6e6e73] md:text-xl dark:text-[#a1a1a6]">Turn your experience into a focused, ATS-ready resume. Built for clear thinking, quick tailoring, and a polished final PDF.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/builder" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] focus-visible:ring-black/30 active:scale-[0.98] dark:bg-white dark:text-black dark:focus-visible:ring-white/30">Create your resume <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/job-analyzer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/15 px-7 py-3 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04] dark:border-white/20 dark:text-[#f5f5f7] dark:hover:bg-white/[0.05]">Analyze a job description</Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28" aria-labelledby="benefits-heading">
          <h2 id="benefits-heading" className="sr-only">ResumeForge benefits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="group rounded-3xl border border-black/[0.06] bg-[#f5f5f7] p-7 transition-colors hover:border-black/20 dark:border-white/[0.08] dark:bg-[#121212] dark:hover:border-white/20 sm:p-9">
              <div className="flex items-start justify-between gap-6"><div><p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Built for the first scan</p><h3 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Clear structure. No formatting noise.</h3></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/[0.08] bg-white dark:border-white/[0.1] dark:bg-[#161617]"><FileCheck2 className="h-5 w-5" /></span></div>
              <p className="mt-10 max-w-md text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">Professional templates, standard headings, and selectable text help recruiters and applicant tracking systems read what matters.</p>
            </article>
            <article className="group rounded-3xl border border-black/[0.06] bg-[#f5f5f7] p-7 transition-colors hover:border-black/20 dark:border-white/[0.08] dark:bg-[#121212] dark:hover:border-white/20 sm:p-9">
              <div className="flex items-start justify-between gap-6"><div><p className="text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Tailor with intent</p><h3 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Know what your resume is missing.</h3></div><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/[0.08] bg-white dark:border-white/[0.1] dark:bg-[#161617]"><Gauge className="h-5 w-5" /></span></div>
              <p className="mt-10 max-w-md text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">Compare a saved version against a role, identify skill gaps, and refine the details before you apply.</p>
            </article>
            <article className="rounded-3xl border border-black/[0.06] bg-black p-7 text-white md:col-span-2 dark:border-white/[0.08] dark:bg-[#161617] sm:p-9">
              <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]"><div><span className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10"><Sparkles className="h-5 w-5" /></span><p className="mt-7 text-sm text-white/65">One page, thoughtfully optimized</p><h3 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">A polished PDF, generated when you are ready.</h3></div><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-sm text-white/70 md:w-72"><div className="flex items-center gap-2 text-white"><Check className="h-4 w-4" /> Live PDF preview</div><div className="mt-3 flex items-center gap-2"><Check className="h-4 w-4" /> One-page validation</div><div className="mt-3 flex items-center gap-2"><Check className="h-4 w-4" /> Saved versions</div></div></div>
            </article>
          </div>
        </section>

        <section className="border-y border-black/[0.06] bg-[#f5f5f7]/70 py-20 dark:border-white/[0.08] dark:bg-[#121212]/70 sm:py-28" aria-labelledby="process-heading">
          <div className="mx-auto max-w-6xl px-5 sm:px-8"><div className="max-w-xl"><p className="text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6]">A quieter workflow</p><h2 id="process-heading" className="mt-3 text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">From draft to download in four steps.</h2></div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([number, title, description]) => <li key={number} className="rounded-3xl border border-black/[0.06] bg-white p-6 dark:border-white/[0.08] dark:bg-[#161617]"><span className="grid h-10 w-10 place-items-center rounded-xl border border-black/[0.08] bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] dark:border-white/[0.1] dark:bg-[#121212] dark:text-[#f5f5f7]">{number}</span><h3 className="mt-8 text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p></li>)}</ol>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-[#86868b] sm:flex-row sm:items-center sm:justify-between sm:px-8"><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> ResumeForge</div><p>Made for your next clear step.</p></footer>
    </div>
  )
}
