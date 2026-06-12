// Architect: SP
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  if (process.env.SEND_OTP_EMAIL === 'false') {
    console.log(`SEND_OTP_EMAIL is false: skipping email send for ${toEmail}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: toEmail,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP');
  }
};

module.exports = { sendOtpEmail };
