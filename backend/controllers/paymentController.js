const Booking = require('../models/Booking');
const { generateMeetingLink } = require('../utils/meetingLink');
const { emitToUser } = require('../utils/socket');
const { logAudit } = require('../utils/auditLog');
const { getBookingPlatformFee } = require('../utils/platformFee');

const DECLINE_CARD = '4000000000000002';

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    if (!/^[a-f\d]{24}$/i.test(bookingId)) {
      return res.status(400).json({ success: false, message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is not pending payment' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    const orderId = `MOCK-ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    booking.paymentOrderId = orderId;
    await booking.save();

    res.json({
      success: true,
      data: {
        orderId,
        amount: booking.totalAmount,
        currency: 'USD',
        bookingId: booking._id
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const captureOrder = async (req, res) => {
  try {
    const { orderId, cardNumber } = req.body;

    if (!orderId || !cardNumber) {
      return res.status(400).json({ success: false, message: 'Order ID and card number are required' });
    }

    const sanitizedCard = cardNumber.replace(/\s/g, '');

    if (!/^\d{16}$/.test(sanitizedCard)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 16-digit card number'
      });
    }

    if (sanitizedCard === DECLINE_CARD) {
      await logAudit({
        action: 'payment',
        userId: req.user.id,
        targetId: orderId,
        details: 'Payment declined (test card)',
        type: 'error',
        status: 'declined'
      });
      return res.status(400).json({ success: false, message: 'Payment declined. Please try another card.' });
    }

    const booking = await Booking.findOne({ paymentOrderId: orderId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already captured' });
    }

    booking.paymentStatus = 'completed';
    booking.status = 'confirmed';
    booking.paymentTransactionId = `MOCK-TXN-${Date.now()}`;
    booking.meetingLink = generateMeetingLink(booking);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('studentId', 'name email phoneNumber')
      .populate('tutorId', 'name email');

    await logAudit({
      action: 'payment',
      userId: req.user.id,
      targetId: booking._id.toString(),
      details: `Payment of $${booking.totalAmount} captured for booking ${booking.bookingId} (platform fee: $${getBookingPlatformFee(booking)})`,
      type: 'success',
      status: 'paid'
    });

    emitToUser(booking.tutorId.toString(), 'booking:confirmed', {
      booking: populatedBooking,
      message: 'New session booked and paid'
    });

    emitToUser(booking.studentId.toString(), 'booking:confirmed', {
      booking: populatedBooking,
      message: 'Your booking is confirmed'
    });

    res.json({
      success: true,
      data: {
        booking: populatedBooking,
        transactionId: booking.paymentTransactionId,
        meetingLink: booking.meetingLink
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, captureOrder };
