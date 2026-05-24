const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLog');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    
    // If role changed to tutor, create tutor profile
    if (role === 'tutor') {
      const existingProfile = await TutorProfile.findOne({ userId: user._id });
      if (!existingProfile) {
        await TutorProfile.create({
          userId: user._id,
          subject: 'Not specified',
          subjectsOffered: [],
          hourlyRate: 0,
          bio: '',
          experience: 0,
          isApproved: false
        });
      }
    }
    
    res.json({ success: true, user: user.toObject({ getters: true, versionKey: false }) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete associated tutor profile if exists
    await TutorProfile.findOneAndDelete({ userId: user._id });
    
    // Delete associated bookings
    await Booking.deleteMany({ $or: [{ studentId: user._id }, { tutorId: user._id }] });
    
    // Delete associated reviews
    await Review.deleteMany({ $or: [{ studentId: user._id }, { tutorId: user._id }] });
    
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all tutors (for admin)
const getAllTutors = async (req, res) => {
  try {
    const tutors = await TutorProfile.find({})
      .populate('userId', 'name email avatar phoneNumber isActive')
      .sort({ createdAt: -1 });
    
    res.json({ tutors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update tutor by admin
const updateTutor = async (req, res) => {
  try {
    const { subject, subjectsOffered, hourlyRate, bio, experience, education, isApproved } = req.body;
    const tutorProfile = await TutorProfile.findOne({ userId: req.params.id });
    
    if (!tutorProfile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }
    
    if (subject) tutorProfile.subject = subject;
    if (subjectsOffered) tutorProfile.subjectsOffered = subjectsOffered;
    if (hourlyRate) tutorProfile.hourlyRate = hourlyRate;
    if (bio) tutorProfile.bio = bio;
    if (experience !== undefined) tutorProfile.experience = experience;
    if (education) tutorProfile.education = education;
    if (isApproved !== undefined) tutorProfile.isApproved = isApproved;
    
    tutorProfile.updatedAt = Date.now();
    await tutorProfile.save();
    
    res.json({ success: true, tutor: tutorProfile });
  } catch (error) {
    console.error('Update tutor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete tutor
const deleteTutor = async (req, res) => {
  try {
    const tutorProfile = await TutorProfile.findOneAndDelete({ userId: req.params.id });
    if (!tutorProfile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }
    
    // Update user role to student
    await User.findByIdAndUpdate(req.params.id, { role: 'student' });
    
    res.json({ success: true, message: 'Tutor deleted successfully' });
  } catch (error) {
    console.error('Delete tutor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get pending tutors
const getPendingTutors = async (req, res) => {
  try {
    const pendingTutors = await TutorProfile.find({ isApproved: false })
      .populate('userId', 'name email avatar phoneNumber');
    
    const validTutors = pendingTutors.filter(tutor => tutor.userId !== null);
    res.json({ tutors: validTutors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve tutor
const approveTutor = async (req, res) => {
  try {
    const tutorId = req.params.id;
    const profile = await TutorProfile.findOne({ userId: tutorId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }
    
    profile.isApproved = true;
    await profile.save();
    await User.findByIdAndUpdate(tutorId, { isApproved: true });

    await logAudit({
      action: 'update',
      userId: req.user.id,
      targetId: tutorId,
      details: `Tutor approved: ${tutorId}`,
      type: 'success',
      status: 'approved'
    });
    
    res.json({ success: true, message: 'Tutor approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject tutor
const rejectTutor = async (req, res) => {
  try {
    const tutorId = req.params.id;
    await TutorProfile.findOneAndDelete({ userId: tutorId });
    await User.findByIdAndUpdate(tutorId, { role: 'student', isApproved: false });
    
    res.json({ success: true, message: 'Tutor rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get platform stats
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTutors = await User.countDocuments({ role: 'tutor' });
    const activeTutors = await TutorProfile.countDocuments({ isApproved: true });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    const paidBookings = await Booking.find({
      paymentStatus: { $in: ['completed', 'paid'] }
    });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    
    const recentBookings = await Booking.find()
      .populate('studentId', 'name')
      .populate('tutorId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const dayRevenue = paidBookings
        .filter((b) => b.createdAt >= dayStart && b.createdAt <= dayEnd)
        .reduce((sum, b) => sum + b.totalAmount, 0);
      revenueData.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue
      });
    }

    const userDistribution = [
      { name: 'Students', value: totalStudents },
      { name: 'Tutors', value: totalTutors },
      { name: 'Admins', value: await User.countDocuments({ role: 'admin' }) }
    ].filter((item) => item.value > 0);
    
    res.json({
      success: true,
      totalUsers,
      totalStudents,
      totalTutors,
      activeTutors,
      totalBookings,
      completedBookings,
      totalRevenue,
      revenue: totalRevenue,
      recentBookings,
      revenueData,
      userDistribution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('studentId', 'name email')
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const { action, userId, startDate, endDate } = req.query;
    const query = {};

    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const activity = logs.map((log) => ({
      action: log.details || log.action,
      timestamp: log.createdAt.toISOString(),
      type: log.type,
      status: log.status
    }));

    if (activity.length === 0) {
      const recentBookings = await Booking.find()
        .populate('studentId', 'name')
        .populate('tutorId', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

      recentBookings.forEach((booking) => {
        activity.push({
          action: `${booking.studentId?.name || 'Student'} booked a session with ${booking.tutorId?.name || 'Tutor'}`,
          timestamp: booking.createdAt.toISOString(),
          type: booking.status === 'confirmed' ? 'success' : 'info',
          status: booking.status
        });
      });
    }

    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllTutors,
  updateTutor,
  deleteTutor,
  getPendingTutors,
  approveTutor,
  rejectTutor,
  getPlatformStats,
  getAllBookings,
  getAuditLogs,
  getRecentActivity
};