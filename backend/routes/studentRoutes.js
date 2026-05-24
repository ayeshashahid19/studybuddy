const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getStudentStats,
  getStudentBookings,
  getStudentCredits
} = require('../controllers/studentController');

const router = express.Router();

router.use(protect, authorize('student'));

router.get('/stats', getStudentStats);
router.get('/sessions', getStudentBookings);
router.get('/credits', getStudentCredits);

module.exports = router;
