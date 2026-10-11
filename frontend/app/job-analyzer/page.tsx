'use client'

import { useState, useEffect } from 'react'
import { Briefcase, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/firebase'
import { getCurrentSessionUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'

interface JobAnalysis {
  required_skills: string[]
  soft_skills: string[]
  education_requirements: string[]
  experience_level: string
  key_responsibilities: string[]
  matching_keywords: string[]
  summary: string
}

interface ComparisonResult {
  job_summary: string
  required_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  match_percentage: number
  recommendations: string[]
  experience_level: string
}

interface StoredResume {
  id: string
  version_name: string
  resume_data: any
}

export default function JobAnalyzerPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [jobDescription, setJobDescription] = useState('')
  const [storedResumes, setStoredResumes] = useState<StoredResume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)

  // Load the current user's saved resumes from Supabase.
  useEffect(() => {
    let cancelled = false
    const loadResumes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('resume_versions')
        .select('id, version_name, resume_data, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error loading resumes:', error)
        return
      }
      if (cancelled) return
      const resumes = (data || []) as StoredResume[]
      setStoredResumes(resumes)
      setSelectedResumeId((current) => current || resumes[0]?.id || null)
    }
    loadResumes()
    return () => { cancelled = true }
  }, [])
  const [comparison, setComparison] = useState<ComparisonResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isComparing, setIsComparing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [activeTab, setActiveTab] = useState<'analyze' | 'compare'>('analyze')
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    let active = true

    const checkSession = async () => {
      const user = await getCurrentSessionUser()
      if (!active) return

      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`)
        return
      }

      setCheckingSession(false)
    }

    checkSession()
    return () => { active = false }
  }, [pathname, router])

  // Dummy job description for testing
  const dummyJD = `Senior Software Engineer

We are looking for a Senior Software Engineer to join our growing team. You will be responsible for designing, developing, and maintaining scalable software solutions.

Requirements:
- 5+ years of experience in software development
- Proficiency in Python, JavaScript, and TypeScript
- Experience with React, Node.js, and PostgreSQL
- Knowledge of cloud platforms (AWS, Azure, or GCP)
- Experience with Docker and Kubernetes
- Strong understanding of microservices architecture
- Excellent problem-solving and communication skills
- Bachelor's degree in Computer Science or related field

Responsibilities:
• Design and implement scalable software solutions
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews
• Mentor junior developers
• Optimize application performance
• Ensure code quality and security best practices

Soft Skills:
- Strong communication and teamwork abilities
- Leadership experience
- Adaptability and continuous learning mindset
- Project management skills

We offer competitive salary, remote work options, and opportunities for growth.`

  const handleLoadDummy = () => {
    setJobDescription(dummyJD)
  }

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setActionError('Paste a job description before starting the analysis.')
      return
    }

    setIsAnalyzing(true)
    setActionError('')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/resume/analyze-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jobDescription }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'The analysis could not be completed.')
      setAnalysis(result)
      setComparison(null)
    } catch (error) {
      console.error('Error analyzing job:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to analyze the job description. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCompare = async () => {
    if (!jobDescription.trim()) {
      setActionError('Paste a job description before comparing your resume.')
      return
    }

    if (!selectedResumeId) {
      setActionError('Save a resume first, then select it here to compare.')
      return
    }

    const selectedResume = storedResumes.find(r => r.id === selectedResumeId)
    if (!selectedResume) {
      setActionError('That saved resume could not be found. Refresh the page and try again.')
      return
    }

    setIsComparing(true)
    setActionError('')
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/resume/compare-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          resume_data: selectedResume.resume_data,
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'The comparison could not be completed.')
      setComparison(result)
      setAnalysis(null)
    } catch (error) {
      console.error('Error comparing with job:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to compare your resume. Please try again.')
    } finally {
      setIsComparing(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <Navbar />
        <main className="flex min-h-[50vh] items-center justify-center text-sm text-[#6e6e73] dark:text-[#a1a1a6]" role="status">Checking your session…</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Make each application more relevant</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Job analyzer</h1>
          <p className="mt-3 text-sm leading-6 text-[#6e6e73] dark:text-[#a1a1a6]">Review the role requirements or compare them with one of your saved resumes.</p>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
              <button
                onClick={handleLoadDummy}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                Load Sample JD
              </button>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => { setJobDescription(e.target.value); setActionError('') }}
              placeholder="Paste job description here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg h-64 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />

            {/* Resume Selector */}
            {storedResumes.length > 0 ? (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Resume to Compare</label>
                <select
                  value={selectedResumeId || ''}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {storedResumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.version_name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  No resumes found. <Link href="/builder" className="underline">Create a resume</Link> first to compare with job descriptions.
                </p>
              </div>
            )}

            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="h-5 w-5" />
                    <span>Analyze Job</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCompare}
                disabled={isComparing || storedResumes.length === 0}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {isComparing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Comparing...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5" />
                    <span>{storedResumes.length ? 'Compare with Resume' : 'Save a resume to compare'}</span>
                  </>
                )}
              </button>
            </div>

            {actionError && <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">{actionError}</p>}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {analysis && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Job Analysis Results</h2>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-sm text-gray-700">{analysis.summary}</p>
                </div>

                {/* Experience Level */}
                {analysis.experience_level && analysis.experience_level !== 'Not specified' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Experience Level</h3>
                    <p className="text-lg font-bold text-blue-600">{analysis.experience_level}</p>
                  </div>
                )}

                {/* Required Skills */}
                {analysis.required_skills && analysis.required_skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Required Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.required_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {analysis.soft_skills && analysis.soft_skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Required Soft Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.soft_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Requirements */}
                {analysis.education_requirements && analysis.education_requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Education Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.education_requirements.map((req, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Responsibilities */}
                {analysis.key_responsibilities && analysis.key_responsibilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Key Responsibilities</h3>
                    <ul className="space-y-2">
                      {analysis.key_responsibilities.map((resp, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* All Keywords */}
                {analysis.matching_keywords && analysis.matching_keywords.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">All Keywords Found</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matching_keywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {comparison && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Gap Analysis Results</h2>

                {/* Match Percentage */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Match Percentage</h3>
                    <span className={`text-3xl font-bold ${comparison.match_percentage >= 70 ? 'text-green-600' : comparison.match_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {comparison.match_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${comparison.match_percentage >= 70 ? 'bg-green-600' : comparison.match_percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${comparison.match_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Experience Level */}
                {comparison.experience_level && comparison.experience_level !== 'Not specified' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Required Experience Level</h3>
                    <p className="text-lg font-bold text-blue-600">{comparison.experience_level}</p>
                  </div>
                )}

                {/* Matched Skills */}
                {comparison.matched_skills && comparison.matched_skills.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Matched Skills ({comparison.matched_skills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {comparison.matched_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {comparison.missing_skills && comparison.missing_skills.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Missing Skills ({comparison.missing_skills.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {comparison.missing_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {comparison.recommendations && comparison.recommendations.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">Recommendations</h3>
                    </div>
                    <ul className="space-y-2">
                      {comparison.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!analysis && !comparison && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <Briefcase className="h-16 w-16 mb-4" />
                <p className="text-lg">Enter a job description and click Analyze or Compare</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
