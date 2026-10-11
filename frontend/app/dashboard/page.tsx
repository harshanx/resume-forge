'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Trash2, Edit, Copy, Check, X, Search } from 'lucide-react'
import { supabase } from '@/lib/firebase'
import { getCurrentSessionUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'

interface Resume {
  id: string
  version_name: string
  created_at: string
  updated_at?: string
  template: string
  resume_data: Record<string, unknown>
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const user = await getCurrentSessionUser()
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      setUser(user)
      loadResumes()
    }

    getCurrentUser()
  }, [pathname, router])

  useEffect(() => {
    if (searchParams.get('saved') === '1') {
      setDashboardMessage('Your resume is saved and ready in your workspace.')
      router.replace('/dashboard', { scroll: false })
    }
  }, [router, searchParams])

  const loadResumes = async () => {
    try {
      const user = await getCurrentSessionUser()
      if (!user) return

      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResumes(data || [])
    } catch (error) {
      console.error('Error loading resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    try {
      const { error } = await supabase
        .from('resume_versions')
        .delete()
        .eq('id', resumeId)

      if (error) throw error
      setResumes((current) => current.filter((resume) => resume.id !== resumeId))
      setPendingDeleteId(null)
      setDashboardMessage('Resume deleted.')
    } catch (error) {
      console.error('Error deleting resume:', error)
      setDashboardError(error instanceof Error ? error.message : 'Could not delete this resume. Please try again.')
    }
  }

  const handleRenameResume = async (resumeId: string) => {
    const versionName = editingName.trim()
    if (!versionName) {
      setDashboardError('Enter a name before saving.')
      return
    }
    const { error } = await supabase.from('resume_versions').update({ version_name: versionName }).eq('id', resumeId)
    if (error) {
      setDashboardError(error.message)
      return
    }
    setResumes((current) => current.map((resume) => resume.id === resumeId ? { ...resume, version_name: versionName, updated_at: new Date().toISOString() } : resume))
    setEditingNameId(null)
    setDashboardError('')
    setDashboardMessage('Resume name updated.')
  }

  const handleDuplicateResume = async (resume: Resume) => {
    const currentUser = await getCurrentSessionUser()
    if (!currentUser) return
    const { error } = await supabase.from('resume_versions').insert({
      user_id: currentUser.id,
      version_name: `${resume.version_name} copy`,
      resume_data: resume.resume_data,
      template: resume.template,
    })
    if (error) {
      setDashboardError(error.message)
      return
    }
    setDashboardError('')
    setDashboardMessage('Resume duplicated. Rename it for the role you’re targeting.')
    const { data } = await supabase.from('resume_versions').select('*').eq('user_id', currentUser.id).order('updated_at', { ascending: false })
    setResumes(data || [])
  }

  const visibleResumes = resumes
    .filter((resume) => resume.version_name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())

  const handleEditResume = (resume: Resume) => {
    // Navigate to builder with resume data
    router.push(`/builder?resumeId=${resume.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <main className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-5 text-sm text-[#6e6e73] dark:text-[#a1a1a6]" role="status">Loading your resumes…</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Your workspace</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-premium-gold">My resumes</h1>
            <p className="mt-2 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Keep each version ready for the role you want.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="max-w-56 truncate text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{user?.user_metadata?.name || user?.email}</span>
          <Link
            href="/builder"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Plus className="h-4 w-4" />
            <span>New resume</span>
          </Link>
        </div>
        </div>

        {dashboardMessage && <p role="status" className="mb-5 rounded-2xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] dark:border-white/[0.1] dark:bg-[#121212] dark:text-[#f5f5f7]">{dashboardMessage}</p>}
        {dashboardError && <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{dashboardError}</p>}
        {resumes.length > 0 && <div className="mb-6 max-w-md">
          <label htmlFor="resume-search" className="sr-only">Search saved resumes</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
            <input id="resume-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search saved resumes" className="min-h-11 w-full rounded-full border border-black/[0.1] bg-white pl-11 pr-4 text-sm text-[#1d1d1f] dark:border-white/[0.12] dark:bg-[#121212] dark:text-[#f5f5f7]" />
          </div>
        </div>}

        {resumes.length === 0 ? (
          <div className="rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-10 text-center dark:border-white/[0.1] dark:bg-[#121212] sm:p-14">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No resumes yet</h2>
            <p className="text-gray-600 mb-6">Create your first resume to get started</p>
            <Link
              href="/builder"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <Plus className="h-5 w-5" />
              <span>Create Resume</span>
            </Link>
          </div>
        ) : visibleResumes.length === 0 ? (
          <div className="rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-8 text-center text-sm text-[#6e6e73] dark:border-white/[0.1] dark:bg-[#121212] dark:text-[#a1a1a6]">No resumes match “{searchTerm}”.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleResumes.map((resume) => (
              <div key={resume.id} className="rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-6 transition-colors hover:border-black/20 dark:border-white/[0.1] dark:bg-[#121212] dark:hover:border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      {editingNameId === resume.id ? <div className="flex items-center gap-2">
                        <input autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} aria-label="New resume name" className="min-h-9 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white" />
                        <button onClick={() => handleRenameResume(resume.id)} aria-label="Save resume name" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-white dark:bg-white dark:text-black"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingNameId(null)} aria-label="Cancel rename" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/15 dark:border-white/20"><X className="h-4 w-4" /></button>
                      </div> : <h3 className="font-semibold text-gray-900">{resume.version_name}</h3>}
                      <p className="mt-1 text-xs text-gray-500">
                        Edited {new Date(resume.updated_at || resume.created_at).toLocaleDateString()} · {resume.template === 'modern-clean' ? 'Modern Clean' : 'ATS One-Page'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleEditResume(resume)}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => { setEditingName(resume.version_name); setEditingNameId(resume.id) }}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/15 px-3 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-black/[0.04] dark:border-white/20 dark:text-[#f5f5f7] dark:hover:bg-white/[0.05]"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Rename</span>
                  </button>
                  <button onClick={() => handleDuplicateResume(resume)} className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-black/15 px-3 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-black/[0.04] dark:border-white/20 dark:text-[#f5f5f7] dark:hover:bg-white/[0.05]">
                    <Copy className="h-4 w-4" /><span>Duplicate</span>
                  </button>
                  <button onClick={() => setPendingDeleteId(resume.id)}
                    className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-200 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {pendingDeleteId && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-5" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setPendingDeleteId(null) }}>
        <section role="alertdialog" aria-modal="true" aria-labelledby="delete-resume-title" aria-describedby="delete-resume-description" className="w-full max-w-sm rounded-3xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.1] dark:bg-[#161617]">
          <h2 id="delete-resume-title" className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Delete this resume?</h2>
          <p id="delete-resume-description" className="mt-2 text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">This removes the saved version from your dashboard. You can’t undo this action.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => setPendingDeleteId(null)} className="min-h-10 rounded-full border border-black/15 px-4 text-sm font-medium dark:border-white/20">Cancel</button>
            <button onClick={() => handleDeleteResume(pendingDeleteId)} className="min-h-10 rounded-full bg-black px-4 text-sm font-medium text-white dark:bg-white dark:text-black">Delete resume</button>
          </div>
        </section>
      </div>}
    </div>
  )
}
