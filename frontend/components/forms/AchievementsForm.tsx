'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { StepFormHandle } from './StepFormHandle'

interface AchievementsFormProps {
  data: string[]
  onChange: (data: string[]) => void
}

const AchievementsForm = forwardRef<StepFormHandle<string[]>, AchievementsFormProps>(function AchievementsForm({ data, onChange }, ref) {
  const [newAchievement, setNewAchievement] = useState('')

  const handleAdd = () => {
    return commitDraft()
  }

  const commitDraft = () => {
    const achievement = newAchievement.trim()
    if (!achievement) return data
    const updated = [...data, achievement]
    onChange(updated)
    setNewAchievement('')
    return updated
  }

  useImperativeHandle(ref, () => ({ commitDraft }))

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {data.map((achievement, index) => (
        <div key={index} className="flex space-x-2">
          <input
            type="text"
            value={achievement}
            onChange={(e) => {
              const updated = [...data]
              updated[index] = e.target.value
              onChange(updated)
            }}
            placeholder="• Achievement or activity"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
          <button
            onClick={() => handleRemove(index)}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}

      {data.length < 10 && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newAchievement}
            onChange={(e) => setNewAchievement(e.target.value)}
            placeholder="• Add new achievement or activity"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
      )}
    </div>
  )
})

export default AchievementsForm
