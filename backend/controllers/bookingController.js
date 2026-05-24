const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const { emitToUser } = require('../utils/socket');

const generateTimeSlots = () => {
  const slots = [];
  const startHours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  for (const hour of startHours) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
};

const getAvailableSlots = async (req, res) => {
  try {
    const { tutorId, date } = req.query;

    if (!tutorId || !date) {
      return res.status(400).json({ success: false, message: 'Tutor ID and date are required' });
    }

    const allSlots = generateTimeSlots();

    const bookings = await Booking.find({
      tutorId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedSlots = bookings.map((b) => b.startTime);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({ success: true, slots: availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { tutorId, date, startTime, duration, totalAmount, studentPhone, studentEmail, studentName } = req.body;

    if (!tutorId || !date || !startTime || !duration || totalAmount == null) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    const tutorProfile = await TutorProfile.findOne({ userId: tutorId, isApproved: true });
    if (!tutorProfile) {
      return res.status(400).json({ success: false, message: 'Tutor is not available for booking' });
    }

    const existingBooking = await Booking.findOne({
      tutorId,
      date: new Date(date),
      startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    const [hour, minute] = startTime.split(':');
    const endHour = parseInt(hour, 10) + parseInt(duration, 10);
    const endTime = `${endHour}:${minute}`;

    const booking = await Booking.create({
      studentId: req.user.id,
      tutorId,
      tutorProfileId: tutorProfile._id,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      totalAmount,
      studentName: studentName || req.user.name,
      studentEmail: studentEmail || req.user.email,
      studentPhone: studentPhone || '',
      paymentStatus: 'pending',
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('studentId', 'name email phoneNumber')
      .populate('tutorId', 'name email phoneNumber');

    await logAudit({
      action: 'booking',
      userId: req.user.id,
      targetId: booking._id.toString(),
      details: `Booking created for ${date} at ${startTime}`,
      type: 'info',
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: { booking: populatedBooking }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate('tutorId', 'name email avatar phoneNumber')
      .sort({ date: -1 });

    const upcoming = bookings.filter(
      (b) => b.status === 'confirmed' && new Date(b.date) >= new Date()
    );
    const past = bookings.filter(
      (b) => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.date) < new Date())
    );

    res.json({ success: true, upcoming, past, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTutorBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tutorId: req.user.id })
      .populate('studentId', 'name email phoneNumber avatar')
      .sort({ date: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.user.id && booking.tutorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await logAudit({
      action: 'booking',
      userId: req.user.id,
      targetId: booking._id.toString(),
      details: 'Booking cancelled',
      type: 'warning',
      status: 'cancelled'
    });

    emitToUser(booking.studentId.toString(), 'booking:cancelled', { bookingId: booking._id });
    emitToUser(booking.tutorId.toString(), 'booking:cancelled', { bookingId: booking._id });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.tutorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Only confirmed bookings can be completed' });
    }

    booking.status = 'completed';
    await booking.save();

    await logAudit({
      action: 'booking',
      userId: req.user.id,
      targetId: booking._id.toString(),
      details: 'Session marked as completed',
      type: 'success',
      status: 'completed'
    });

    emitToUser(booking.studentId.toString(), 'booking:completed', {
      bookingId: booking._id,
      message: 'Your session has been marked complete. You can now leave a review.'
    });

    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getStudentBookings,
  getTutorBookings,
  cancelBooking,
  completeBooking
};
