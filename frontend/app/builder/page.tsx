'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Download, Eye, FileSearch, Loader2, SearchCheck, Sparkles, SpellCheck, Save } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import PersonalInfoForm from '@/components/forms/PersonalInfoForm'
import EducationForm from '@/components/forms/EducationForm'
import SkillsForm from '@/components/forms/SkillsForm'
import ExperienceForm from '@/components/forms/ExperienceForm'
import ProjectsForm from '@/components/forms/ProjectsForm'
import CertificationsForm from '@/components/forms/CertificationsForm'
import AchievementsForm from '@/components/forms/AchievementsForm'
import type { StepFormHandle } from '@/components/forms/StepFormHandle'
import ResumePreview from '@/components/ResumePreview'
import { supabase } from '@/lib/firebase'
import { getCurrentSessionUser } from '@/lib/auth'
import { getAuthHeaders } from '@/lib/api'
import Navbar from '@/components/Navbar'

interface ResumeData {
  personal: {
    name: string
    phone: string
    email: string
    linkedin: string
    github: string
    location: string
  }
  education: Array<{
    degree: string
    institution: string
    university: string
    cgpa: string
    percentage: string
    specialization?: string
    grade_value?: string
    grade_scale?: '10' | '5' | 'percentile'
    graduation_year: number
  }>
  skills: {
    technical: string
    professional: string
  }
  experience: Array<{
    job_title: string
    company: string
    date: string
    start_date?: string
    end_date?: string
    current_role?: boolean
    bullets: string[]
  }>
  projects: Array<{
    name: string
    technologies: string
    github_url?: string
    bullets: string[]
  }>
  certifications: Array<{
    name: string
    organization: string
    date: string
    certificate_id: string
    url?: string
  }>
  achievements: string[]
}

function createEmptyResumeData(): ResumeData {
  return {
    personal: { name: '', phone: '', email: '', linkedin: '', github: '', location: '' },
    education: [],
    skills: { technical: '', professional: '' },
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
  }
}

const steps = [
  { id: 1, title: 'Personal Information' },
  { id: 2, title: 'Education' },
  { id: 3, title: 'Skills' },
  { id: 4, title: 'Experience' },
  { id: 5, title: 'Projects' },
  { id: 6, title: 'Certifications' },
  { id: 7, title: 'Achievements' },
]

export default function BuilderPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const resumeId = searchParams.get('resumeId')

  const educationFormRef = useRef<StepFormHandle>(null)
  const experienceFormRef = useRef<StepFormHandle>(null)
  const projectsFormRef = useRef<StepFormHandle>(null)
  const certificationsFormRef = useRef<StepFormHandle>(null)
  const achievementsFormRef = useRef<StepFormHandle<string[]>>(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [resumeName, setResumeName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [draftReady, setDraftReady] = useState(false)
  const [draftState, setDraftState] = useState<'idle' | 'saving' | 'saved' | 'restored' | 'error'>('idle')
  const [educationStepValid, setEducationStepValid] = useState(true)
  const [experienceStepValid, setExperienceStepValid] = useState(true)
  const [projectsStepValid, setProjectsStepValid] = useState(true)
  const [certificationsStepValid, setCertificationsStepValid] = useState(true)
  const [stepValidationError, setStepValidationError] = useState('')
  const [resumeData, setResumeData] = useState<ResumeData>(createEmptyResumeData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('ats-one-page')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aiResults, setAiResults] = useState<any>(null)
  const [atsResults, setAtsResults] = useState<any>(null)
  const [activeAiTab, setActiveAiTab] = useState<'grammar' | 'keywords' | 'ats'>('grammar')
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiIndustry, setAiIndustry] = useState('')
  const [aiRole, setAiRole] = useState('')

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const user = await getCurrentSessionUser()
      if (!active) return

      if (!user) {
        const query = searchParams.toString()
        router.replace(`/login?next=${encodeURIComponent(pathname + (query ? `?${query}` : ''))}`)
        return
      }

      setUserId(user.id)
      setCheckingSession(false)
    }

    checkSession()
    return () => { active = false }
  }, [pathname, router, searchParams])

  useEffect(() => {
    if (!userId) return
    if (resumeId) {
      setDraftReady(true)
      return
    }

    try {
      const rawDraft = localStorage.getItem(`resumeforge:draft:${userId}`)
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as Partial<{ resumeData: ResumeData; resumeName: string; selectedTemplate: string; currentStep: number }>
        if (draft.resumeData && typeof draft.resumeData === 'object') setResumeData(draft.resumeData)
        if (typeof draft.resumeName === 'string') setResumeName(draft.resumeName)
        if (typeof draft.selectedTemplate === 'string') setSelectedTemplate(draft.selectedTemplate)
        if (typeof draft.currentStep === 'number' && draft.currentStep >= 1 && draft.currentStep <= steps.length) setCurrentStep(draft.currentStep)
        setDraftState('restored')
      }
    } catch (error) {
      console.error('Could not restore the local resume draft:', error)
    } finally {
      setDraftReady(true)
    }
  }, [resumeId, userId])

  useEffect(() => {
    if (!userId || !draftReady || resumeId) return
    setDraftState('saving')
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem(`resumeforge:draft:${userId}`, JSON.stringify({ resumeData, resumeName, selectedTemplate, currentStep, savedAt: new Date().toISOString() }))
        setDraftState('saved')
      } catch (error) {
        console.error('Could not save a local resume draft:', error)
        setDraftState('error')
      }
    }, 700)
    return () => window.clearTimeout(timeout)
  }, [currentStep, draftReady, resumeData, resumeId, resumeName, selectedTemplate, userId])

  // Load existing resume if editing
  useEffect(() => {
    const loadResume = async () => {
      if (resumeId) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          const { data, error } = await supabase
            .from('resume_versions')
            .select('*')
            .eq('id', resumeId)
            .single()

          if (error) throw error
          if (data) {
            setResumeData(data.resume_data)
            setResumeName(data.version_name || '')
          }
        } catch (error) {
          console.error('Error loading resume:', error)
        }
      }
    }

    loadResume()
  }, [resumeId])

  const handleSaveResume = async () => {
    setSaveError(null)
    setSaveMessage('')
    const user = await getCurrentSessionUser()
    if (!user) {
      setSaveError('Please log in before saving your resume.')
      router.push(`/login?next=${encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''))}`)
      return
    }

    const versionName = resumeName.trim()
    if (!versionName) {
      setSaveError('Give this resume a name before saving it.')
      return
    }

    setIsSaving(true)
    try {
      // Keep the profile row available for the resume_versions foreign key.
      // The database trigger normally does this at sign-up; this also covers
      // accounts created before that trigger was installed.
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || '',
        }, { onConflict: 'id' })

      if (profileError && profileError.code !== '42501') {
        throw profileError
      }

      const resumeDataPayload = {
        user_id: user.id,
        version_name: versionName || `${resumeData.personal.name} Resume`,
        resume_data: resumeData,
        template: selectedTemplate,
      }

      let result
      if (resumeId) {
        result = await supabase
          .from('resume_versions')
          .update(resumeDataPayload)
          .eq('id', resumeId)
          .select()
      } else {
        result = await supabase
          .from('resume_versions')
          .insert(resumeDataPayload)
          .select()
      }

      if (result.error) throw result.error

      try {
        localStorage.removeItem(`resumeforge:draft:${user.id}`)
      } catch { /* Local draft cleanup is best effort. */ }
      setDraftState('idle')
      if (!resumeId) {
        router.push('/dashboard?saved=1')
      } else {
        setSaveMessage('Your changes are saved.')
      }
    } catch (error) {
      console.error('Error saving resume:', error)
      const supabaseError = error as { code?: string; message?: string }
      if (supabaseError.code === '23503') {
        setSaveError('Your Supabase profile is missing. Run supabase_save_fix.sql in the Supabase SQL Editor, then try saving again.')
      } else if (supabaseError.code === '42501') {
        setSaveError('Supabase denied this save. Run supabase_save_fix.sql in the Supabase SQL Editor to create the required access policies.')
      } else if (supabaseError.code === '42P01') {
        setSaveError('The resume_versions table does not exist yet. Run supabase_schema.sql in the Supabase SQL Editor.')
      } else {
        setSaveError(supabaseError.message || 'Could not save the resume. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }
  const updateResumeData = (section: string, data: any) => {
    setGeneratedPdf(null)
    setGenerationError(null)
    setResumeData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  const handleNext = () => {
    setStepValidationError('')
    if (currentStep < steps.length) {
      if (currentStep === 2 && !educationStepValid) {
        setStepValidationError('Fix the education fields and grade value before continuing.')
        return
      }
      if (currentStep === 4 && !experienceStepValid) {
        setStepValidationError('Fix the experience dates before continuing.')
        return
      }
      if (currentStep === 5 && !projectsStepValid) {
        setStepValidationError('Enter a valid GitHub URL or clear the optional field before continuing.')
        return
      }
      if (currentStep === 6 && !certificationsStepValid) {
        setStepValidationError('Complete the certification name and enter a valid URL, or clear the unfinished entry before continuing.')
        return
      }
      const draftCommitted = currentStep === 2
        ? educationFormRef.current?.commitDraft()
        : currentStep === 4
          ? experienceFormRef.current?.commitDraft()
          : currentStep === 5
            ? projectsFormRef.current?.commitDraft()
            : currentStep === 6
              ? certificationsFormRef.current?.commitDraft()
              : true
      if (draftCommitted === false) {
        setStepValidationError('Complete the current entry or clear it before continuing.')
        return
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    const savedAchievements = achievementsFormRef.current?.commitDraft() || resumeData.achievements
    const dataToGenerate = { ...resumeData, achievements: savedAchievements }
    setIsGenerating(true)
    setWarnings([])
    setGenerationError(null)
    setGeneratedPdf(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/generate?template=${selectedTemplate}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dataToGenerate),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.detail || `Resume generation failed (${response.status})`)
      }

      const result = await response.json()
      if (!result.pdf_url) throw new Error('The server did not return a PDF. Please try again.')
      setGeneratedPdf(result.pdf_url)
      setWarnings(result.warnings || [])
    } catch (error) {
      console.error('Error generating resume:', error)
      setGenerationError(error instanceof Error ? error.message : 'Could not generate the resume. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    // Mobile browsers commonly block downloads started after an awaited fetch.
    // Open a window during the tap, then load the returned PDF into its viewer.
    const pdfWindow = isMobile ? window.open('about:blank', '_blank') : null

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/download?template=${selectedTemplate}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(resumeData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Download failed:', response.status, errorText)
        throw new Error(`Failed to download resume: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      if (pdfWindow) {
        pdfWindow.opener = null
        pdfWindow.location.href = url
        const cleanupWhenClosed = window.setInterval(() => {
          if (pdfWindow.closed) {
            window.clearInterval(cleanupWhenClosed)
            window.URL.revokeObjectURL(url)
          }
        }, 1000)
        // Avoid an indefinite leak in browsers that don't expose the PDF tab's
        // closed state reliably.
        window.setTimeout(() => {
          window.clearInterval(cleanupWhenClosed)
          window.URL.revokeObjectURL(url)
        }, 10 * 60_000)
        return
      }

      if (isMobile) {
        // If a browser blocks the synchronously opened tab, navigate the current
        // tab to the PDF so the download still reaches the native viewer.
        window.location.href = url
        window.setTimeout(() => window.URL.revokeObjectURL(url), 10 * 60_000)
        return
      }

      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Give mobile browsers time to start reading the blob before releasing it.
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (error) {
      pdfWindow?.close()
      console.error('Error downloading resume:', error)
      alert(`Failed to download resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDownloadFromPreview = () => {
    if (generatedPdf) {
      const isMobile = window.matchMedia('(max-width: 767px)').matches || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      if (isMobile) {
        // Open the PDF directly from the tap so mobile browsers can show their
        // native PDF viewer and its Save/Share controls.
        window.open(generatedPdf, '_blank', 'noopener,noreferrer')
        return
      }

      const link = document.createElement('a')
      link.href = generatedPdf
      link.download = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCheckGrammar = async () => {
    setIsAiProcessing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/check-grammar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resume_data: resumeData }),
      })
      const result = await response.json()
      setAiResults((prev: any) => ({ ...prev, grammar: result }))
    } catch (error) {
      console.error('Error checking grammar:', error)
      alert('Failed to check grammar')
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleSuggestKeywords = async (industry: string, role: string) => {
    setIsAiProcessing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/suggest-keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resume_data: resumeData, industry, role }),
      })
      const result = await response.json()
      setAiResults((prev: any) => ({ ...prev, keywords: result }))
    } catch (error) {
      console.error('Error suggesting keywords:', error)
      alert('Failed to suggest keywords')
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleCheckATS = async () => {
    setIsAiProcessing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/ats-check`, {
        method: 'POST',
        headers,
        body: JSON.stringify(resumeData),
      })
      const result = await response.json()
      setAtsResults(result)
    } catch (error) {
      console.error('Error checking ATS:', error)
      alert('Failed to check ATS compatibility')
    } finally {
      setIsAiProcessing(false)
    }
  }

  const openAiTool = (tab: 'grammar' | 'keywords' | 'ats') => {
    setActiveAiTab(tab)
    setShowAdvanced(true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoForm
            data={resumeData.personal}
            onChange={(data) => updateResumeData('personal', data)}
          />
        )
      case 2:
        return (
          <EducationForm
            ref={educationFormRef}
            data={resumeData.education}
            onChange={(data) => updateResumeData('education', data)}
            onValidityChange={setEducationStepValid}
          />
        )
      case 3:
        return (
          <SkillsForm
            data={resumeData.skills}
            onChange={(data) => updateResumeData('skills', data)}
          />
        )
      case 4:
        return (
          <ExperienceForm
            ref={experienceFormRef}
            data={resumeData.experience}
            onChange={(data) => updateResumeData('experience', data)}
            onValidityChange={setExperienceStepValid}
          />
        )
      case 5:
        return (
          <ProjectsForm
            ref={projectsFormRef}
            data={resumeData.projects}
            onChange={(data) => updateResumeData('projects', data)}
            onValidityChange={setProjectsStepValid}
          />
        )
      case 6:
        return (
          <CertificationsForm
            ref={certificationsFormRef}
            data={resumeData.certifications}
            onChange={(data) => updateResumeData('certifications', data)}
            onValidityChange={setCertificationsStepValid}
          />
        )
      case 7:
        return (
          <AchievementsForm
            ref={achievementsFormRef}
            data={resumeData.achievements}
            onChange={(data) => updateResumeData('achievements', data)}
          />
        )
      default:
        return null
    }
  }

  if (checkingSession) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white text-sm text-[#6e6e73] dark:bg-black dark:text-[#a1a1a6]" role="status">
        Checking your session…
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      {/* Header */}
      <header className="border-b border-black/[0.06] bg-white/75 backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="shrink-0">
              <h1 className="text-2xl font-semibold tracking-tight text-premium-gold">Resume builder</h1>
              <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Build, preview, and save your next application.</p>
              <p role="status" className="mt-1 text-xs text-[#86868b] dark:text-[#6e6e73]">
                {draftState === 'saving' ? 'Saving draft on this device…' : draftState === 'saved' ? 'Draft saved on this device' : draftState === 'restored' ? 'Your draft was restored' : draftState === 'error' ? 'Local draft could not be saved' : saveMessage}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={resumeName}
                onChange={(e) => { setResumeName(e.target.value); setSaveError(null); setSaveMessage('') }}
                placeholder="Name this resume"
                aria-label="Resume name"
                className="min-h-10 w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 sm:w-48"
              />
              <button
                onClick={handleSaveResume}
                disabled={isSaving}
                className="flex min-h-10 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </>
                )}
              </button>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value)
                  setGeneratedPdf(null)
                  setGenerationError(null)
                }}
                aria-label="Resume template"
                className="min-h-10 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="ats-one-page">ATS One-Page</option>
                <option value="modern-clean">Modern Clean</option>
              </select>

              <button
                onClick={generatedPdf ? handleDownloadFromPreview : handleDownload}
                disabled={isGenerating}
                className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/20 dark:text-[#f5f5f7] dark:hover:bg-white/[0.05] sm:flex-none"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex min-h-10 items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-black/[0.04] dark:border-white/20 dark:text-[#f5f5f7] dark:hover:bg-white/[0.05]"
              >
                <span>AI Tools</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {saveError && (
        <div role="alert" className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Could not save the resume</p>
            <p className="mt-1">{saveError}</p>
          </div>
        </div>
      )}

      {saveMessage && !resumeId && <p role="status" className="mx-auto mt-4 max-w-7xl px-4 text-sm text-[#1d1d1f] dark:text-[#f5f5f7]">{saveMessage}</p>}

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-start gap-3 overflow-x-auto lg:justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.id
                        ? 'bg-primary-600 text-white'
                        : currentStep > step.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Focused AI toolkit */}
      <section aria-labelledby="builder-ai-title" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-black/[0.08] bg-[#f5f5f7] p-5 dark:border-white/[0.1] dark:bg-[#121212] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#86868b] dark:text-[#a1a1a6]"><Sparkles className="h-3.5 w-3.5" /> Resume toolkit</p>
              <h2 id="builder-ai-title" className="mt-1 text-lg font-semibold tracking-tight text-premium-gold">Choose a quick review</h2>
              <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Three focused tools to polish your resume.</p>
            </div>
          </div>
          <div role="tablist" aria-label="Resume review tools" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button id="ai-tool-tab-grammar" role="tab" aria-selected={activeAiTab === 'grammar' && showAdvanced} aria-controls="ai-tool-content" type="button" onClick={() => openAiTool('grammar')} className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${activeAiTab === 'grammar' && showAdvanced ? 'border-[#8a681f] bg-[#fbf8ef] dark:border-[#e0c477] dark:bg-[#211c11]' : 'border-black/[0.07] bg-white hover:border-black/20 dark:border-white/[0.1] dark:bg-[#161617] dark:hover:border-white/25'}`}>
              <span className="rounded-xl border border-black/[0.06] bg-[#f5f5f7] p-2 text-premium-gold dark:border-white/[0.1] dark:bg-[#222224]"><SpellCheck className="h-4 w-4" aria-hidden="true" /></span><span><span className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Grammar check</span><span className="mt-0.5 block text-xs text-[#6e6e73] dark:text-[#a1a1a6]">Find writing mistakes</span></span>
            </button>
            <button id="ai-tool-tab-keywords" role="tab" aria-selected={activeAiTab === 'keywords' && showAdvanced} aria-controls="ai-tool-content" type="button" onClick={() => openAiTool('keywords')} className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${activeAiTab === 'keywords' && showAdvanced ? 'border-[#8a681f] bg-[#fbf8ef] dark:border-[#e0c477] dark:bg-[#211c11]' : 'border-black/[0.07] bg-white hover:border-black/20 dark:border-white/[0.1] dark:bg-[#161617] dark:hover:border-white/25'}`}>
              <span className="rounded-xl border border-black/[0.06] bg-[#f5f5f7] p-2 text-premium-gold dark:border-white/[0.1] dark:bg-[#222224]"><SearchCheck className="h-4 w-4" aria-hidden="true" /></span><span><span className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">Keyword suggestions</span><span className="mt-0.5 block text-xs text-[#6e6e73] dark:text-[#a1a1a6]">Find skills for your target role</span></span>
            </button>
            <button id="ai-tool-tab-ats" role="tab" aria-selected={activeAiTab === 'ats' && showAdvanced} aria-controls="ai-tool-content" type="button" onClick={() => openAiTool('ats')} className={`flex min-h-[76px] items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${activeAiTab === 'ats' && showAdvanced ? 'border-[#8a681f] bg-[#fbf8ef] dark:border-[#e0c477] dark:bg-[#211c11]' : 'border-black/[0.07] bg-white hover:border-black/20 dark:border-white/[0.1] dark:bg-[#161617] dark:hover:border-white/25'}`}>
              <span className="rounded-xl border border-black/[0.06] bg-[#f5f5f7] p-2 text-premium-gold dark:border-white/[0.1] dark:bg-[#222224]"><FileSearch className="h-4 w-4" aria-hidden="true" /></span><span><span className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">ATS compatibility</span><span className="mt-0.5 block text-xs text-[#6e6e73] dark:text-[#a1a1a6]">Check structure and readability</span></span>
            </button>
          </div>
        </div>
      </section>

      {showAdvanced && (
        <section id="ai-tools-panel" aria-label="Selected resume review tool" className="mx-auto max-w-7xl scroll-mt-6 px-4 pt-4 sm:px-6 lg:px-8">
          <div id="ai-tool-content" role="tabpanel" aria-labelledby={`ai-tool-tab-${activeAiTab}`} className="rounded-3xl border border-black/[0.08] bg-white p-5 dark:border-white/[0.1] dark:bg-[#121212] sm:p-6">
            {activeAiTab === 'grammar' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-premium-gold">Grammar check</h3><p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Review spelling, grammar, and clarity across your resume.</p></div><button type="button" onClick={handleCheckGrammar} disabled={isAiProcessing} className="min-h-10 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">{isAiProcessing ? 'Checking…' : 'Check for mistakes'}</button></div>
                {isAiProcessing && <p role="status" className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Reviewing your resume…</p>}
                {aiResults?.grammar && <div className="space-y-4">
                  <div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-4 dark:border-white/[0.08] dark:bg-[#161617]"><h4 className="font-semibold text-premium-gold">Overall score: {aiResults.grammar.overall_score?.toFixed(1)}%</h4><p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{aiResults.grammar.summary}</p></div>
                  {aiResults.grammar.total_errors > 0 && <div className="rounded-2xl border border-black/[0.06] p-4 dark:border-white/[0.08]"><h4 className="font-semibold text-premium-gold">Mistakes ({aiResults.grammar.total_errors})</h4><div className="mt-3 space-y-3">{Object.entries(aiResults.grammar.sections || {}).map(([section, data]: [string, any]) => data.errors?.length > 0 && <div key={section}><p className="text-sm font-medium capitalize text-[#1d1d1f] dark:text-[#f5f5f7]">{section.replace(/_/g, ' ')}</p><ul className="mt-1 space-y-1">{data.errors.map((error: any, idx: number) => <li key={idx} className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{error.type}: {error.message}</li>)}</ul></div>)}</div></div>}
                  {aiResults.grammar.total_warnings > 0 && <div className="rounded-2xl border border-black/[0.06] p-4 dark:border-white/[0.08]"><h4 className="font-semibold text-premium-gold">Suggestions ({aiResults.grammar.total_warnings})</h4><div className="mt-3 space-y-3">{Object.entries(aiResults.grammar.sections || {}).map(([section, data]: [string, any]) => data.warnings?.length > 0 && <div key={section}><p className="text-sm font-medium capitalize text-[#1d1d1f] dark:text-[#f5f5f7]">{section.replace(/_/g, ' ')}</p><ul className="mt-1 space-y-1">{data.warnings.map((warning: any, idx: number) => <li key={idx} className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{warning.type}: {warning.message}</li>)}</ul></div>)}</div></div>}
                </div>}
              </div>
            )}

            {activeAiTab === 'keywords' && (
              <div className="space-y-4">
                <div><h3 className="text-lg font-semibold text-premium-gold">Keyword suggestions</h3><p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Choose the role you’re targeting to find relevant skills.</p></div>
                <div className="flex flex-col gap-3 sm:flex-row"><input type="text" aria-label="Industry" placeholder="Industry (optional)" value={aiIndustry} onChange={(e) => setAiIndustry(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#1d1d1f] dark:border-white/15 dark:bg-[#161617] dark:text-[#f5f5f7]" /><input type="text" aria-label="Target role" placeholder="Target role (required)" value={aiRole} onChange={(e) => setAiRole(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#1d1d1f] dark:border-white/15 dark:bg-[#161617] dark:text-[#f5f5f7]" /><button type="button" onClick={() => handleSuggestKeywords(aiIndustry, aiRole)} disabled={isAiProcessing || !aiRole.trim()} className="min-h-11 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">{isAiProcessing ? 'Suggesting…' : 'Suggest keywords'}</button></div>
                {aiResults?.keywords && <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-4 dark:border-white/[0.08] dark:bg-[#161617]"><h4 className="font-semibold text-premium-gold">Suggested keywords</h4><div className="mt-3 flex flex-wrap gap-2">{aiResults.keywords.suggested_keywords?.map((keyword: string, idx: number) => <span key={idx} className="rounded-full border border-black/[0.08] px-3 py-1 text-sm text-[#1d1d1f] dark:border-white/[0.12] dark:text-[#f5f5f7]">{keyword}</span>)}</div></div><div className="rounded-2xl border border-black/[0.06] p-4 dark:border-white/[0.08]"><h4 className="font-semibold text-premium-gold">Keyword coverage: {aiResults.keywords.keyword_coverage?.toFixed(1)}%</h4><p className="mt-2 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{aiResults.keywords.missing_count} keywords missing for {aiResults.keywords.industry || aiRole}.</p></div></div>}
              </div>
            )}

            {activeAiTab === 'ats' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-premium-gold">ATS compatibility</h3><p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Check structure, contact details, and resume readability.</p></div><button type="button" onClick={handleCheckATS} disabled={isAiProcessing} className="min-h-10 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200">{isAiProcessing ? 'Checking…' : 'Check ATS compatibility'}</button></div>
                {isAiProcessing && <p role="status" className="text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Checking your resume…</p>}
                {atsResults && <div className="space-y-4"><div className="rounded-2xl border border-black/[0.06] bg-[#f5f5f7] p-4 dark:border-white/[0.08] dark:bg-[#161617]"><div className="flex items-center justify-between gap-3"><h4 className="font-semibold text-premium-gold">Overall score</h4><span className="text-xl font-semibold text-premium-gold">{atsResults.overall_score.toFixed(1)}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full bg-[#8a681f] dark:bg-[#e0c477]" style={{ width: `${Math.max(0, Math.min(100, atsResults.overall_score))}%` }} /></div></div><div className="grid gap-3 sm:grid-cols-2">{Object.entries(atsResults.checks || {}).map(([key, value]: [string, any]) => <div key={key} className="rounded-2xl border border-black/[0.06] p-4 dark:border-white/[0.08]"><div className="flex items-center justify-between gap-2"><h4 className="text-sm font-medium capitalize text-[#1d1d1f] dark:text-[#f5f5f7]">{key.replace(/_/g, ' ')}</h4><span className="text-xs font-medium text-premium-gold">{value.passed ? 'Pass' : 'Needs work'}</span></div><p className="mt-2 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{value.message}</p>{value.issues?.length > 0 && <ul className="mt-2 space-y-1 text-xs text-[#6e6e73] dark:text-[#a1a1a6]">{value.issues.map((issue: string, idx: number) => <li key={idx}>• {issue}</li>)}</ul>}</div>)}</div>{atsResults.recommendations?.length > 0 && <div className="rounded-2xl border border-black/[0.06] p-4 dark:border-white/[0.08]"><h4 className="font-semibold text-premium-gold">Recommended next steps</h4><ul className="mt-2 space-y-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">{atsResults.recommendations.map((recommendation: string, idx: number) => <li key={idx}>• {recommendation}</li>)}</ul></div>}</div>}
              </div>
            )}
          </div>
        </section>
      )}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="relative z-10 min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {steps[currentStep - 1].title}
            </h2>
            <p className="-mt-3 mb-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Your entries are kept in the resume draft as you move through the steps. Use Add only when you have another entry.
            </p>
            {renderStep()}

            {stepValidationError && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{stepValidationError}</p>}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              {currentStep < steps.length ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  <span>Save &amp; Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>Finish &amp; Generate PDF</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="relative z-0 min-w-0 rounded-xl bg-white p-4 shadow-md sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
              {generatedPdf && (
                <button
                  type="button"
                  onClick={handleDownloadFromPreview}
                  className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
            {isGenerating ? (
              <div role="status" className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-800">
                <Loader2 className="mb-3 h-8 w-8 animate-spin" />
                <p className="font-medium">Generating your PDF preview…</p>
                <p className="mt-1 text-sm text-blue-700">This can take a few moments.</p>
              </div>
            ) : generatedPdf ? (
              <iframe
                title="Generated resume PDF preview"
                src={generatedPdf}
                className="h-[min(800px,75vh)] min-h-[420px] w-full rounded-lg border"
              />
            ) : (
              <ResumePreview data={resumeData} />
            )}

            {generationError && (
              <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">Resume generation failed</p>
                <p className="mt-1">{generationError}</p>
                <button type="button" onClick={handleGenerate} className="mt-3 font-medium underline">
                  Try again
                </button>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Warnings</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}
