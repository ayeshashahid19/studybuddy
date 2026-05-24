const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const TutorProfile = require('../models/TutorProfile');

// Get student dashboard stats
const getStudentStats = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate('tutorId', 'name email avatar')
      .sort({ date: -1 });
    
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalHours = completedBookings.reduce((sum, b) => sum + b.duration, 0);
    const totalSpent = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    
    const upcomingSessions = bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.date) >= new Date()
    );
    
    const pastSessions = bookings.filter(b => 
      b.status === 'completed' || (b.status === 'confirmed' && new Date(b.date) < new Date())
    );
    
    const reviews = await Review.find({ studentId: req.user.id });
    
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
    const bookings = await Booking.find({ studentId: req.user.id })
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
    const bookings = await Booking.find({ 
      studentId: req.user.id,
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
    const reviews = await Review.find({ studentId: req.user.id })
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