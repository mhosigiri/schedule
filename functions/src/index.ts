/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from 'firebase-functions';
// Remove import since we're not using the database trigger anymore
// import { onValueCreated } from 'firebase-functions/v2/database';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
const cors = require('cors')({ origin: true });

// Initialize Firebase
admin.initializeApp();

// Email credentials
// For v1 and v2 functions compatibility, we check both approaches
const EMAIL_USER = process.env.EMAIL_USER || 'arnisinrakc@gmail.com'; // Default fallback
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'xayf mszh eprc agzz'; // Default fallback

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Verify SMTP connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

/**
 * Firebase Cloud Functions for Schedule App
 * 
 * IMPORTANT: Before using these functions, you need to:
 * 1. Set Firebase environment variables using:
 *    firebase functions:config:set email.user="your-gmail@gmail.com" email.password="your-app-password"
 *    firebase functions:secrets:set EMAIL_USER // For v2 functions
 *    firebase functions:secrets:set EMAIL_PASSWORD // For v2 functions
 * 2. For the app password, follow instructions at https://support.google.com/accounts/answer/185833
 * 3. Redeploy the functions after setting the config values
 */

// Function to send verification email with CORS support
export const sendVerificationEmail = functions.https.onCall((data: any, context) => {
  return new Promise<{success: boolean}>((resolve, reject) => {
    try {
      // Validate the data
      if (!data.email || !data.code) {
        throw new functions.https.HttpsError(
          'invalid-argument', 
          'Email and verification code are required'
        );
      }

      // Create email content
      const mailOptions = {
        from: `"YourWeek" <${EMAIL_USER}>`,
        to: data.email,
        subject: 'Verify Your Email for Arnis YourWeek',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #ff4d4d; text-align: center;">Arnis YourWeek</h1>
            <h2 style="text-align: center;">Verify Your Email</h2>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block;">
                ${data.code}
              </div>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this verification, you can safely ignore this email. <br>
            Thanks,<br>
            Arnis KC</p>
            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
              <p>© ${new Date().getFullYear()} Arnis YourWeek. All rights reserved.</p>
            </div>
          </div>
        `
      };

      // Send the email
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(new functions.https.HttpsError('internal', 'Failed to send verification email'));
        } else {
          resolve({ success: true });
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
      reject(new functions.https.HttpsError('internal', 'Failed to send verification email'));
    }
  });
});

// Add HTTP version with CORS for direct API access
export const sendVerificationEmailHttp = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      const { email, code } = request.body;
      
      // Validate the data
      if (!email || !code) {
        response.status(400).json({ error: 'Email and verification code are required' });
        return;
      }

      // Create email content
      const mailOptions = {
        from: `"YourWeek" <${EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Email for Arnis YourWeek',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h1 style="color: #ff4d4d; text-align: center;">YourWeek</h1>
            <h2 style="text-align: center;">Verify Your Email</h2>
            <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; letter-spacing: 5px; font-weight: bold; padding: 15px; background-color: #f5f5f5; border-radius: 5px; display: inline-block;">
                ${code}
              </div>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this verification, you can safely ignore this email.</p>
            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
              <p>© ${new Date().getFullYear()} YourWeek. All rights reserved.</p>
            </div>
          </div>
        `
      };

      // Send the email
      await transporter.sendMail(mailOptions);
      response.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      response.status(500).json({ error: 'Failed to send verification email' });
    }
  });
});

// Removed the database trigger function to prevent duplicate emails
