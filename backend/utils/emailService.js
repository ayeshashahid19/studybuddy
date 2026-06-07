const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendTutorBookingNotification = async ({
  tutorEmail,
  tutorName,
  studentName,
  studentEmail,
  studentPhone,
  sessionDate,
  startTime,
  endTime,
  duration,
  totalAmount
}) => {
  try {
    await resend.emails.send({
      from: 'StudyBuddy <notifications@studybuddy.resend.dev>',
      to: tutorEmail,
      subject: 'New Session Booking - StudyBuddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;
                    margin: 0 auto; padding: 20px;
                    border: 1px solid #e5e7eb; border-radius: 8px;">

          <div style="background: #1e3a5f; padding: 20px;
                      border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">
              StudyBuddy
            </h1>
            <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 14px;">
              New Booking Notification
            </p>
          </div>

          <div style="padding: 24px; background: #ffffff;">
            <p style="font-size: 16px; color: #1f2937;">
              Dear <strong>${tutorName}</strong>,
            </p>
            <p style="font-size: 15px; color: #1f2937; line-height: 1.6;">
              A student has booked a session with you on the
              <strong>StudyBuddy</strong> platform.
            </p>

            <div style="background: #f0f4ff; border-radius: 8px;
                        padding: 20px; margin: 20px 0;
                        border-left: 4px solid #2563eb;">
              <h3 style="color: #1e3a5f; margin: 0 0 16px 0;
                          font-size: 16px;">
                Booking Details
              </h3>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;
                              font-size: 14px; width: 40%;">
                    Student Name:
                  </td>
                  <td style="padding: 8px 0; color: #1f2937;
                              font-size: 14px; font-weight: bold;">
                    ${studentName}
                  </td>
                </tr>
                <tr style="background: #e8eeff;">
                  <td style="padding: 8px; color: #6b7280; font-size: 14px;">
                    Student Email:
                  </td>
                  <td style="padding: 8px; color: #2563eb; font-size: 14px;">
                    <a href="mailto:${studentEmail}"
                       style="color: #2563eb;">${studentEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    Student Phone:
                  </td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">
                    ${studentPhone || 'Not provided'}
                  </td>
                </tr>
                <tr style="background: #e8eeff;">
                  <td style="padding: 8px; color: #6b7280; font-size: 14px;">
                    Session Date:
                  </td>
                  <td style="padding: 8px; color: #1f2937;
                              font-size: 14px; font-weight: bold;">
                    ${sessionDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    Session Time:
                  </td>
                  <td style="padding: 8px 0; color: #1f2937;
                              font-size: 14px; font-weight: bold;">
                    ${startTime} to ${endTime}
                  </td>
                </tr>
                <tr style="background: #e8eeff;">
                  <td style="padding: 8px; color: #6b7280; font-size: 14px;">
                    Duration:
                  </td>
                  <td style="padding: 8px; color: #1f2937; font-size: 14px;">
                    ${duration} hour(s)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                    Total Amount:
                  </td>
                  <td style="padding: 8px 0; color: #16a34a;
                              font-size: 16px; font-weight: bold;">
                    $${totalAmount}
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #fef3c7; border-radius: 8px;
                        padding: 16px; margin: 16px 0;
                        border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; margin: 0;
                         line-height: 1.6;">
                <strong>Action Required:</strong> Please contact the student
                directly using the email or phone number above to share your
                Zoom link or meeting details.
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
              Thank you for using <strong>StudyBuddy Platform</strong>!
            </p>
          </div>

          <div style="background: #f9fafb; padding: 16px;
                      border-radius: 0 0 8px 8px; text-align: center;
                      border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is an automated notification from StudyBuddy.
              Please do not reply to this email.
            </p>
          </div>

        </div>
      `
    });
    console.log('Tutor booking notification email sent to:', tutorEmail);
  } catch (error) {
    console.error('Email send error:', error);
    // Do NOT throw — email failure should not break the booking
  }
};

module.exports = { sendTutorBookingNotification };
