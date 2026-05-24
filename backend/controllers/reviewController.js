const Review = require('../models/Review');
const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');

// Create review
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    
    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }
    
    // Check if user is the student
    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Already reviewed this session' });
    }
    
    const review = await Review.create({
      bookingId,
      studentId: req.user.id,
      tutorId: booking.tutorId,
      rating,
      comment
    });
    
    // Update booking to mark as reviewed
    booking.isReviewed = true;
    await booking.save();
    
    // Update tutor rating
    const reviews = await Review.find({ tutorId: booking.tutorId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await TutorProfile.findOneAndUpdate(
      { userId: booking.tutorId },
      { rating: averageRating, totalReviews: reviews.length }
    );
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tutor reviews
const getTutorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tutorId: req.params.tutorId })
      .populate('studentId', 'name avatar')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get review by booking
const getReviewByBooking = async (req, res) => {
  try {
    const review = await Review.findOne({ bookingId: req.params.bookingId });
    res.json({ review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getTutorReviews,
  getReviewByBooking
};