const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const TutorProfile = require('../models/TutorProfile');

const getStudentId = (user) => user._id || user.id;

const isUpcomingConfirmed = (booking) => {
  if (booking.status !== 'confirmed') return false;
  const sessionDay = new Date(booking.date);
  sessionDay.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sessionDay >= today;
};

const isPaidBooking = (booking) =>
  (booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid') &&
  booking.status !== 'cancelled' &&
  booking.status !== 'refunded';

// Get student dashboard stats
const getStudentStats = async (req, res) => {
  try {
    const studentId = getStudentId(req.user);

    const bookings = await Booking.find({ studentId })
      .populate('tutorId', 'name email avatar')
      .sort({ date: -1 });

    const completedBookings = bookings.filter((b) => b.status === 'completed');
    const totalHours = completedBookings.reduce((sum, b) => sum + (Number(b.duration) || 0), 0);
    const totalSpent = bookings
      .filter(isPaidBooking)
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

    const upcomingSessions = bookings.filter(isUpcomingConfirmed);

    const pastSessions = bookings.filter(
      (b) =>
        b.status === 'completed' ||
        (b.status === 'confirmed' && !isUpcomingConfirmed(b))
    );

    const reviews = await Review.find({ studentId });

    res.json({
      success: true,
      totalSessions: completedBookings.length,
      totalHours,
      totalSpent,
      upcomingSessions,
      pastSessions,
      reviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student bookings
const getStudentBookings = async (req, res) => {
  try {
    const studentId = getStudentId(req.user);

    const bookings = await Booking.find({ studentId })
      .populate('tutorId', 'name email avatar')
      .sort({ date: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student credits
const getStudentCredits = async (req, res) => {
  try {
    res.json({ creditsRemaining: 0, creditsUsed: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student progress
const getStudentProgress = async (req, res) => {
  try {
    const studentId = getStudentId(req.user);

    const bookings = await Booking.find({
      studentId,
      status: 'completed'
    });
    
    const progress = bookings.map(b => ({
      date: b.date,
      hours: b.duration,
      subject: b.tutorId
    }));
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's reviews
const getMyReviews = async (req, res) => {
  try {
    const studentId = getStudentId(req.user);

    const reviews = await Review.find({ studentId })
      .populate('tutorId', 'name email avatar')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentStats,
  getStudentBookings,
  getStudentCredits,
  getStudentProgress,
  getMyReviews
};