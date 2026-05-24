const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Tutor management
router.get('/tutors', getAllTutors);
router.put('/tutors/:id', updateTutor);
router.delete('/tutors/:id', deleteTutor);

// Tutor approval
router.get('/pending-tutors', getPendingTutors);
router.post('/approve-tutor/:id', approveTutor);
router.post('/reject-tutor/:id', rejectTutor);

// Stats and analytics
router.get('/stats', getPlatformStats);
router.get('/bookings', getAllBookings);
router.get('/audit-logs', getAuditLogs);
router.get('/recent-activity', getRecentActivity);

module.exports = router;