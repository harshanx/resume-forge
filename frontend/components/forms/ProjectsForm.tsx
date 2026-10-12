'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { isValidHttpUrl } from '@/lib/validation'
import type { StepFormHandle } from './StepFormHandle'

type Project = { name: string; technologies: string; github_url?: string; bullets: string[] }
interface ProjectsFormProps { data: Project[]; onChange: (data: Project[]) => void; onValidityChange?: (isValid: boolean) => void }
const emptyProject = (): Project => ({ name: '', technologies: '', github_url: '', bullets: [''] })
const fieldClass = 'w-full min-h-10 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary-500'

const ProjectsForm = forwardRef<StepFormHandle, ProjectsFormProps>(function ProjectsForm({ data, onChange, onValidityChange }, ref) {
  const [draft, setDraft] = useState(emptyProject)
  const draftTouched = Boolean(draft.name.trim() || draft.technologies.trim() || draft.github_url?.trim() || draft.bullets.some((bullet) => bullet.trim()))
  const draftValid = !draftTouched || Boolean(draft.name.trim() && draft.technologies.trim()) && isValidHttpUrl(draft.github_url || '')
  const isValid = data.every((project) => Boolean(project.name.trim() && project.technologies.trim()) && isValidHttpUrl(project.github_url || '')) && draftValid
  useEffect(() => { onValidityChange?.(isValid) }, [onValidityChange, isValid])
  const updateProject = (index: number, field: keyof Project, value: string) => {
    onChange(data.map((project, rowIndex) => rowIndex === index ? { ...project, [field]: value } : project))
  }
  const updateBullet = (index: number, bulletIndex: number, value: string) => {
    onChange(data.map((project, rowIndex) => rowIndex === index ? { ...project, bullets: project.bullets.map((bullet, itemIndex) => itemIndex === bulletIndex ? value : bullet) } : project))
  }
  const handleAdd = () => {
    if (!draft.name.trim() || !draft.technologies.trim() || !isValidHttpUrl(draft.github_url || '')) return false
    onChange([...data, { ...draft, bullets: draft.bullets.filter((bullet) => bullet.trim()) }])
    setDraft(emptyProject())
    return true
  }
  useImperativeHandle(ref, () => ({
    commitDraft: () => {
      if (!draftTouched) return true
      return handleAdd()
    },
  }))
  const projectFields = (project: Project, index: number) => (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">Project name *<input value={project.name} onChange={(event) => updateProject(index, 'name', event.target.value)} placeholder="Project name" className={`${fieldClass} mt-1 font-normal`} /></label>
        <label className="block text-sm font-medium text-gray-700">Technologies *<input value={project.technologies} onChange={(event) => updateProject(index, 'technologies', event.target.value)} placeholder="React, TypeScript" className={`${fieldClass} mt-1 font-normal`} /></label>
      </div>
      <label className="block text-sm font-medium text-gray-700">GitHub URL <span className="font-normal text-gray-500">(optional)</span>
        <input type="url" value={project.github_url || ''} onChange={(event) => updateProject(index, 'github_url', event.target.value)} placeholder="https://github.com/username/project" className={`${fieldClass} mt-1 font-normal`} aria-invalid={!isValidHttpUrl(project.github_url || '')} />
        {!isValidHttpUrl(project.github_url || '') && <span role="alert" className="mt-1 block text-xs font-normal text-red-700">Enter a valid http or https URL.</span>}
      </label>
      {project.bullets.map((bullet, bulletIndex) => <div key={bulletIndex} className="flex gap-2">
        <input value={bullet} onChange={(event) => updateBullet(index, bulletIndex, event.target.value)} placeholder="Description or achievement (optional)" className={`${fieldClass} min-w-0`} />
        {project.bullets.length > 1 && <button type="button" onClick={() => onChange(data.map((item, rowIndex) => rowIndex === index ? { ...item, bullets: item.bullets.filter((_, i) => i !== bulletIndex) } : item))} aria-label="Remove project description" className="shrink-0 text-gray-500"><X className="h-4 w-4" /></button>}
      </div>)}
      {project.bullets.length < 5 && <button type="button" onClick={() => onChange(data.map((item, rowIndex) => rowIndex === index ? { ...item, bullets: [...item.bullets, ''] } : item))} className="text-sm font-medium text-primary-600">+ Add description</button>}
    </>
  )

  return <div className="space-y-5">
    {data.map((project, index) => <section key={index} className="relative space-y-3 rounded-2xl border border-black/[0.08] p-4 pr-12 dark:border-white/[0.12]">
      <button type="button" onClick={() => onChange(data.filter((_, rowIndex) => rowIndex !== index))} aria-label="Remove project" className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"><X className="h-4 w-4" /></button>
      {projectFields(project, index)}
    </section>)}
    <section className="space-y-4 rounded-2xl border border-dashed border-black/20 p-4 dark:border-white/20">
      <div><h3 className="font-medium text-gray-900">Add project</h3><p className="mt-1 text-xs text-gray-500">A GitHub link is optional.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">Project name *<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Project name" className={`${fieldClass} mt-1 font-normal`} /></label>
        <label className="block text-sm font-medium text-gray-700">Technologies *<input value={draft.technologies} onChange={(event) => setDraft({ ...draft, technologies: event.target.value })} placeholder="React, TypeScript" className={`${fieldClass} mt-1 font-normal`} /></label>
      </div>
      <label className="block text-sm font-medium text-gray-700">GitHub URL <span className="font-normal text-gray-500">(optional)</span>
        <input type="url" value={draft.github_url || ''} onChange={(event) => setDraft({ ...draft, github_url: event.target.value })} placeholder="https://github.com/username/project" className={`${fieldClass} mt-1 font-normal`} aria-invalid={!isValidHttpUrl(draft.github_url || '')} />
        {!isValidHttpUrl(draft.github_url || '') && <span role="alert" className="mt-1 block text-xs font-normal text-red-700">Enter a valid http or https URL.</span>}
      </label>
      <input value={draft.bullets[0]} onChange={(event) => setDraft({ ...draft, bullets: [event.target.value] })} placeholder="Description or achievement (optional)" className={fieldClass} />
      <button type="button" disabled={!draft.name.trim() || !draft.technologies.trim() || !isValidHttpUrl(draft.github_url || '')} onClick={handleAdd} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black"><Plus className="h-4 w-4" />Add project</button>
    </section>
  </div>
})

export default ProjectsForm
