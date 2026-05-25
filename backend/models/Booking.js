const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutorProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TutorProfile'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0.5
  },
  totalAmount: {
    type: Number,
    required: true
  },
  sessionAmount: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentOrderId: {
    type: String
  },
  paymentTransactionId: {
    type: String
  },
  paymentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'stripe', 'credits'],
    default: 'paypal'
  },
  meetingLink: {
    type: String
  },
  studentName: {
    type: String
  },
  studentEmail: {
    type: String
  },
  studentPhone: {
    type: String
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

bookingSchema.index({ studentId: 1, status: 1 });
bookingSchema.index({ tutorId: 1, status: 1 });
bookingSchema.index({ date: 1, tutorId: 1 });

// Generate booking ID before saving
bookingSchema.pre('save', function() {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
  }
});

module.exports = mongoose.model('Booking', bookingSchema);