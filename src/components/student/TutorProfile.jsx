import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StarIcon, EnvelopeIcon, CurrencyDollarIcon, AcademicCapIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/solid'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const TutorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: async () => {
      const response = await api.get(`/tutors/profile/${id}`)
      return response.data.profile
    },
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tutor Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start space-x-6">
              <img
                src={tutor?.userId?.avatar || `https://ui-avatars.com/api/?name=${tutor?.userId?.name}&size=120&background=3b82f6&color=fff`}
                alt={tutor?.userId?.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{tutor?.userId?.name}</h1>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 font-semibold">{tutor?.rating?.toFixed(1) || 0}</span>
                    <span className="text-gray-500 ml-1">({tutor?.totalReviews || 0} reviews)</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">{tutor?.subject}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutor?.subjectsOffered?.map((subject, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">About Me</h2>
            <p className="text-gray-700">{tutor?.bio}</p>
            <div className="mt-4 flex items-center text-gray-600">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              <span>{tutor?.experience}+ years of teaching experience</span>
            </div>
            {tutor?.education && (
              <div className="mt-2 flex items-center text-gray-600">
                <UserIcon className="h-5 w-5 mr-2" />
                <span>Education: {tutor?.education}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Booking & Contact */}
        <div className="space-y-6">
          {/* Booking Card */}
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-4">
              <CurrencyDollarIcon className="h-12 w-12 text-green-500 mx-auto" />
              <div className="mt-2">
                <span className="text-3xl font-bold">${tutor?.hourlyRate}</span>
                <span className="text-gray-500">/hour</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/booking/${tutor?.userId?._id}`, { 
                state: { tutorName: tutor?.userId?.name, hourlyRate: tutor?.hourlyRate }
              })}
              className="w-full btn-primary py-3 mb-3"
            >
              Book a Session
            </button>
          </div>

          {/* Contact Info Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <EnvelopeIcon className="h-5 w-5 mr-2 text-primary-500" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <a href={`mailto:${tutor?.userId?.email}`} className="text-primary-600 hover:underline">
                  {tutor?.userId?.email}
                </a>
              </div>
              {tutor?.userId?.phoneNumber && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a href={`tel:${tutor?.userId?.phoneNumber}`} className="text-primary-600 hover:underline">
                    {tutor?.userId?.phoneNumber}
                  </a>
                </div>
              )}
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500">Response Time</p>
                <p className="font-medium">Usually responds within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorProfile