import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StarIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutline } from '@heroicons/react/24/outline'
import api from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'

const TutorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    subject: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: tutors, isLoading, error } = useQuery({
    queryKey: ['tutors', searchTerm, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })
      const response = await api.get(`/tutors/search?${params}`)
      return response.data.tutors
    },
  })

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < fullStars ? (
              <StarIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarOutline className="h-4 w-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating?.toFixed(1) || 0})</span>
      </div>
    )
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <div className="text-center text-red-500 py-10">Error loading tutors</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Tutor</h1>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, subject, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-md grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Subject"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="input"
            />
            <input
              type="number"
              placeholder="Min Price ($/hr)"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input"
            />
            <input
              type="number"
              placeholder="Max Price ($/hr)"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input"
            />
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              className="input"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        )}
      </div>

      {tutors?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tutors found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors?.map((tutor) => (
            <Link to={`/tutor/${tutor.userId?._id}`} key={tutor._id} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={tutor.userId?.avatar || `https://ui-avatars.com/api/?name=${tutor.userId?.name}&background=3b82f6&color=fff`}
                      alt={tutor.userId?.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{tutor.userId?.name}</h3>
                      <p className="text-sm text-gray-500">{tutor.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary-600">${tutor.hourlyRate}</span>
                    <span className="text-gray-500">/hr</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  {renderStars(tutor.rating)}
                </div>
                
                <p className="mt-3 text-gray-600 text-sm line-clamp-2">{tutor.bio}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {tutor.subjectsOffered?.slice(0, 3).map((subject, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {subject}
                    </span>
                  ))}
                  {tutor.subjectsOffered?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{tutor.subjectsOffered.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {tutor.totalReviews} reviews • {tutor.experience}+ yrs exp
                  </div>
                  <button className="btn-primary px-4 py-1 text-sm">
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TutorSearch