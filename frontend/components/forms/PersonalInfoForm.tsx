'use client'

import { useState } from 'react'

interface PersonalInfoFormProps {
  data: {
    name: string
    phone: string
    email: string
    linkedin: string
    github: string
    location: string
  }
  onChange: (data: any) => void
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const [countryCode, setCountryCode] = useState('+91')

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handlePhoneChange = (value: string) => {
    const fullPhone = `${countryCode} ${value}`
    onChange({ ...data, phone: fullPhone })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter your full name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone *
          </label>
          <div className="flex min-w-0 gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-[5.75rem] shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+61">+61</option>
              <option value="+81">+81</option>
            </select>
            <input
              type="tel"
              value={data.phone.replace(countryCode, '').trim()}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter phone number"
              required
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={data.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="Enter your LinkedIn profile"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub
          </label>
          <input
            type="url"
            value={data.github}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="Enter your GitHub profile"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Enter your address"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-900 bg-white"
        />
      </div>
    </div>
  )
}
