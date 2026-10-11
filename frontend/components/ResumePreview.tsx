'use client'

interface ResumePreviewProps {
  data: {
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
      specialization?: string
      institution: string
      university: string
      cgpa: string
      percentage: string
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
}

export default function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <div className="resume-paper bg-white border rounded-lg p-6 min-h-[800px] font-serif text-sm text-gray-900">
      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold uppercase mb-2 text-gray-900">
          {data.personal.name || 'Your Name'}
        </h1>
        <div className="text-xs text-gray-700">
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.phone && (data.personal.email || data.personal.linkedin || data.personal.github) && (
            <span> | </span>
          )}
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.email && (data.personal.linkedin || data.personal.github) && (
            <span> | </span>
          )}
          {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
          {data.personal.linkedin && data.personal.github && <span> | </span>}
          {data.personal.github && <span>{data.personal.github}</span>}
        </div>
        {data.personal.location && (
          <div className="text-xs text-gray-700 mt-1">{data.personal.location}</div>
        )}
      </div>

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold uppercase text-sm border-b mb-2 pb-1">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="font-semibold">{edu.degree}{edu.specialization ? ` in ${edu.specialization}` : ''}</div>
              <div className="text-xs text-gray-600">
                {edu.institution} {edu.university && `| ${edu.university}`}
              </div>
              {(edu.grade_value || edu.cgpa || edu.percentage) && <div className="text-xs text-gray-600">
                {edu.grade_value
                  ? edu.grade_scale === 'percentile'
                    ? `Percentile: ${edu.grade_value}%`
                    : `CGPA: ${edu.grade_value}/${edu.grade_scale || '10'}`
                  : [edu.cgpa && `CGPA: ${edu.cgpa}`, edu.percentage && `Percentage: ${edu.percentage}`].filter(Boolean).join(' · ')}
              </div>}
              {edu.graduation_year > 0 && <div className="text-xs text-gray-600">{edu.graduation_year}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (data.skills.technical || data.skills.professional) && (
        <div className="mb-4">
          <h2 className="font-bold uppercase text-sm border-b mb-2 pb-1">Core Skills</h2>
          {data.skills.technical && (
            <div className="mb-1">
              <span className="font-semibold">Technical Skills:</span> {data.skills.technical}
            </div>
          )}
          {data.skills.professional && (
            <div>
              <span className="font-semibold">Professional Skills:</span> {data.skills.professional}
            </div>
          )}
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold uppercase text-sm border-b mb-2 pb-1">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <div className="font-semibold">{cert.name}</div>
              <div className="text-xs text-gray-600">
                {cert.organization} {cert.certificate_id && `| ID: ${cert.certificate_id}`}
              </div>
              {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="break-all text-xs text-gray-700 underline">View certificate</a>}
            </div>
          ))}
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold uppercase text-sm border-b mb-2 pb-1">Internship Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-2">
              <div className="font-semibold">{exp.job_title}</div>
              <div className="text-xs text-gray-600">{exp.company}</div>
              {exp.date && <div className="text-xs text-gray-600">{exp.date}</div>}
              {exp.bullets.length > 0 && (
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold uppercase text-sm border-b mb-2 pb-1">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-2">
              <div className="font-semibold">{project.name}</div>
              <div className="text-xs text-gray-600">{project.technologies}</div>
              {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="break-all text-xs text-gray-700 underline">GitHub repository</a>}
              {project.bullets.length > 0 && (
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  {project.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {data.achievements.length > 0 && (
        <div>
          <h2 className="font-bold uppercase text-sm border-b mb-2 pb-1">Achievements & Activities</h2>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {data.achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {!data.personal.name && !data.education.length && !data.experience.length && !data.projects.length && (
        <div className="text-center text-gray-400 py-20">
          <p>Fill in the form to see your resume preview</p>
        </div>
      )}
    </div>
  )
}
