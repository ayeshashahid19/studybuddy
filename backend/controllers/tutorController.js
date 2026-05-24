const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// Create or update tutor profile
const createOrUpdateProfile = async (req, res) => {
  try {
    const { subject, subjectsOffered, hourlyRate, bio, experience, education } = req.body;
    
    console.log('Creating/updating profile for user:', req.user.id);
    
    let profile = await TutorProfile.findOne({ userId: req.user.id });
    
    // Parse subjectsOffered if it's a string
    let parsedSubjects = subjectsOffered;
    if (typeof subjectsOffered === 'string') {
      try {
        parsedSubjects = JSON.parse(subjectsOffered);
      } catch (e) {
        parsedSubjects = [];
      }
    }
    
    // Handle avatar upload
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
      await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });
    }
    
    if (profile) {
      profile.subject = subject;
      profile.subjectsOffered = parsedSubjects;
      profile.hourlyRate = hourlyRate;
      profile.bio = bio;
      profile.experience = experience;
      profile.education = education;
      profile.updatedAt = Date.now();
      await profile.save();
    } else {
      profile = await TutorProfile.create({
        userId: req.user.id,
        subject,
        subjectsOffered: parsedSubjects,
        hourlyRate,
        bio,
        experience,
        education,
        isApproved: false
      });
    }
    
    res.json({ success: true, profile, avatar: avatarUrl });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get tutor profile
const getProfile = async (req, res) => {
  try {
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = req.user.id;
    }
    
    const profile = await TutorProfile.findOne({ userId })
      .populate('userId', 'name email avatar phoneNumber');
    
    if (!profile) {
      return res.status(404).json({ message: 'Tutor profile not found' });
    }
    
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tutors with filters
const getAllTutors = async (req, res) => {
  try {
    const { subject, minPrice, maxPrice, minRating, search } = req.query;
    
    let query = { isApproved: true };
    
    if (subject && subject !== '') {
      query.subject = { $regex: subject, $options: 'i' };
    }
    if (minPrice) {
      query.hourlyRate = { $gte: parseInt(minPrice) };
    }
    if (maxPrice) {
      query.hourlyRate = { ...query.hourlyRate, $lte: parseInt(maxPrice) };
    }
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    let tutors = await TutorProfile.find(query)
      .populate('userId', 'name email avatar phoneNumber');
    
    tutors = tutors.filter(tutor => tutor.userId !== null);
    
    if (search && search !== '') {
      tutors = tutors.filter(tutor => 
        tutor.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        tutor.subject?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({ tutors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tutor dashboard stats with students and sessions
const getTutorStats = async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ userId: req.user.id });
    
    // Get all bookings for this tutor
    const allBookings = await Booking.find({ tutorId: req.user.id })
      .populate('studentId', 'name email avatar phoneNumber')
      .sort({ date: -1 });
    
    // Calculate stats
    const completedBookings = allBookings.filter(b => b.status === 'completed');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalSessions = allBookings.length;
    const completedSessions = completedBookings.length;
    
    // Get unique students
    const uniqueStudents = [...new Map(allBookings.map(b => [b.studentId?._id?.toString(), b.studentId])).values()];
    const totalStudents = uniqueStudents.filter(s => s).length;
    
    // Get upcoming sessions
    const upcomingSessions = allBookings.filter(b => 
      b.status === 'confirmed' && new Date(b.date) >= new Date()
    );
    
    // Get past sessions (history)
    const pastSessions = allBookings.filter(b => 
      b.status === 'completed' || (b.status === 'confirmed' && new Date(b.date) < new Date())
    );
    
    // Get reviews
    const reviews = await Review.find({ tutorId: req.user.id })
      .populate('studentId', 'name avatar');
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : profile?.rating || 0;
    
    res.json({
      totalEarnings,
      totalSessions,
      completedSessions,
      rating: averageRating,
      totalStudents,
      upcomingSessions,
      pastSessions,
      allBookings,
      reviews,
      profile
    });
  } catch (error) {
    console.error('Get tutor stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  getAllTutors,
  getTutorStats
};