import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const TutorApproval = () => {
  const queryClient = useQueryClient()

  const { data: pendingTutors, isLoading, refetch } = useQuery({
    queryKey: ['pending-tutors'],
    queryFn: async () => {
      const response = await api.get('/admin/pending-tutors')
      console.log('Pending tutors response:', response.data)
      return response.data.tutors
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (tutorId) => {
      const response = await api.post(`/admin/approve-tutor/${tutorId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Tutor approved successfully!')
      queryClient.invalidateQueries(['pending-tutors'])
      queryClient.invalidateQueries(['admin-stats'])
    },
    onError: (error) => {
      console.error('Approve error:', error)
      toast.error(error.response?.data?.message || 'Failed to approve tutor')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async (tutorId) => {
      const response = await api.post(`/admin/reject-tutor/${tutorId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Tutor rejected')
      queryClient.invalidateQueries(['pending-tutors'])
      queryClient.invalidateQueries(['admin-stats'])
    },
    onError: (error) => {
      console.error('Reject error:', error)
      toast.error(error.response?.data?.message || 'Failed to reject tutor')
    }
  })

  const handleApprove = (tutorId) => {
    approveMutation.mutate(tutorId)
  }

  const handleReject = (tutorId) => {
    if (window.confirm('Are you sure you want to reject this tutor?')) {
      rejectMutation.mutate(tutorId)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tutor Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve tutor applications</p>
      </div>

      <div className="grid gap-6">
        {pendingTutors?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No pending tutor approvals</p>
          </div>
        ) : (
          pendingTutors?.map((tutor) => (
            <div key={tutor._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={tutor.userId?.avatar || `https://ui-avatars.com/api/?name=${tutor.userId?.name}&background=3b82f6&color=fff`}
                    alt={tutor.userId?.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{tutor.userId?.name}</h3>
                    <p className="text-gray-600">{tutor.subject}</p>
                    <p className="text-sm text-gray-500">${tutor.hourlyRate}/hour</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(tutor.userId?._id)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(tutor.userId?._id)}
                    disabled={rejectMutation.isPending}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircleIcon className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{tutor.experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="font-medium">{tutor.education}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Subjects</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tutor.subjectsOffered?.map((subject, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">Bio</p>
                <p className="text-gray-700">{tutor.bio}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TutorApproval