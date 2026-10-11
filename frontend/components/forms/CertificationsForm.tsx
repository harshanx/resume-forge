'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { isValidHttpUrl } from '@/lib/validation'

interface CertificationsFormProps {
  data: Array<{
    name: string
    organization: string
    date: string
    certificate_id: string
    url?: string
  }>
  onChange: (data: any) => void
  onValidityChange?: (isValid: boolean) => void
}

export default function CertificationsForm({ data, onChange, onValidityChange }: CertificationsFormProps) {
  const [newCert, setNewCert] = useState({
    name: '',
    organization: '',
    date: '',
    certificate_id: '',
    url: '',
  })
  const urlsValid = data.every((cert) => isValidHttpUrl(cert.url || '')) && isValidHttpUrl(newCert.url)
  useEffect(() => { onValidityChange?.(urlsValid) }, [onValidityChange, urlsValid])

  const handleAdd = () => {
    if (newCert.name.trim() && isValidHttpUrl(newCert.url)) {
      onChange([...data, newCert])
      setNewCert({
        name: '',
        organization: '',
        date: '',
        certificate_id: '',
        url: '',
      })
    }
  }

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {data.map((cert, index) => (
        <div key={index} className="p-4 border rounded-lg relative">
          <button
            onClick={() => handleRemove(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name *
              </label>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => {
                  const updated = [...data]
                  updated[index].name = e.target.value
                  onChange(updated)
                }}
                placeholder="Software Engineer Role Certification"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={cert.organization}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index].organization = e.target.value
                    onChange(updated)
                  }}
                  placeholder="HackerRank"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={cert.date}
                  onChange={(e) => {
                    const updated = [...data]
                    updated[index].date = e.target.value
                    onChange(updated)
                  }}
                  placeholder="24 Sep 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certificate ID
              </label>
              <input
                type="text"
                value={cert.certificate_id}
                onChange={(e) => {
                  const updated = [...data]
                  updated[index].certificate_id = e.target.value
                  onChange(updated)
                }}
                placeholder="0ED97FC20668"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL <span className="font-normal text-gray-500">(optional)</span></label>
              <input
                type="url"
                value={cert.url || ''}
                onChange={(e) => {
                  const updated = [...data]
                  updated[index] = { ...updated[index], url: e.target.value }
                  onChange(updated)
                }}
                placeholder="https://example.com/certificate"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900"
                aria-invalid={!isValidHttpUrl(cert.url || '')}
              />
              {!isValidHttpUrl(cert.url || '') && <p role="alert" className="mt-1 text-xs text-red-700">Enter a valid http or https URL.</p>}
            </div>
          </div>
        </div>
      ))}

      <div className="p-4 border-2 border-dashed rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Add New Certification</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newCert.name}
            onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
            placeholder="Certification Name *"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newCert.organization}
              onChange={(e) => setNewCert({ ...newCert, organization: e.target.value })}
              placeholder="Organization"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
            <input
              type="text"
              value={newCert.date}
              onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
              placeholder="Date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>
          <input
            type="text"
            value={newCert.certificate_id}
            onChange={(e) => setNewCert({ ...newCert, certificate_id: e.target.value })}
            placeholder="Certificate ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Certificate URL <span className="font-normal text-gray-500">(optional)</span></label>
            <input type="url" value={newCert.url} onChange={(e) => setNewCert({ ...newCert, url: e.target.value })} placeholder="https://example.com/certificate" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900" aria-invalid={!isValidHttpUrl(newCert.url)} />
            {!isValidHttpUrl(newCert.url) && <p role="alert" className="mt-1 text-xs text-red-700">Enter a valid http or https URL.</p>}
          </div>
          <button
            type="button"
            disabled={!newCert.name.trim() || !isValidHttpUrl(newCert.url)}
            onClick={handleAdd}
            className="flex min-h-10 items-center space-x-2 rounded-full bg-primary-600 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            <span>Add Certification</span>
          </button>
        </div>
      </div>
    </div>
  )
}
