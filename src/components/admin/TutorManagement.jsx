import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const TutorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTutor, setEditingTutor] = useState(null)
  const [editForm, setEditForm] = useState({})
  const queryClient = useQueryClient()

  const { data: tutors, isLoading } = useQuery({
    queryKey: ['admin-tutors'],
    queryFn: async () => {
      const response = await api.get('/admin/tutors')
      return response.data.tutors
    },
  })

  const updateTutorMutation = useMutation({
    mutationFn: async ({ tutorId, data }) => {
      const response = await api.put(`/admin/tutors/${tutorId}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Tutor updated successfully')
      queryClient.invalidateQueries(['admin-tutors'])
      queryClient.invalidateQueries(['admin-stats'])
      setEditingTutor(null)
      setEditForm({})
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update tutor')
    }
  })

  const deleteTutorMutation = useMutation({
    mutationFn: async (tutorId) => {
      const response = await api.delete(`/admin/tutors/${tutorId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Tutor removed successfully')
      queryClient.invalidateQueries(['admin-tutors'])
      queryClient.invalidateQueries(['admin-stats'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete tutor')
    }
  })

  const handleEdit = (tutor) => {
    setEditingTutor(tutor.userId._id)
    setEditForm({
      subject: tutor.subject,
      hourlyRate: tutor.hourlyRate,
      bio: tutor.bio,
      experience: tutor.experience,
      education: tutor.education,
      isApproved: tutor.isApproved
    })
  }

  const handleUpdate = () => {
    updateTutorMutation.mutate({ tutorId: editingTutor, data: editForm })
  }

  const handleDelete = (tutorId, tutorName) => {
    if (window.confirm(`Are you sure you want to remove ${tutorName} as a tutor?`)) {
      deleteTutorMutation.mutate(tutorId)
    }
  }

  const filteredTutors = tutors?.filter(tutor =>
    tutor.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tutor Management</h1>
        <p className="text-gray-600 mt-1">Manage all tutors on the platform</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tutors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutors?.map((tutor) => (
          <div key={tutor._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={tutor.userId?.avatar || `https://ui-avatars.com/api/?name=${tutor.userId?.name}`}
                  alt={tutor.userId?.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  {editingTutor === tutor.userId?._id ? (
                    <input
                      type="text"
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="input text-sm py-1"
                    />
                  ) : (
                    <h3 className="font-semibold">{tutor.userId?.name}</h3>
                  )}
                  {editingTutor === tutor.userId?._id ? (
                    <input
                      type="number"
                      value={editForm.hourlyRate}
                      onChange={(e) => setEditForm({ ...editForm, hourlyRate: e.target.value })}
                      className="input text-sm py-1 mt-1 w-24"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">{tutor.subject} • ${tutor.hourlyRate}/hr</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                {editingTutor === tutor.userId?._id ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Save"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setEditingTutor(null)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Cancel"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(tutor)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Tutor"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tutor.userId._id, tutor.userId.name)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove Tutor"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              {editingTutor === tutor.userId?._id ? (
                <>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="input text-sm w-full"
                    rows="2"
                    placeholder="Bio"
                  />
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={editForm.experience}
                      onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                      className="input text-sm w-1/2"
                      placeholder="Experience"
                    />
                    <input
                      type="text"
                      value={editForm.education}
                      onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                      className="input text-sm w-1/2"
                      placeholder="Education"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editForm.isApproved}
                        onChange={(e) => setEditForm({ ...editForm, isApproved: e.target.checked })}
                      />
                      <span className="text-sm">Approved</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{tutor.experience} years exp</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tutor.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tutor.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  {tutor.education && (
                    <p className="text-xs text-gray-500 mt-1">{tutor.education}</p>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <div>
                <span className="text-gray-500">Students:</span>
                <span className="ml-1 font-medium">{tutor.totalStudents || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Sessions:</span>
                <span className="ml-1 font-medium">{tutor.totalSessions || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">Rating:</span>
                <span className="ml-1 font-medium">{tutor.rating?.toFixed(1) || 0}★</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TutorManagement