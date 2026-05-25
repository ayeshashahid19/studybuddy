const PLATFORM_FEE_RATE = 0.1;

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

const calculateBookingTotal = (sessionAmount) => {
  const subtotal = roundMoney(sessionAmount);
  const platformFee = roundMoney(subtotal * PLATFORM_FEE_RATE);
  const totalAmount = roundMoney(subtotal + platformFee);

  return { sessionAmount: subtotal, platformFee, totalAmount };
};

const getBookingPlatformFee = (booking) => {
  if (booking.platformFee != null && booking.platformFee > 0) {
    return roundMoney(booking.platformFee);
  }
  if (booking.sessionAmount != null && booking.sessionAmount > 0) {
    return roundMoney(booking.sessionAmount * PLATFORM_FEE_RATE);
  }
  return roundMoney(booking.totalAmount * PLATFORM_FEE_RATE);
};

const getBookingSessionAmount = (booking) => {
  if (booking.sessionAmount != null && booking.sessionAmount > 0) {
    return roundMoney(booking.sessionAmount);
  }
  if (booking.platformFee != null && booking.platformFee > 0) {
    return roundMoney(booking.totalAmount - booking.platformFee);
  }
  return roundMoney(booking.totalAmount);
};

module.exports = {
  PLATFORM_FEE_RATE,
  PLATFORM_FEE_PERCENT: 10,
  roundMoney,
  calculateBookingTotal,
  getBookingPlatformFee,
  getBookingSessionAmount,
};
