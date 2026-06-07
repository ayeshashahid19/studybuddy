const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

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
  const mailOptions = {
    from: `"StudyBuddy Platform" <${process.env.GMAIL_USER}>`,
    to: tutorEmail,
    subject: 'New Session Booking - StudyBuddy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; 
                  margin: 0 auto; padding: 20px;">
        <div style="background-color: #2563eb; padding: 20px; 
                    border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">
            StudyBuddy
          </h1>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; 
                    border: 1px solid #e2e8f0; border-top: none;
                    border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #1e293b;">
            Dear ${tutorName},
          </p>
          <p style="font-size: 15px; color: #374151;">
            A student has booked a session with you on the 
            StudyBuddy platform.
          </p>
          <div style="background-color: white; border: 1px solid #e2e8f0;
                      border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0; 
                        border-bottom: 2px solid #e2e8f0; 
                        padding-bottom: 10px;">
              Booking Details
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold; width: 40%;">
                  Student Name:
                </td>
                <td style="padding: 8px 0; color: #1e293b;">
                  ${studentName}
                </td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold;">
                  Student Email:
                </td>
                <td style="padding: 8px 0; color: #2563eb;">
                  <a href="mailto:${studentEmail}" 
                     style="color: #2563eb;">
                    ${studentEmail}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold;">
                  Student Phone:
                </td>
                <td style="padding: 8px 0; color: #1e293b;">
                  ${studentPhone || 'Not provided'}
                </td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold;">
                  Session Date:
                </td>
                <td style="padding: 8px 0; color: #1e293b;">
                  ${sessionDate}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold;">
                  Session Time:
                </td>
                <td style="padding: 8px 0; color: #1e293b;">
                  ${startTime} to ${endTime}
                </td>
              </tr>
              <tr style="background-color: #f8fafc;">
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold;">
                  Duration:
                </td>
                <td style="padding: 8px 0; color: #1e293b;">
                  ${duration} hour(s)
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; 
                            font-weight: bold;">
                  Total Amount:
                </td>
                <td style="padding: 8px 0; color: #16a34a; 
                            font-weight: bold; font-size: 16px;">
                  $${totalAmount}
                </td>
              </tr>
            </table>
          </div>
          <div style="background-color: #fef3c7; border: 1px solid #fcd34d;
                      border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Action Required:</strong> Please contact the student 
              directly using the email or phone number above to share your 
              Zoom link or meeting details.
            </p>
          </div>
          <p style="color: #6b7280; font-size: 13px; text-align: center;
                    margin-top: 20px; border-top: 1px solid #e2e8f0; 
                    padding-top: 15px;">
            Thank you for using StudyBuddy Platform!
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendTutorBookingNotification };
