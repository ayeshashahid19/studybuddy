import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const TutorProfileSetup = () => {
  const [formData, setFormData] = useState({
    subject: '',
    subjectsOffered: [],
    hourlyRate: '',
    bio: '',
    experience: '',
    education: ''
  })
  const [newSubject, setNewSubject] = useState('')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['tutor-profile'],
    queryFn: async () => {
      try {
        const response = await api.get('/tutors/profile/me')
        return response.data.profile
      } catch (error) {
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    }
  })

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/tutors/profile', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Profile saved successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save profile')
    }
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        subject: profile.subject || '',
        subjectsOffered: profile.subjectsOffered || [],
        hourlyRate: profile.hourlyRate || '',
        bio: profile.bio || '',
        experience: profile.experience || '',
        education: profile.education || ''
      })
    }
  }, [profile])

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const addSubject = () => {
    if (newSubject && !formData.subjectsOffered.includes(newSubject)) {
      setFormData({
        ...formData,
        subjectsOffered: [...formData.subjectsOffered, newSubject]
      })
      setNewSubject('')
    }
  }

  const removeSubject = (subject) => {
    setFormData({
      ...formData,
      subjectsOffered: formData.subjectsOffered.filter(s => s !== subject)
    })
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">Tutor Profile Setup</h1>
        <p className="text-gray-600 mb-6">Create your profile to start teaching</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Subject *
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input"
              placeholder="e.g., Mathematics"
            />
          </div>

          {/* Subjects Offered */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subjects You Teach
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="input flex-1"
                placeholder="Add a subject"
              />
              <button
                type="button"
                onClick={addSubject}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.subjectsOffered.map((subject, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeSubject(subject)}
                    className="text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="5"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              className="input"
              placeholder="50"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="input"
              placeholder="5"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Education
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="input"
              placeholder="Master's in Computer Science"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio / About Me *
            </label>
            <textarea
              required
              rows="5"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input"
              placeholder="Tell students about yourself, your teaching style, and experience..."
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TutorProfileSetup