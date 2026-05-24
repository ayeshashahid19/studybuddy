const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createOrUpdateProfile,
  getProfile,
  getAllTutors,
  getTutorStats
} = require('../controllers/tutorController');

const router = express.Router();

// Public routes (with auth)
router.get('/search', protect, getAllTutors);
router.get('/stats', protect, authorize('tutor'), getTutorStats);

// Profile routes - separate routes instead of optional parameter
router.get('/profile/me', protect, authorize('tutor'), getProfile);
router.get('/profile/:id', protect, getProfile);
router.post('/profile', protect, authorize('tutor'), createOrUpdateProfile);
router.put('/profile', protect, authorize('tutor'), createOrUpdateProfile);

module.exports = router;