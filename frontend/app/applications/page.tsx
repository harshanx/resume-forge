'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Briefcase, CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { getCurrentSessionUser } from '@/lib/auth'
import { supabase } from '@/lib/firebase'

type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected'
type Application = {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  applied_on: string | null
  deadline: string | null
  notes: string
  resume_id: string | null
  updated_at: string
}
type ResumeOption = { id: string; version_name: string }

const statusLabels: Record<ApplicationStatus, string> = {
  saved: 'Saved', applied: 'Applied', interviewing: 'Interviewing', offer: 'Offer', rejected: 'Closed',
}
const statusOptions = Object.keys(statusLabels) as ApplicationStatus[]

export default function ApplicationsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [applications, setApplications] = useState<Application[]>([])
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('saved')
  const [appliedOn, setAppliedOn] = useState('')
  const [deadline, setDeadline] = useState('')
  const [resumeId, setResumeId] = useState('')
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const user = await getCurrentSessionUser()
      if (!active) return
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      const [applicationResult, resumeResult] = await Promise.all([
        supabase.from('applications').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
        supabase.from('resume_versions').select('id, version_name').eq('user_id', user.id).order('updated_at', { ascending: false }),
      ])
      if (!active) return
      if (applicationResult.error) {
        setError(applicationResult.error.code === '42P01'
          ? 'Application tracking needs its Supabase table. Run supabase_applications_migration.sql in the Supabase SQL Editor, then refresh.'
          : applicationResult.error.message)
      } else {
        setApplications((applicationResult.data || []) as Application[])
      }
      if (resumeResult.error) setError((current) => current || resumeResult.error.message)
      else setResumes(resumeResult.data || [])
      setLoading(false)
    }
    load().catch((loadError) => {
      if (active) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load your applications.')
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [pathname, router])

  const visibleApplications = useMemo(() => applications.filter((item) => filter === 'all' || item.status === filter), [applications, filter])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const user = await getCurrentSessionUser()
      if (!user) throw new Error('Your session expired. Sign in again to save this application.')
      const payload = {
        company: company.trim(),
        role: role.trim(),
        status,
        applied_on: appliedOn || null,
        deadline: deadline || null,
        resume_id: resumeId || null,
        notes: notes.trim(),
      }
      const result = editingId
        ? await supabase.from('applications').update(payload).eq('id', editingId).eq('user_id', user.id).select('*').single()
        : await supabase.from('applications').insert({ ...payload, user_id: user.id }).select('*').single()
      if (result.error) throw result.error
      const savedApplication = result.data as Application
      setApplications((current) => editingId
        ? current.map((item) => item.id === editingId ? savedApplication : item)
        : [savedApplication, ...current])
      setCompany('')
      setRole('')
      setStatus('saved')
      setAppliedOn('')
      setDeadline('')
      setResumeId('')
      setNotes('')
      setShowForm(false)
      setEditingId(null)
      setMessage(editingId ? 'Application details updated.' : 'Application added to your tracker.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save this application.')
    } finally {
      setSaving(false)
    }
  }

  const startEditing = (item: Application) => {
    setEditingId(item.id)
    setCompany(item.company)
    setRole(item.role)
    setStatus(item.status)
    setAppliedOn(item.applied_on || '')
    setDeadline(item.deadline || '')
    setResumeId(item.resume_id || '')
    setNotes(item.notes || '')
    setShowForm(true)
    setError('')
    setMessage('')
  }

  const handleStatusChange = async (item: Application, nextStatus: ApplicationStatus) => {
    const { error: updateError } = await supabase.from('applications').update({ status: nextStatus }).eq('id', item.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setApplications((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus, updated_at: new Date().toISOString() } : entry))
    setError('')
    setMessage('Application status updated.')
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    const { error: deleteError } = await supabase.from('applications').delete().eq('id', pendingDelete)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setApplications((current) => current.filter((item) => item.id !== pendingDelete))
    setPendingDelete(null)
    setMessage('Application removed.')
  }

  if (loading) return <div className="min-h-screen bg-white dark:bg-black"><Navbar /><main role="status" className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Loading your applications…</main></div>

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Keep momentum between applications</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-premium-gold">Application tracker</h1>
            <p className="mt-2 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Track roles, deadlines, progress, and the resume you sent.</p>
          </div>
          <button onClick={() => { setEditingId(null); setShowForm((visible) => !visible) }} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-black px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black sm:self-auto"><Plus className="h-4 w-4" />Add application</button>
        </div>

        {message && <p role="status" className="mb-5 rounded-2xl border border-black/[0.08] bg-[#f5f5f7] px-4 py-3 text-sm text-[#1d1d1f] dark:border-white/[0.1] dark:bg-[#121212] dark:text-[#f5f5f7]">{message}</p>}
        {error && <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{error}</p>}

        {showForm && <form onSubmit={handleCreate} className="mb-8 grid gap-4 rounded-3xl border border-black/[0.08] bg-[#f5f5f7] p-5 dark:border-white/[0.1] dark:bg-[#121212] sm:grid-cols-2 sm:p-7">
          <h2 className="text-lg font-semibold tracking-tight sm:col-span-2">{editingId ? 'Edit application' : 'Add an application'}</h2>
          <div><label htmlFor="application-company" className="mb-2 block text-sm font-medium">Company</label><input id="application-company" required maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white" /></div>
          <div><label htmlFor="application-role" className="mb-2 block text-sm font-medium">Role</label><input id="application-role" required maxLength={160} value={role} onChange={(event) => setRole(event.target.value)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white" /></div>
          <div><label htmlFor="application-status" className="mb-2 block text-sm font-medium">Status</label><select id="application-status" value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white">{statusOptions.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}</select></div>
          <div><label htmlFor="application-resume" className="mb-2 block text-sm font-medium">Resume sent <span className="font-normal text-[#86868b]">(optional)</span></label><select id="application-resume" value={resumeId} onChange={(event) => setResumeId(event.target.value)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white"><option value="">No resume selected</option>{resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.version_name}</option>)}</select></div>
          <div><label htmlFor="application-applied-on" className="mb-2 block text-sm font-medium">Applied on <span className="font-normal text-[#86868b]">(optional)</span></label><input id="application-applied-on" type="date" value={appliedOn} onChange={(event) => setAppliedOn(event.target.value)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white" /></div>
          <div><label htmlFor="application-deadline" className="mb-2 block text-sm font-medium">Follow-up date <span className="font-normal text-[#86868b]">(optional)</span></label><input id="application-deadline" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="min-h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black dark:text-white" /></div>
          <div className="sm:col-span-2"><label htmlFor="application-notes" className="mb-2 block text-sm font-medium">Notes <span className="font-normal text-[#86868b]">(optional)</span></label><textarea id="application-notes" rows={3} maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Recruiter contact, interview notes, or next steps" className="w-full resize-y rounded-xl border border-black/10 bg-white px-3 py-3 text-sm dark:border-white/15 dark:bg-black dark:text-white" /></div>
          <div className="flex gap-2 sm:col-span-2 sm:justify-end"><button type="button" onClick={() => { setShowForm(false); setEditingId(null) }} className="min-h-10 rounded-full border border-black/15 px-4 text-sm font-medium dark:border-white/20">Cancel</button><button disabled={saving} type="submit" className="min-h-10 rounded-full bg-black px-5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Save application'}</button></div>
        </form>}

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter applications by status">
          {(['all', ...statusOptions] as const).map((option) => <button key={option} onClick={() => setFilter(option)} aria-pressed={filter === option} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${filter === option ? 'bg-black text-white dark:bg-white dark:text-black' : 'border border-black/10 text-[#6e6e73] dark:border-white/15 dark:text-[#a1a1a6]'}`}>{option === 'all' ? `All (${applications.length})` : statusLabels[option]}</button>)}
        </div>

        {visibleApplications.length === 0 ? <section className="rounded-3xl border border-black/[0.07] bg-[#f5f5f7] px-6 py-14 text-center dark:border-white/[0.1] dark:bg-[#121212]">
          <Briefcase className="mx-auto h-10 w-10 text-[#86868b]" />
          <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{filter === 'all' ? 'Your tracker is ready' : `No ${statusLabels[filter]} applications`}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">{filter === 'all' ? 'Add a role when you apply or save one. You can connect it to a resume and keep notes for your next step.' : 'Choose another status or update an application to see it here.'}</p>
          {filter === 'all' && <button onClick={() => setShowForm(true)} className="mt-6 min-h-11 rounded-full bg-black px-5 text-sm font-medium text-white dark:bg-white dark:text-black">Track your first role</button>}
        </section> : <div className="grid gap-4 md:grid-cols-2">
          {visibleApplications.map((item) => <article key={item.id} className="rounded-3xl border border-black/[0.07] bg-[#f5f5f7] p-5 dark:border-white/[0.1] dark:bg-[#121212] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">{item.role}</h2><p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{item.company}</p></div>
              <div className="flex gap-2">
                <button onClick={() => startEditing(item)} aria-label={`Edit ${item.role} at ${item.company}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 text-[#6e6e73] dark:border-white/15 dark:text-[#a1a1a6]"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setPendingDelete(item.id)} aria-label={`Delete ${item.role} at ${item.company}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/10 text-[#6e6e73] dark:border-white/15 dark:text-[#a1a1a6]"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6e6e73] dark:text-[#a1a1a6]">
              {item.applied_on && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Applied {new Date(`${item.applied_on}T00:00:00`).toLocaleDateString()}</span>}
              {item.deadline && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Follow up {new Date(`${item.deadline}T00:00:00`).toLocaleDateString()}</span>}
            </div>
            {item.notes && <p className="mt-4 whitespace-pre-wrap border-t border-black/[0.07] pt-4 text-sm leading-6 text-[#6e6e73] dark:border-white/[0.08] dark:text-[#a1a1a6]">{item.notes}</p>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-4 dark:border-white/[0.08]">
              <label className="sr-only" htmlFor={`application-status-${item.id}`}>Status for {item.role} at {item.company}</label>
              <select id={`application-status-${item.id}`} value={item.status} onChange={(event) => handleStatusChange(item, event.target.value as ApplicationStatus)} className="min-h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-medium dark:border-white/15 dark:bg-black dark:text-white">{statusOptions.map((option) => <option key={option} value={option}>{statusLabels[option]}</option>)}</select>
              <span className="text-xs text-[#86868b]">Updated {new Date(item.updated_at).toLocaleDateString()}</span>
            </div>
          </article>)}
        </div>}
      </main>
      {pendingDelete && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/45 p-5"><section role="alertdialog" aria-modal="true" aria-labelledby="delete-application-title" className="w-full max-w-sm rounded-3xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.1] dark:bg-[#161617]"><h2 id="delete-application-title" className="text-lg font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Remove this application?</h2><p className="mt-2 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">This removes it from your tracker.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setPendingDelete(null)} className="min-h-10 rounded-full border border-black/15 px-4 text-sm dark:border-white/20">Cancel</button><button onClick={handleDelete} className="min-h-10 rounded-full bg-black px-4 text-sm font-medium text-white dark:bg-white dark:text-black">Remove</button></div></section></div>}
    </div>
  )
}
