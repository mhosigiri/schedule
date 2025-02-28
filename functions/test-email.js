/**
 * Simple test script to verify email configuration
 * 
 * Run with: node test-email.js
 */

const nodemailer = require('nodemailer');

// Email credentials (use the same ones from index.ts)
const EMAIL_USER = 'arnisinrakc@gmail.com'; // Replace with your actual email
const EMAIL_PASSWORD = 'xayf mszh eprc agzz'; // Replace with your actual app password

// Who to send the test email to
const TEST_RECIPIENT = 'arnisinrakc@gmail.com'; // Replace with your email or another test email

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Verify SMTP connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log("SMTP server is ready to send emails");
    
    // Create test email
    const mailOptions = {
      from: `"Schedule App Test" <${EMAIL_USER}>`,
      to: TEST_RECIPIENT,
      subject: 'Test Email from Schedule App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #ff4d4d; text-align: center;">Test Email</h1>
          <p>This is a test email from your Schedule App to verify that email sending works correctly.</p>
          <p>If you received this email, your SMTP configuration is working properly!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    // Send the test email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending test email:', error);
      } else {
        console.log('Test email sent successfully!');
        console.log('Response:', info.response);
      }
    });
  }
}); 