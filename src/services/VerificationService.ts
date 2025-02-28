import { database } from '../firebase';
import { ref, set, get, remove } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { connectFunctionsEmulator } from 'firebase/functions';

class VerificationService {
  // Generate a random 6-digit code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store verification code in database
  async storeVerificationCode(email: string, code: string): Promise<void> {
    try {
      const verificationRef = ref(database, `verifications/${this.hashEmail(email)}`);
      
      // Store code with expiration (15 minutes from now)
      await set(verificationRef, {
        code,
        email,
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
      });
    } catch (error) {
      console.error("Error storing verification code:", error);
      throw error;
    }
  }

  // Verify the code
  async verifyCode(email: string, userEnteredCode: string): Promise<boolean> {
    try {
      const verificationRef = ref(database, `verifications/${this.hashEmail(email)}`);
      const snapshot = await get(verificationRef);
      
      if (!snapshot.exists()) {
        return false;
      }
      
      const data = snapshot.val();
      
      // Check if code is expired
      if (data.expiresAt < Date.now()) {
        await this.removeVerificationCode(email);
        return false;
      }
      
      // Check if code matches
      if (data.code === userEnteredCode) {
        await this.removeVerificationCode(email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error verifying code:", error);
      return false;
    }
  }
  
  // Remove verification code after use
  async removeVerificationCode(email: string): Promise<void> {
    try {
      const verificationRef = ref(database, `verifications/${this.hashEmail(email)}`);
      await remove(verificationRef);
    } catch (error) {
      console.error("Error removing verification code:", error);
    }
  }
  
  // Simple hash function for email to use as key
  private hashEmail(email: string): string {
    // Simple encoding that works in browsers
    return btoa(email).replace(/[/+=]/g, '_');
  }
  
  // Send verification email using Firebase Cloud Function
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      console.log(`Sending verification code ${code} to ${email}`);
      
      // Get Firebase Functions instance with the correct region
      const functions = getFunctions();
      
      // Explicitly set the region to us-central1 (Firebase's default region)
      // connectFunctionsEmulator(functions, "localhost", 5001); // Uncomment for local testing
      
      // Create callable function
      const sendEmail = httpsCallable(functions, 'sendVerificationEmail');
      
      // Call the function with correct parameters
      const result = await sendEmail({ email, code });
      console.log('Email sent successfully:', result);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }
  
  // Alternative method using the HTTP endpoint (use this if the callable function doesn't work)
  async sendVerificationEmailHttp(email: string, code: string): Promise<void> {
    try {
      console.log(`Sending verification code ${code} to ${email} via HTTP endpoint`);
      
      const response = await fetch('https://us-central1-schedule-kc.cloudfunctions.net/sendVerificationEmailHttp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Email sent successfully via HTTP:', result);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error sending verification email via HTTP:", error);
      throw error;
    }
  }

  /**
   * Send email with fallback - uses multiple methods to ensure email delivery
   * This method doesn't throw errors if any method succeeds
   * @param email The recipient's email
   * @param code The verification code
   * @returns A promise that resolves when any method succeeds
   */
  async sendEmailWithFallback(email: string, code: string): Promise<boolean> {
    // Track if any method succeeded
    let anyMethodSucceeded = false;
    let lastError = null;

    // Try the callable function first (silent errors)
    try {
      await this.sendVerificationEmail(email, code);
      console.log('✅ Email sent successfully using callable function');
      anyMethodSucceeded = true;
    } catch (error) {
      // Just store the error but don't log it yet
      lastError = error;
      
      // Try the HTTP endpoint as fallback
      try {
        await this.sendVerificationEmailHttp(email, code);
        console.log('✅ Email sent successfully using HTTP endpoint fallback');
        anyMethodSucceeded = true;
      } catch (httpError) {
        // Store this error too
        lastError = httpError;
      }
    }

    // Only log errors if all methods failed
    if (!anyMethodSucceeded && lastError) {
      console.error('❌ All email sending methods failed:', lastError);
      // Return false to indicate failure
      return false;
    }

    // Return true to indicate at least one method succeeded
    return true;
  }
}

export const verificationService = new VerificationService(); 