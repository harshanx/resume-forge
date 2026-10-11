'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'

type Experience = {
  job_title: string
  company: string
  date: string
  start_date?: string
  end_date?: string
  current_role?: boolean
  bullets: string[]
}

interface ExperienceFormProps {
  data: Experience[]
  onChange: (data: Experience[]) => void
  onValidityChange?: (isValid: boolean) => void
}

const emptyExperience = () => ({ job_title: '', company: '', date: '', start_date: '', end_date: '', current_role: false, bullets: [''] })

function parseLegacyDate(value: string, part: 'start' | 'end') {
  const isoDates = value.match(/\d{4}-\d{2}-\d{2}/g)
  if (isoDates?.length) return part === 'start' ? isoDates[0] : isoDates[1] || ''
  const matches = Array.from(value.matchAll(/([A-Za-z]{3,9})\s+(\d{4})/g))
  const match = part === 'start' ? matches[0] : matches[1]
  if (!match) return ''
  const monthIndex = new Date(`${match[1]} 1, ${match[2]}`).getMonth()
  return `${match[2]}-${String(monthIndex + 1).padStart(2, '0')}-01`
}

function displayMonth(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function dateRange(start: string, end: string, current: boolean) {
  const startLabel = displayMonth(start)
  const endLabel = current ? 'Present' : displayMonth(end)
  return [startLabel, endLabel].filter(Boolean).join(' – ')
}

function validEntry(experience: Experience) {
  const hasLegacyDate = Boolean(experience.date?.trim())
  const datesValid = hasLegacyDate && !experience.start_date && !experience.end_date
    ? true
    : Boolean(experience.start_date && (experience.current_role || experience.end_date)) &&
      (experience.current_role || !experience.start_date || !experience.end_date || experience.end_date >= experience.start_date)
  return Boolean(experience.job_title.trim() && experience.company.trim()) && datesValid
}

export default function ExperienceForm({ data, onChange, onValidityChange }: ExperienceFormProps) {
  const [draft, setDraft] = useState(emptyExperience)
  const draftTouched = Boolean(draft.job_title || draft.company || draft.start_date || draft.end_date || draft.bullets.some(Boolean))
  const draftValid = !draftTouched || Boolean(draft.job_title.trim() && draft.company.trim() && draft.start_date &&
    (draft.current_role || draft.end_date) && (draft.current_role || !draft.end_date || draft.end_date >= draft.start_date))
  const isValid = data.every(validEntry) && draftValid

  useEffect(() => { onValidityChange?.(isValid) }, [isValid, onValidityChange])

  const updateDraft = (field: keyof ReturnType<typeof emptyExperience>, value: string | boolean | string[]) => {
    setDraft((current) => {
      const updated = { ...current, [field]: value }
      if (field === 'current_role' && value === true) updated.end_date = ''
      updated.date = dateRange(updated.start_date, updated.end_date, updated.current_role)
      return updated
    })
  }

  const updateExisting = (index: number, field: keyof Experience, value: string | boolean | string[]) => {
    const updated = data.map((experience, rowIndex) => {
      if (rowIndex !== index) return experience
      const row = { ...experience, [field]: value }
      if (field === 'current_role' && value === true) row.end_date = ''
      if (field === 'start_date' || field === 'end_date' || field === 'current_role') {
        const start = field === 'start_date' ? String(value) : row.start_date || parseLegacyDate(row.date, 'start')
        const end = field === 'end_date' ? String(value) : row.end_date || parseLegacyDate(row.date, 'end')
        row.start_date = start
        row.end_date = row.current_role ? '' : end
        row.date = dateRange(start, row.end_date, Boolean(row.current_role))
      }
      return row
    })
    onChange(updated)
  }

  const handleAdd = () => {
    if (!draftValid || !draft.job_title.trim() || !draft.company.trim() || !draft.start_date || (!draft.current_role && !draft.end_date)) return
    onChange([...data, { ...draft, bullets: draft.bullets.filter((bullet) => bullet.trim()) }])
    setDraft(emptyExperience())
  }

  const updateBullet = (index: number, bulletIndex: number, value: string) => {
    onChange(data.map((experience, rowIndex) => rowIndex === index ? {
      ...experience,
      bullets: experience.bullets.map((bullet, itemIndex) => itemIndex === bulletIndex ? value : bullet),
    } : experience))
  }
  const fieldClass = 'w-full min-h-10 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500'

  const dateFields = (start: string, end: string, current: boolean, onStartChange: (value: string) => void, onEndChange: (value: string) => void, onCurrentChange: (value: boolean) => void) => (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">Start date *
          <input type="date" value={start} onChange={(event) => onStartChange(event.target.value)} className={`${fieldClass} mt-1 font-normal`} />
        </label>
        <label className="block text-sm font-medium text-gray-700">End date{current ? '' : ' *'}
          <input type="date" value={end} disabled={current} onChange={(event) => onEndChange(event.target.value)} className={`${fieldClass} mt-1 font-normal disabled:opacity-50`} />
        </label>
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={current} onChange={(event) => onCurrentChange(event.target.checked)} className="rounded border-gray-300 text-primary-600" />
        I currently work here
      </label>
    </div>
  )

  return (
    <div className="space-y-6">
      {data.map((experience, index) => {
        const start = experience.start_date || parseLegacyDate(experience.date, 'start')
        const end = experience.end_date || parseLegacyDate(experience.date, 'end')
        return (
          <section key={index} className="relative space-y-3 rounded-2xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
            <button type="button" onClick={() => onChange(data.filter((_, rowIndex) => rowIndex !== index))} aria-label="Remove experience" className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"><X className="h-4 w-4" /></button>
            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">Job title *<input value={experience.job_title} onChange={(event) => updateExisting(index, 'job_title', event.target.value)} className={`${fieldClass} mt-1 font-normal`} /></label>
              <label className="block text-sm font-medium text-gray-700">Company *<input value={experience.company} onChange={(event) => updateExisting(index, 'company', event.target.value)} className={`${fieldClass} mt-1 font-normal`} /></label>
            </div>
            {dateFields(start, end, Boolean(experience.current_role), (value) => updateExisting(index, 'start_date', value), (value) => updateExisting(index, 'end_date', value), (value) => updateExisting(index, 'current_role', value))}
            {experience.bullets.map((bullet, bulletIndex) => <div key={bulletIndex} className="flex gap-2">
              <input value={bullet} onChange={(event) => updateBullet(index, bulletIndex, event.target.value)} placeholder="Achievement or impact" className={`${fieldClass} min-w-0`} />
              {experience.bullets.length > 1 && <button type="button" onClick={() => onChange(data.map((row, rowIndex) => rowIndex === index ? { ...row, bullets: row.bullets.filter((_, itemIndex) => itemIndex !== bulletIndex) } : row))} aria-label="Remove achievement" className="shrink-0 text-gray-500"><X className="h-4 w-4" /></button>}
            </div>)}
            {experience.bullets.length < 5 && <button type="button" onClick={() => onChange(data.map((row, rowIndex) => rowIndex === index ? { ...row, bullets: [...row.bullets, ''] } : row))} className="text-sm font-medium text-primary-600">+ Add achievement</button>}
            {!validEntry(experience) && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Add a job title, company, valid start date, and end date (or mark this as your current role).</p>}
          </section>
        )
      })}

      <section className="space-y-4 rounded-2xl border border-dashed border-black/20 p-4 dark:border-white/20">
        <div><h3 className="font-medium text-gray-900">Add experience</h3><p className="mt-1 text-xs text-gray-500">Choose dates from the calendar. You can mark a role as current.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={draft.job_title} onChange={(event) => updateDraft('job_title', event.target.value)} placeholder="Job title *" className={fieldClass} />
          <input value={draft.company} onChange={(event) => updateDraft('company', event.target.value)} placeholder="Company *" className={fieldClass} />
        </div>
        {dateFields(draft.start_date, draft.end_date, draft.current_role, (value) => updateDraft('start_date', value), (value) => updateDraft('end_date', value), (value) => updateDraft('current_role', value))}
        <input value={draft.bullets[0]} onChange={(event) => updateDraft('bullets', [event.target.value])} placeholder="Achievement or impact (optional)" className={fieldClass} />
        {draftTouched && !draftValid && <p role="alert" className="text-sm text-red-700 dark:text-red-300">Enter the role, company, a start date, and an end date, or mark it as current.</p>}
        <button type="button" disabled={!draftValid || !draft.job_title.trim() || !draft.company.trim() || !draft.start_date || (!draft.current_role && !draft.end_date)} onClick={handleAdd} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"><Plus className="h-4 w-4" />Add experience</button>
      </section>
    </div>
  )
}
