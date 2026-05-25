import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CalendarIcon, ClockIcon, ShieldCheckIcon, UserIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'
import PayPalMockCheckout from './PayPalMockCheckout'
import "react-datepicker/dist/react-datepicker.css"

const BookingPage = () => {
  const { tutorId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { tutorName, hourlyRate: propHourlyRate } = location.state || {}

  const [step, setStep] = useState('details')
  const [pendingBooking, setPendingBooking] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [duration, setDuration] = useState(1)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: ''
  })

  const { data: tutor, isLoading: tutorLoading } = useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: async () => {
      const response = await api.get(`/tutors/profile/${tutorId}`)
      return response.data.profile
    },
  })

  useEffect(() => {
    const fetchSlots = async () => {
      if (!tutorId) return
      setLoadingSlots(true)
      try {
        const formattedDate = selectedDate.toISOString().split('T')[0]
        const response = await api.get(`/bookings/available-slots?tutorId=${tutorId}&date=${formattedDate}`)
        setAvailableSlots(response.data.slots || [])
        setSelectedSlot(null)
      } catch (error) {
        console.error('Error fetching slots:', error)
        toast.error('Failed to load available slots')
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [selectedDate, tutorId])

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await api.get('/auth/me')
        const user = response.data.user
        setContactInfo({
          studentName: user.name || '',
          studentEmail: user.email || '',
          studentPhone: user.phoneNumber || ''
        })
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    loadUserData()
  }, [])

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await api.post('/bookings', bookingData)
      return response.data
    },
    onSuccess: (data) => {
      const booking = data.data?.booking || data.booking
      setPendingBooking(booking)
      setStep('payment')
      toast.success('Booking created — complete payment to confirm')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Booking failed')
    }
  })

  const hourlyRate = tutor?.hourlyRate || propHourlyRate || 0
  const totalCost = hourlyRate * duration

  const handleBooking = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    if (!contactInfo.studentName || !contactInfo.studentEmail) {
      toast.error('Please enter your name and email')
      return
    }

    bookingMutation.mutate({
      tutorId,
      date: selectedDate.toISOString().split('T')[0],
      startTime: selectedSlot,
      duration,
      totalAmount: totalCost,
      studentName: contactInfo.studentName,
      studentEmail: contactInfo.studentEmail,
      studentPhone: contactInfo.studentPhone
    })
  }

  const handlePaymentSuccess = (data) => {
    if (data.meetingLink) {
      toast.success('Meeting link ready — check your dashboard')
    }
    navigate('/dashboard/student')
  }

  if (tutorLoading) return <LoadingSpinner />

  if (step === 'payment' && pendingBooking) {
    return (
      <PayPalMockCheckout
        bookingId={pendingBooking._id}
        amount={pendingBooking.totalAmount}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setStep('details')}
        tutorName={tutor?.userId?.name || tutorName}
        subject={tutor?.subject}
        sessionDate={pendingBooking.date}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <img
                src={tutor?.userId?.avatar || `https://ui-avatars.com/api/?name=${tutor?.userId?.name}`}
                alt={tutor?.userId?.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-2xl font-bold">{tutor?.userId?.name || tutorName}</h2>
                <p className="text-gray-600">{tutor?.subject} • ${hourlyRate}/hour</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-primary-500" />
              Your Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={contactInfo.studentName}
                    onChange={(e) => setContactInfo({ ...contactInfo, studentName: e.target.value })}
                    className="input pl-10"
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={contactInfo.studentEmail}
                    onChange={(e) => setContactInfo({ ...contactInfo, studentEmail: e.target.value })}
                    className="input pl-10"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone (Optional)</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={contactInfo.studentPhone}
                    onChange={(e) => setContactInfo({ ...contactInfo, studentPhone: e.target.value })}
                    className="input pl-10"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
              Select Date
            </h3>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              inline
              className="w-full"
            />
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-primary-500" />
              Select Time
            </h3>
            {loadingSlots ? (
              <LoadingSpinner />
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No available slots for this date</p>
                <p className="text-sm text-gray-400 mt-1">Please select another date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 text-center rounded-lg border transition-all ${
                      selectedSlot === slot
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-gray-300 hover:border-primary-500 hover:bg-blue-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Session Duration</h3>
            <div className="flex gap-4">
              {[1, 2, 3].map((hr) => (
                <button
                  key={hr}
                  onClick={() => setDuration(hr)}
                  className={`px-6 py-2 rounded-lg border ${
                    duration === hr
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  {hr} Hour{hr > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Tutor</span>
                <span className="font-medium">{tutor?.userId?.name || tutorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hourly Rate</span>
                <span>${hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span>{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time</span>
                <span>
                  {selectedDate.toLocaleDateString()} {selectedSlot || '--:--'}
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-primary-600">${totalCost}</span>
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedSlot || bookingMutation.isPending || !contactInfo.studentName || !contactInfo.studentEmail}
              className="w-full btn-primary mt-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingMutation.isPending ? 'Creating booking...' : 'Continue to Payment'}
            </button>

            <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              Payment required to confirm your session
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
