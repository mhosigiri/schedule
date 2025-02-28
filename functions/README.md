# Firebase Functions for Schedule App

This directory contains the Firebase Cloud Functions used by the Schedule App.

## Setup Instructions

1. Install dependencies:

   ```
   npm install
   ```

2. Update email credentials:

   - Open `src/index.ts`
   - Find the email configuration section
   - Replace `your-email@gmail.com` with your actual Gmail address
   - Replace `your-app-password` with an App Password generated for your Gmail account
     (Follow instructions at https://support.google.com/accounts/answer/185833 to generate an App Password)

3. Build the functions:

   ```
   npm run build
   ```

4. Deploy the functions:
   ```
   firebase deploy --only functions
   ```

## Troubleshooting

### Firebase Realtime Database Errors

If you see errors with the Realtime Database connection (such as XMLHttpRequest errors to `*.firebaseio.com`), make sure:

1. Your Firebase Realtime Database is set up in the Firebase Console
2. Your database rules allow read/write access as needed
3. You're using the correct Firebase project in your application

### Cloud Function 404 Errors

If you see 404 errors when trying to call the cloud functions:

1. Make sure the functions are deployed correctly with `firebase deploy --only functions`
2. Check that you're using the correct function names in your application code
3. Try using the HTTP endpoint fallback provided in `src/services/VerificationService.ts`

### CORS Errors

If you see CORS-related errors when calling the functions:

1. The functions include CORS handling with `origin: true` (allowing all origins)
2. If you need more specific CORS settings, update the CORS configuration in `src/index.ts`

## Available Functions

- `sendVerificationEmail`: A callable function that sends a verification email
- `sendVerificationEmailHttp`: An HTTP endpoint that does the same thing (useful for fallbacks)
- `watchVerificationCodes`: A database trigger that sends an email when a new verification code is created

## Client-Side Integration

The application uses these functions through the `VerificationService.ts` file, which provides methods to:

1. Generate verification codes
2. Store verification codes in the database
3. Send verification emails using the cloud functions
4. Verify user-entered codes
