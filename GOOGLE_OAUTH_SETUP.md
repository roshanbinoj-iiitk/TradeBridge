# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for TradeBridge.

## Prerequisites

- A Google Cloud Platform (GCP) account
- Access to your Supabase project dashboard

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)
4. Go to "Credentials" in the sidebar
5. Click "Create Credentials" > "OAuth client ID"
6. Choose "Web application" as the application type
7. Add the following to "Authorized redirect URIs":

   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```

   Replace `your-project-ref` with your actual Supabase project reference.

8. Note down your Client ID and Client Secret

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to Authentication > Providers
3. Find "Google" in the list and click to configure
4. Enable the Google provider
5. Enter your Google OAuth Client ID and Client Secret from Step 1
6. Set the redirect URL to: `https://your-project-ref.supabase.co/auth/v1/callback`

## Step 3: Update Your Application

The Google OAuth integration is already implemented in your application. No additional environment variables are needed as the configuration is handled entirely through Supabase.

### Features Included:

- **Login with Google**: Users can sign in using their Google account
- **Signup with Google**: New users can create accounts using Google
- **Automatic Profile Creation**: When users sign up with Google, a profile is automatically created in your users table
- **Redirect Handling**: Users are redirected to their intended destination after authentication
- **Error Handling**: Proper error messages for failed authentication attempts

## Testing

1. Make sure your Google OAuth credentials are properly configured
2. Ensure your Supabase project has the Google provider enabled
3. Test the login and signup flows in your application
4. Verify that user profiles are created correctly in your database

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Cloud Console exactly matches your Supabase callback URL
2. **"invalid_client" error**:
   - Verify your Client ID and Client Secret are correctly entered in Supabase
3. **Users not appearing in users table**:
   - Check the OAuth callback handler is working correctly
   - Verify your database permissions allow inserts to the users table

### Debug Steps:

1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check Supabase logs for authentication errors
4. Ensure your OAuth callback route is accessible

## Security Notes

- Never expose your Google Client Secret in client-side code
- The Client Secret should only be configured in your Supabase dashboard
- Always use HTTPS in production
- Regularly rotate your OAuth credentials
