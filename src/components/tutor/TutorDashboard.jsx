import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCircleIcon, CurrencyDollarIcon, StarIcon, CalendarIcon, PencilIcon, UsersIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const TutorDashboard = () => {
  const queryClient = useQueryClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['tutor-stats'],
    queryFn: async () => {
      const response = await api.get('/tutors/stats')
      return response.data
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (bookingId) => {
      const response = await api.put(`/bookings/${bookingId}/complete`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Session marked as complete!')
      queryClient.invalidateQueries({ queryKey: ['tutor-stats'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to complete session')
    },
  })

  const handleMarkComplete = (bookingId) => {
    completeMutation.mutate(bookingId)
  }

  const isCompleting = (bookingId) =>
    completeMutation.isPending && completeMutation.variables === bookingId

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your tutoring business</p>
        </div>
        <Link to="/tutor/profile-setup" className="btn-secondary flex items-center gap-2">
          <PencilIcon className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      {/* Profile Alert */}
      {!stats?.profile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            You haven't set up your tutor profile yet.{' '}
            <Link to="/tutor/profile-setup" className="text-yellow-800 font-semibold underline">
              Click here to create your profile
            </Link>
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">${stats?.totalEarnings?.toLocaleString() || 0}</p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sessions</p>
              <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
            </div>
            <BookOpenIcon className="h-10 w-10 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats?.completedSessions || 0}</p>
            </div>
            <CalendarIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Rating</p>
              <p className="text-2xl font-bold">{stats?.rating?.toFixed(1) || 0} ★</p>
            </div>
            <StarIcon className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Students</p>
              <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
            </div>
            <UsersIcon className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* My Students Section */}
      {stats?.allBookings?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-primary-500" />
            My Students
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sessions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Session</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...new Map(stats.allBookings.map(b => [b.studentId?._id, b])).values()].map((booking) => {
                  const student = booking.studentId
                  const studentBookings = stats.allBookings.filter(b => b.studentId?._id === student?._id)
                  const totalSpent = studentBookings.reduce((sum, b) => sum + b.totalAmount, 0)
                  const lastSession = studentBookings[0]?.date
                  return (
                    <tr key={student?._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={student?.avatar || `https://ui-avatars.com/api/?name=${student?.name}`} className="h-8 w-8 rounded-full mr-3" />
                          <span className="font-medium">{student?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{student?.email}</div>
                        <div className="text-gray-500">{student?.phoneNumber || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{studentBookings.length}</td>
                      <td className="px-6 py-4 text-sm">${totalSpent}</td>
                      <td className="px-6 py-4 text-sm">{lastSession ? new Date(lastSession).toLocaleDateString() : '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {stats?.upcomingSessions?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-green-500" />
            Upcoming Sessions
          </h2>
          <div className="space-y-3">
            {stats.upcomingSessions.map((session) => (
              <div key={session._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.studentId?.name}</p>
                  <p className="text-sm text-gray-500">{session.studentId?.email}</p>
                  <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()} at {session.startTime}</p>
                  {session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                      Join Meeting Link
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {session.startTime} - {session.endTime}
                  </span>
                  {session.status === 'confirmed' && (
                    <button
                      onClick={() => handleMarkComplete(session._id)}
                      disabled={isCompleting(session._id)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      {isCompleting(session._id) ? 'Completing…' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions History */}
      {stats?.pastSessions?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-gray-500" />
            Session History
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.pastSessions.map((session) => (
                  <tr key={session._id}>
                    <td className="px-6 py-4 text-sm">{new Date(session.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">{session.studentId?.name}</td>
                    <td className="px-6 py-4 text-sm">{session.duration} hour(s)</td>
                    <td className="px-6 py-4 text-sm">${session.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {session.status === 'confirmed' && (
                        <button
                          onClick={() => handleMarkComplete(session._id)}
                          disabled={isCompleting(session._id)}
                          className="px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircleIcon className="h-3.5 w-3.5" />
                          {isCompleting(session._id) ? 'Completing…' : 'Mark Complete'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorDashboard