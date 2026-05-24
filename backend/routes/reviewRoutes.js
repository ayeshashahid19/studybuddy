const express = require('express');
const { protect } = require('../middleware/auth');
const { createReview, getTutorReviews, getReviewByBooking } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, createReview);
router.get('/tutor/:tutorId', getTutorReviews);
router.get('/booking/:bookingId', protect, getReviewByBooking);

module.exports = router;