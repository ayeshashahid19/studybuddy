import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  UsersIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../common/LoadingSpinner'

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('week')
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats', timeRange],
    queryFn: async () => {
      const response = await api.get(`/admin/stats?range=${timeRange}`)
      return response.data
    },
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await api.get('/admin/recent-activity')
      return response.data.activity || []
    },
  })

  const {
    data: pendingTutors,
    isLoading: pendingLoading,
    isError: pendingError,
  } = useQuery({
    queryKey: ['pending-tutors'],
    queryFn: async () => {
      const response = await api.get('/admin/pending-tutors')
      return response.data.tutors || []
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (tutorId) => {
      const response = await api.post(`/admin/approve-tutor/${tutorId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Tutor approved successfully!')
      queryClient.invalidateQueries({ queryKey: ['pending-tutors'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve tutor')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (tutorId) => {
      const response = await api.post(`/admin/reject-tutor/${tutorId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Tutor rejected')
      queryClient.invalidateQueries({ queryKey: ['pending-tutors'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject tutor')
    },
  })

  const handleApprove = (tutorId) => {
    approveMutation.mutate(tutorId)
  }

  const handleReject = (tutorId) => {
    if (window.confirm('Are you sure you want to reject this tutor?')) {
      rejectMutation.mutate(tutorId)
    }
  }

  const isApproving = (tutorId) =>
    approveMutation.isPending && approveMutation.variables === tutorId

  const isRejecting = (tutorId) =>
    rejectMutation.isPending && rejectMutation.variables === tutorId

  if (statsLoading) return <LoadingSpinner />

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  const statsCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'bg-blue-500' },
    { title: 'Active Tutors', value: stats?.activeTutors || 0, icon: UserGroupIcon, color: 'bg-green-500' },
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: UsersIcon, color: 'bg-purple-500' },
    { title: 'Platform Revenue', value: `$${stats?.revenue || 0}`, icon: CurrencyDollarIcon, color: 'bg-yellow-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage platform, users, and monitor activity</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex justify-end space-x-2">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg capitalize ${
                timeRange === range
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.userDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(stats?.userDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Tutor Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Pending Tutor Approvals</h3>
            <p className="text-gray-500 text-sm">Review and approve tutor applications</p>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingLoading ? (
              <div className="p-6 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : pendingError ? (
              <div className="p-6 text-center text-red-600 text-sm">
                Failed to load pending approvals. Please try again.
              </div>
            ) : pendingTutors?.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No pending approvals
              </div>
            ) : (
              pendingTutors.map((tutor) => {
                const tutorUserId = tutor.userId?._id
                return (
                  <div key={tutor._id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{tutor.userId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{tutor.userId?.email}</p>
                        <p className="text-sm text-gray-500">{tutor.subject} • {tutor.experience || 0} years exp</p>
                        <p className="text-xs text-gray-400">
                          Applied: {tutor.createdAt ? new Date(tutor.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(tutorUserId)}
                        disabled={isApproving(tutorUserId) || isRejecting(tutorUserId)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        {isApproving(tutorUserId) ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(tutorUserId)}
                        disabled={isApproving(tutorUserId) || isRejecting(tutorUserId)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        {isRejecting(tutorUserId) ? 'Rejecting…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Recent Platform Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity?.map((activity, idx) => (
              <div key={idx} className="p-4 flex items-center space-x-3 hover:bg-gray-50">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activity.type === 'success' ? 'bg-green-100 text-green-700' :
                  activity.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard