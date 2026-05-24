import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpenIcon, CalendarIcon, StarIcon, CurrencyDollarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const response = await api.get('/students/stats')
      return response.data
    },
  })

  const { data: bookings, refetch: refetchBookings } = useQuery({
    queryKey: ['student-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/student')
      return response.data.bookings || [
        ...(response.data.upcoming || []),
        ...(response.data.past || [])
      ]
    },
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ bookingId, rating, comment }) => {
      const response = await api.post('/reviews', { bookingId, rating, comment })
      return response.data
    },
    onSuccess: () => {
      toast.success('Review submitted successfully!')
      setShowReviewModal(false)
      setReviewComment('')
      setReviewRating(5)
      refetchBookings()
      queryClient.invalidateQueries(['student-stats'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    }
  })

  const handleReview = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  const submitReview = () => {
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment')
      return
    }
    reviewMutation.mutate({
      bookingId: selectedBooking._id,
      rating: reviewRating,
      comment: reviewComment
    })
  }

  if (isLoading) return <LoadingSpinner />

  const completedSessions = bookings?.filter(b => b.status === 'completed') || []
  const upcomingSessions = bookings?.filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date()) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Sessions Completed</p>
              <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
            </div>
            <BookOpenIcon className="h-10 w-10 text-primary-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Hours</p>
              <p className="text-2xl font-bold">{stats?.totalHours || 0}</p>
            </div>
            <CalendarIcon className="h-10 w-10 text-green-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">${stats?.totalSpent || 0}</p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Reviews Given</p>
              <p className="text-2xl font-bold">{stats?.reviews || 0}</p>
            </div>
            <StarIcon className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-green-500" />
            Upcoming Sessions
          </h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div key={session._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.tutorId?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()} at {session.startTime}</p>
                  <p className="text-sm text-gray-500">Duration: {session.duration} hour(s)</p>
                  {session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                      Join Meeting Link
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Confirmed</span>
                  <p className="text-sm font-semibold mt-1">${session.totalAmount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions - Rate Your Tutors */}
      {completedSessions.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            Rate Your Tutors
          </h2>
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <div key={session._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{session.tutorId?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{session.subject} • {session.duration} hour(s)</p>
                </div>
                <div className="text-right">
                  {session.isReviewed ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Reviewed ✓</span>
                  ) : (
                    <button
                      onClick={() => handleReview(session)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
                    >
                      <StarIcon className="h-4 w-4" />
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Review Your Session</h2>
            <p className="text-gray-600 mb-4">Rate your experience with {selectedBooking?.tutorId?.name}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none"
                  >
                    <StarIcon className={`h-8 w-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea
                rows="4"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="input"
                placeholder="Share your learning experience..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={submitReview}
                disabled={reviewMutation.isPending}
                className="flex-1 btn-primary py-2 disabled:opacity-50"
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard