'use client'

interface SkillsFormProps {
  data: {
    technical: string
    professional: string
  }
  onChange: (data: any) => void
}

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technical Skills
        </label>
        <input
          type="text"
          value={data.technical}
          onChange={(e) => handleChange('technical', e.target.value)}
          placeholder="Python, C++, JavaScript, Flutter, Firebase, Git"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate skills with commas
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Skills
        </label>
        <input
          type="text"
          value={data.professional}
          onChange={(e) => handleChange('professional', e.target.value)}
          placeholder="Problem Solving, Team Coordination, Technical Documentation"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
        />
        <p className="text-xs text-gray-500 mt-1">
          Separate skills with commas
        </p>
      </div>
    </div>
  )
}
