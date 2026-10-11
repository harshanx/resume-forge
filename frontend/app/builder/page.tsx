'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Eye, FileSearch, Loader2, SearchCheck, Sparkles, SpellCheck, Save, Wand2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import PersonalInfoForm from '@/components/forms/PersonalInfoForm'
import EducationForm from '@/components/forms/EducationForm'
import SkillsForm from '@/components/forms/SkillsForm'
import ExperienceForm from '@/components/forms/ExperienceForm'
import ProjectsForm from '@/components/forms/ProjectsForm'
import CertificationsForm from '@/components/forms/CertificationsForm'
import AchievementsForm from '@/components/forms/AchievementsForm'
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
  const [jobDescription, setJobDescription] = useState('')
  const [jobAnalysis, setJobAnalysis] = useState<any>(null)
  const [activeAiTab, setActiveAiTab] = useState<'bullets' | 'grammar' | 'keywords'>('bullets')
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
        setStepValidationError('Enter a valid certificate URL or clear the optional field before continuing.')
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
        body: JSON.stringify(resumeData),
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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      console.log('Downloading from:', `${apiUrl}/api/resume/download`)
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
      console.log('Blob size:', blob.size, 'bytes')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert(`Failed to download resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDownloadFromPreview = () => {
    if (generatedPdf) {
      // Download from the base64 preview
      const link = document.createElement('a')
      link.href = generatedPdf
      link.download = `${resumeData.personal.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleImproveBullets = async (bullets: string[]) => {
    setIsAiProcessing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/improve-bullets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bullets }),
      })
      const result = await response.json()
      setAiResults((prev: any) => ({ ...prev, bullets: result }))
    } catch (error) {
      console.error('Error improving bullets:', error)
      alert('Failed to improve bullets')
    } finally {
      setIsAiProcessing(false)
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

  const openAiTool = (tab: 'bullets' | 'grammar' | 'keywords', target = 'ai-tools-panel') => {
    setActiveAiTab(tab)
    setShowAdvanced(true)
    window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const applyRoleTemplate = (industry: string, role: string) => {
    setAiIndustry(industry)
    setAiRole(role)
    openAiTool('keywords')
  }

  const handleAnalyzeJob = async (jobDescription: string) => {
    setIsAiProcessing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/analyze-job`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ job_description: jobDescription }),
      })
      const result = await response.json()
      setJobAnalysis(result)
    } catch (error) {
      console.error('Error analyzing job:', error)
      alert('Failed to analyze job description')
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleCompareWithJob = async (jobDescription: string) => {
    setIsAiProcessing(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const headers = await getAuthHeaders()
      const response = await fetch(`${apiUrl}/api/resume/compare-job`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ job_description: jobDescription, resume_data: resumeData }),
      })
      const result = await response.json()
      setJobAnalysis((prev: any) => ({ ...prev, comparison: result }))
    } catch (error) {
      console.error('Error comparing with job:', error)
      alert('Failed to compare with job description')
    } finally {
      setIsAiProcessing(false)
    }
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
            data={resumeData.experience}
            onChange={(data) => updateResumeData('experience', data)}
            onValidityChange={setExperienceStepValid}
          />
        )
      case 5:
        return (
          <ProjectsForm
            data={resumeData.projects}
            onChange={(data) => updateResumeData('projects', data)}
            onValidityChange={setProjectsStepValid}
          />
        )
      case 6:
        return (
          <CertificationsForm
            data={resumeData.certifications}
            onChange={(data) => updateResumeData('certifications', data)}
            onValidityChange={setCertificationsStepValid}
          />
        )
      case 7:
        return (
          <AchievementsForm
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
              <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Resume builder</h1>
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
                className="hidden min-h-10 items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium text-[#1d1d1f] transition hover:bg-black/[0.04] disabled:opacity-50 dark:border-white/20 dark:text-[#f5f5f7] dark:hover:bg-white/[0.05] sm:flex"
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

      {/* AI tools are surfaced here so writers can find them before completing the full form. */}
      <section aria-labelledby="builder-ai-shortcuts-title" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-black/[0.08] bg-[#f5f5f7] p-5 dark:border-white/[0.1] dark:bg-[#121212] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#86868b] dark:text-[#a1a1a6]"><Sparkles className="h-3.5 w-3.5" /> Resume toolkit</p>
              <h2 id="builder-ai-shortcuts-title" className="mt-1 text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">A little help, right when you need it.</h2>
              <p className="mt-1 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">Choose a quick check, or start with a role template.</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              { title: 'Improve bullets', detail: 'Make experience more specific', icon: Wand2, action: () => openAiTool('bullets') },
              { title: 'Proofread', detail: 'Find grammar and clarity issues', icon: SpellCheck, action: () => openAiTool('grammar') },
              { title: 'Find role keywords', detail: 'Get relevant skills to include', icon: SearchCheck, action: () => openAiTool('keywords') },
              { title: 'Check ATS readiness', detail: 'Review formatting and content', icon: FileSearch, action: () => openAiTool('bullets', 'ai-ats-check') },
              { title: 'Match a job', detail: 'Compare your resume to a role', icon: CheckCircle2, action: () => openAiTool('bullets', 'ai-job-match') },
            ].map(({ title, detail, icon: Icon, action }) => (
              <button key={title} type="button" onClick={action} className="group flex min-h-[76px] items-start gap-3 rounded-2xl border border-black/[0.07] bg-white p-3 text-left transition hover:border-black/20 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-white/[0.1] dark:bg-[#161617] dark:hover:border-white/25 dark:hover:bg-[#1c1c1e] dark:focus-visible:ring-white">
                <span className="mt-0.5 rounded-xl border border-black/[0.06] bg-[#f5f5f7] p-2 text-[#1d1d1f] dark:border-white/[0.1] dark:bg-[#222224] dark:text-[#f5f5f7]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <span className="min-w-0"><span className="block text-sm font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span><span className="mt-0.5 block text-xs leading-5 text-[#6e6e73] dark:text-[#a1a1a6]">{detail}</span></span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Role templates</span>
            {[
              { label: 'Software engineer', industry: 'software_engineering', role: 'software engineer' },
              { label: 'Data analyst', industry: 'data_analytics', role: 'data analyst' },
              { label: 'Product manager', industry: 'product_management', role: 'product manager' },
              { label: 'Marketing', industry: 'marketing', role: 'marketing specialist' },
            ].map((template) => (
              <button key={template.label} type="button" onClick={() => applyRoleTemplate(template.industry, template.role)} className="min-h-9 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-[#1d1d1f] transition hover:border-black/25 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-white/15 dark:bg-[#161617] dark:text-[#f5f5f7] dark:hover:border-white/30 dark:hover:bg-white/[0.05] dark:focus-visible:ring-white">
                {template.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Panel */}
      {showAdvanced && (
        <div id="ai-tools-panel" className="scroll-mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-3xl border border-black/[0.08] bg-white p-6 dark:border-white/[0.1] dark:bg-[#121212]">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#86868b] dark:text-[#a1a1a6]"><Sparkles className="h-3.5 w-3.5" /> Resume toolkit</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">AI tools & analysis</h2>
              </div>
              <button type="button" onClick={() => setShowAdvanced(false)} className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-[#6e6e73] hover:bg-black/[0.04] dark:border-white/15 dark:text-[#a1a1a6] dark:hover:bg-white/[0.05]">Close tools</button>
            </div>

            {/* AI Tools Tabs */}
            <div className="border-b mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveAiTab('bullets')}
                  className={`px-4 py-2 font-medium transition ${
                    activeAiTab === 'bullets'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Bullet Improvement
                </button>
                <button
                  onClick={() => setActiveAiTab('grammar')}
                  className={`px-4 py-2 font-medium transition ${
                    activeAiTab === 'grammar'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Grammar Check
                </button>
                <button
                  onClick={() => setActiveAiTab('keywords')}
                  className={`px-4 py-2 font-medium transition ${
                    activeAiTab === 'keywords'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Keyword Suggestions
                </button>
              </div>
            </div>

            {/* AI Tools Content */}
            {activeAiTab === 'bullets' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    onChange={(e) => {
                      const section = e.target.value
                      const bullets = section === 'experience'
                        ? resumeData.experience.flatMap((exp) => exp.bullets)
                        : resumeData.projects.flatMap((proj) => proj.bullets)
                      if (bullets.length > 0) {
                        handleImproveBullets(bullets)
                      }
                    }}
                  >
                    <option value="">Select section to improve...</option>
                    <option value="experience">Experience Bullets</option>
                    <option value="projects">Project Bullets</option>
                  </select>
                  {isAiProcessing && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                </div>
                {aiResults?.bullets && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Improved Bullets</h3>
                      <ul className="space-y-2">
                        {aiResults.bullets.improved_bullets?.map((bullet: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">• {bullet}</li>
                        ))}
                      </ul>
                    </div>
                    {aiResults.bullets.suggestions && aiResults.bullets.suggestions.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Suggestions</h3>
                        <ul className="space-y-2">
                          {aiResults.bullets.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Improvement Score</h3>
                      <p className="text-2xl font-bold text-green-600">{aiResults.bullets.improvement_score?.toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeAiTab === 'grammar' && (
              <div className="space-y-4">
                <button
                  onClick={handleCheckGrammar}
                  disabled={isAiProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isAiProcessing ? 'Checking...' : 'Check Grammar'}
                </button>
                {aiResults?.grammar && (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Overall Score</h3>
                      <p className="text-2xl font-bold text-green-600">{aiResults.grammar.overall_score?.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600 mt-2">{aiResults.grammar.summary}</p>
                    </div>
                    {aiResults.grammar.total_errors > 0 && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Errors ({aiResults.grammar.total_errors})</h3>
                        <ul className="space-y-2">
                          {Object.entries(aiResults.grammar.sections || {}).map(([section, data]: [string, any]) => (
                            data.errors?.length > 0 && (
                              <div key={section} className="mb-3">
                                <p className="text-sm font-medium text-gray-800 mb-1 capitalize">{section.replace(/_/g, ' ')}</p>
                                {data.errors.map((error: any, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-700 ml-4">
                                    <span className={`font-medium ${error.type === 'spelling' ? 'text-orange-600' : 'text-red-600'}`}>
                                      {error.type}:
                                    </span> {error.message}
                                  </li>
                                ))}
                              </div>
                            )
                          ))}
                        </ul>
                      </div>
                    )}
                    {aiResults.grammar.total_warnings > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Warnings ({aiResults.grammar.total_warnings})</h3>
                        <ul className="space-y-2">
                          {Object.entries(aiResults.grammar.sections || {}).map(([section, data]: [string, any]) => (
                            data.warnings?.length > 0 && (
                              <div key={section} className="mb-3">
                                <p className="text-sm font-medium text-gray-800 mb-1 capitalize">{section.replace(/_/g, ' ')}</p>
                                {data.warnings.map((warning: any, idx: number) => (
                                  <li key={idx} className="text-sm text-gray-700 ml-4">
                                    <span className="font-medium text-yellow-600">{warning.type}:</span> {warning.message}
                                  </li>
                                ))}
                              </div>
                            )
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeAiTab === 'keywords' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    aria-label="Industry"
                    placeholder="Industry (optional)"
                    value={aiIndustry}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:bg-[#161617] dark:text-[#f5f5f7] dark:focus:ring-white/20"
                    onChange={(e) => setAiIndustry(e.target.value)}
                  />
                  <input
                    type="text"
                    aria-label="Target role"
                    placeholder="Target role (required)"
                    value={aiRole}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-[#1d1d1f] outline-none focus:ring-2 focus:ring-black/20 dark:border-white/15 dark:bg-[#161617] dark:text-[#f5f5f7] dark:focus:ring-white/20"
                    onChange={(e) => setAiRole(e.target.value)}
                  />
                  <button
                    onClick={() => handleSuggestKeywords(aiIndustry, aiRole)}
                    disabled={isAiProcessing || !aiRole.trim()}
                    className="min-h-11 rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    {isAiProcessing ? 'Suggesting...' : 'Suggest Keywords'}
                  </button>
                </div>
                {aiResults?.keywords && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Suggested Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {aiResults.keywords.suggested_keywords?.map((keyword: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Keyword Coverage</h3>
                      <p className="text-2xl font-bold text-green-600">{aiResults.keywords.keyword_coverage?.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600 mt-2">
                        Missing {aiResults.keywords.missing_count} keywords from {aiResults.keywords.industry || 'general'} industry
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ATS Checker */}
            <div id="ai-ats-check" className="mt-8 scroll-mt-6 border-t border-black/[0.08] pt-6 dark:border-white/[0.1]">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ATS Compatibility Checker</h3>
              <button
                onClick={handleCheckATS}
                disabled={isAiProcessing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {isAiProcessing ? 'Checking...' : 'Check ATS Compatibility'}
              </button>
              {atsResults && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Overall Score</span>
                      <span className={`text-2xl font-bold ${atsResults.overall_score >= 80 ? 'text-green-600' : atsResults.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {atsResults.overall_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${atsResults.overall_score >= 80 ? 'bg-green-600' : atsResults.overall_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${atsResults.overall_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Detailed Checks</h4>
                    {Object.entries(atsResults.checks || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-white rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className={`text-sm font-bold ${value.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {value.passed ? '✓ Pass' : '✗ Fail'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{value.message}</p>
                        {value.issues && value.issues.length > 0 && (
                          <ul className="text-xs text-red-600 space-y-1">
                            {value.issues.map((issue: string, idx: number) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  {atsResults.recommendations && atsResults.recommendations.length > 0 && (
                    <div className="mt-4 bg-blue-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {atsResults.recommendations.map((recommendation: string, idx: number) => (
                          <li key={idx}>• {recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Job Description Analyzer */}
            <div id="ai-job-match" className="mt-8 scroll-mt-6 border-t border-black/[0.08] pt-6 dark:border-white/[0.1]">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description Analyzer</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none"
              />
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleAnalyzeJob(jobDescription)}
                  disabled={isAiProcessing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {isAiProcessing ? 'Analyzing...' : 'Analyze Job'}
                </button>
                <button
                  onClick={() => handleCompareWithJob(jobDescription)}
                  disabled={isAiProcessing}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {isAiProcessing ? 'Comparing...' : 'Compare with Resume'}
                </button>
              </div>
              {jobAnalysis && (
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Job Analysis</h4>
                    {jobAnalysis.required_skills && jobAnalysis.required_skills.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Required Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {jobAnalysis.required_skills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {jobAnalysis.soft_skills && jobAnalysis.soft_skills.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Soft Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {jobAnalysis.soft_skills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {jobAnalysis.experience_level && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Experience Level:</span>
                        <span className="ml-2 text-sm text-gray-600">{jobAnalysis.experience_level}</span>
                      </div>
                    )}
                    {jobAnalysis.key_responsibilities && jobAnalysis.key_responsibilities.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Key Responsibilities:</span>
                        <ul className="mt-1 space-y-1 text-sm text-gray-600">
                          {jobAnalysis.key_responsibilities.map((resp: string, idx: number) => (
                            <li key={idx}>• {resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {jobAnalysis.comparison && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Gap Analysis</h4>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Match Percentage</span>
                          <span className={`text-xl font-bold ${jobAnalysis.comparison.match_percentage >= 70 ? 'text-green-600' : jobAnalysis.comparison.match_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {jobAnalysis.comparison.match_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${jobAnalysis.comparison.match_percentage >= 70 ? 'bg-green-600' : jobAnalysis.comparison.match_percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                            style={{ width: `${jobAnalysis.comparison.match_percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-green-600">Matched Skills ({jobAnalysis.comparison.matched_skills?.length || 0}):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {jobAnalysis.comparison.matched_skills?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-red-600">Missing Skills ({jobAnalysis.comparison.missing_skills?.length || 0}):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {jobAnalysis.comparison.missing_skills?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {jobAnalysis.comparison.recommendations && jobAnalysis.comparison.recommendations.length > 0 && (
                        <div className="mt-3 bg-blue-50 rounded p-3">
                          <span className="text-sm font-medium text-gray-900">Recommendations:</span>
                          <ul className="mt-1 space-y-1 text-sm text-gray-700">
                            {jobAnalysis.comparison.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="min-w-0 bg-white rounded-xl shadow-md p-6 relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {steps[currentStep - 1].title}
            </h2>
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
                  <span>Next</span>
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
                      <span>Generate Resume</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="min-w-0 bg-white rounded-xl shadow-md p-6 relative z-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Preview</h2>
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
                className="h-[800px] w-full rounded-lg border"
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
