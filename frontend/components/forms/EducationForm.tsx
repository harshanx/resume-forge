'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { StepFormHandle } from './StepFormHandle'

type GradeScale = '10' | '5' | 'percentile'
type Education = {
  degree: string
  specialization?: string
  institution: string
  university: string
  cgpa: string
  percentage: string
  grade_value?: string
  grade_scale?: GradeScale
  graduation_year: number
}

interface EducationFormProps {
  data: Education[]
  onChange: (data: Education[]) => void
  onValidityChange?: (isValid: boolean) => void
}

const emptyEducation = () => ({
  degree: '', specialization: '', institution: '', university: '', cgpa: '', percentage: '',
  grade_value: '', grade_scale: '10' as GradeScale, graduation_year: '',
})

function gradeError(value: string, scale: GradeScale) {
  if (!value.trim()) return ''
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return 'Enter a valid number (up to 2 decimal places).'
  const score = Number(value)
  const max = scale === 'percentile' ? 100 : Number(scale)
  if (score < 0 || score > max) return `Enter a value between 0 and ${max}.`
  return ''
}

function validEducationRows(rows: Education[]) {
  return rows.every((education) => {
    const score = education.grade_value ?? education.cgpa ?? education.percentage ?? ''
    const scale = education.grade_scale || (education.percentage ? 'percentile' : '10')
    return Boolean(education.degree.trim() && education.specialization?.trim()) && !gradeError(score, scale)
  })
}

const EducationForm = forwardRef<StepFormHandle, EducationFormProps>(function EducationForm({ data, onChange, onValidityChange }, ref) {
  const [newEducation, setNewEducation] = useState(emptyEducation)
  const [showValidation, setShowValidation] = useState(false)

  const draftTouched = Object.entries(newEducation).some(([key, value]) => key !== 'grade_scale' && String(value).trim() !== '')
  const currentGradeError = gradeError(newEducation.grade_value, newEducation.grade_scale)
  const draftIsValid = !draftTouched || Boolean(newEducation.degree.trim() && newEducation.specialization.trim()) && !currentGradeError
  const isValid = validEducationRows(data) && draftIsValid

  useEffect(() => {
    onValidityChange?.(isValid)
  }, [isValid, onValidityChange])

  const updateDraft = (field: keyof ReturnType<typeof emptyEducation>, value: string) => {
    setNewEducation((current) => ({ ...current, [field]: value }))
    setShowValidation(true)
  }

  const updateExisting = (index: number, field: keyof Education, value: string) => {
    const updated = data.map((education, rowIndex) => rowIndex === index
      ? { ...education, [field]: field === 'graduation_year' ? (value ? Number(value.slice(0, 4)) : 0) : value }
      : education)
    onChange(updated)
  }

  const handleAdd = () => {
    setShowValidation(true)
    if (!newEducation.degree.trim() || !newEducation.specialization.trim() || currentGradeError) return false

    const gradeValue = newEducation.grade_value.trim()
    const scale = newEducation.grade_scale
    onChange([...data, {
      ...newEducation,
      grade_value: gradeValue,
      grade_scale: scale,
      cgpa: gradeValue && scale !== 'percentile' ? `${gradeValue}/${scale}` : '',
      percentage: gradeValue && scale === 'percentile' ? `${gradeValue}%` : '',
      graduation_year: newEducation.graduation_year ? Number(newEducation.graduation_year.slice(0, 4)) : 0,
    }])
    setNewEducation(emptyEducation())
    setShowValidation(false)
    return true
  }

  useImperativeHandle(ref, () => ({
    commitDraft: () => {
      if (!draftTouched) return true
      return handleAdd()
    },
  }))

  const fieldClass = 'w-full min-h-10 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-primary-500'
  const graduationDate = (year: number) => year ? `${year}-01-01` : ''

  return (
    <div className="space-y-6">
      {data.map((education, index) => {
        const gradeValue = education.grade_value ?? (education.percentage ? education.percentage.replace('%', '') : education.cgpa?.split('/')[0] || '')
        const gradeScale = education.grade_scale || (education.percentage ? 'percentile' : education.cgpa?.includes('/5') ? '5' : '10')
        const scoreError = gradeError(gradeValue, gradeScale)
        return (
          <section key={index} className="relative space-y-3 rounded-2xl border border-black/[0.08] p-4 dark:border-white/[0.12]">
            <button type="button" onClick={() => onChange(data.filter((_, rowIndex) => rowIndex !== index))} aria-label="Remove education" className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">Degree *
                <input required value={education.degree} onChange={(event) => updateExisting(index, 'degree', event.target.value)} placeholder="Bachelor of Technology" className={`${fieldClass} mt-1 font-normal`} />
              </label>
              <label className="block text-sm font-medium text-gray-700">Specialization *
                <input required value={education.specialization || ''} onChange={(event) => updateExisting(index, 'specialization', event.target.value)} placeholder="Computer Science" className={`${fieldClass} mt-1 font-normal`} />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">Institution
                <input value={education.institution} onChange={(event) => updateExisting(index, 'institution', event.target.value)} placeholder="College or institution" className={`${fieldClass} mt-1 font-normal`} />
              </label>
              <label className="block text-sm font-medium text-gray-700">University
                <input value={education.university} onChange={(event) => updateExisting(index, 'university', event.target.value)} placeholder="University name" className={`${fieldClass} mt-1 font-normal`} />
              </label>
            </div>
            <GradeFields value={gradeValue} scale={gradeScale} error={scoreError} fieldClass={fieldClass} onValueChange={(value) => updateExisting(index, 'grade_value', value)} onScaleChange={(value) => updateExisting(index, 'grade_scale', value)} />
            <label className="block text-sm font-medium text-gray-700">Graduation date
              <input type="date" value={graduationDate(education.graduation_year)} min="1950-01-01" max="2035-12-31" onChange={(event) => updateExisting(index, 'graduation_year', event.target.value)} className={`${fieldClass} mt-1 font-normal`} />
            </label>
          </section>
        )
      })}

      <section className="space-y-4 rounded-2xl border border-dashed border-black/20 p-4 dark:border-white/20">
        <div>
          <h3 className="font-medium text-gray-900">Add education</h3>
          <p className="mt-1 text-xs text-gray-500">Degree and specialization are required for each education entry. Grades are optional.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">Degree *
            <input value={newEducation.degree} onChange={(event) => updateDraft('degree', event.target.value)} placeholder="Bachelor of Technology" className={`${fieldClass} mt-1 font-normal`} />
          </label>
          <label className="block text-sm font-medium text-gray-700">Specialization *
            <input value={newEducation.specialization} onChange={(event) => updateDraft('specialization', event.target.value)} placeholder="Computer Science" className={`${fieldClass} mt-1 font-normal`} />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">Institution
            <input value={newEducation.institution} onChange={(event) => updateDraft('institution', event.target.value)} placeholder="College or institution" className={`${fieldClass} mt-1 font-normal`} />
          </label>
          <label className="block text-sm font-medium text-gray-700">University
            <input value={newEducation.university} onChange={(event) => updateDraft('university', event.target.value)} placeholder="University name" className={`${fieldClass} mt-1 font-normal`} />
          </label>
        </div>
        <GradeFields value={newEducation.grade_value} scale={newEducation.grade_scale} error={currentGradeError} fieldClass={fieldClass} onValueChange={(value) => updateDraft('grade_value', value)} onScaleChange={(value) => updateDraft('grade_scale', value)} />
        <label className="block text-sm font-medium text-gray-700">Graduation date
          <input type="date" value={newEducation.graduation_year} min="1950-01-01" max="2035-12-31" onChange={(event) => updateDraft('graduation_year', event.target.value)} className={`${fieldClass} mt-1 font-normal`} />
        </label>
        {showValidation && !draftIsValid && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{currentGradeError || 'Complete the degree and specialization, or clear this unfinished entry before continuing.'}</p>}
        <button type="button" disabled={!draftTouched || !draftIsValid} onClick={handleAdd} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black">
          <Plus className="h-4 w-4" />Add education
        </button>
      </section>
    </div>
  )
})

export default EducationForm

function GradeFields({ value, scale, error, fieldClass, onValueChange, onScaleChange }: {
  value: string
  scale: GradeScale
  error: string
  fieldClass: string
  onValueChange: (value: string) => void
  onScaleChange: (value: GradeScale) => void
}) {
  const placeholder = scale === 'percentile'
    ? 'e.g. 92'
    : scale === '5'
      ? 'e.g. 4.5 / 5'
      : 'e.g. 8.5 / 10'

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <label className="block text-sm font-medium text-gray-700">Grade scale
        <select value={scale} onChange={(event) => onScaleChange(event.target.value as GradeScale)} className={`${fieldClass} mt-1 font-normal`}>
          <option value="10">CGPA out of 10</option>
          <option value="5">CGPA out of 5</option>
          <option value="percentile">Percentile (0–100)</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">Grade <span className="font-normal text-gray-500">(optional)</span>
        <input type="number" inputMode="decimal" step="0.01" min="0" max={scale === 'percentile' ? 100 : Number(scale)} value={value} onChange={(event) => onValueChange(event.target.value)} placeholder={placeholder} className={`${fieldClass} mt-1 font-normal`} aria-invalid={Boolean(error)} />
        {error && <span role="alert" className="mt-1 block text-xs font-normal text-red-700 dark:text-red-300">{error}</span>}
      </label>
    </div>
  )
}
