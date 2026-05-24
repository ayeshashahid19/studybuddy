const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAvailableSlots,
  createBooking,
  getStudentBookings,
  getTutorBookings,
  cancelBooking,
  completeBooking
} = require('../controllers/bookingController');

const router = express.Router();

router.get('/available-slots', protect, getAvailableSlots);
router.post('/', protect, authorize('student'), createBooking);
router.get('/student', protect, authorize('student'), getStudentBookings);
router.get('/tutor', protect, authorize('tutor'), getTutorBookings);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/complete', protect, authorize('tutor'), completeBooking);

module.exports = router;
