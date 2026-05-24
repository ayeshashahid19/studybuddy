const generateMeetingLink = (booking) => {
  const meetingId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const passcode = Math.random().toString(36).substring(2, 10);
  return `https://zoom.us/j/${meetingId}?pwd=${passcode}&booking=${booking.bookingId || booking._id}`;
};

module.exports = { generateMeetingLink };
