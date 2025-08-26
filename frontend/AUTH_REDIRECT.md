# Authentication Redirect System

This system ensures that users who try to access protected pages while not logged in are redirected back to their intended page after successful login, instead of always going to the dashboard.

## How it works

### 1. Client-side Hook (`useAuthRedirect`)

- Automatically redirects unauthenticated users to `/login`
- Stores the current page URL in `localStorage` as `redirectAfterLogin`
- Used in protected pages like `/products`, `/profile`, `/messages`, `/dashboard`

### 2. Server-side Middleware

- Handles authentication redirects at the server level
- Protects routes before they even load on the client
- Adds redirect URL as query parameter: `/login?redirectTo=/products`

### 3. Login Page Enhancement

- Checks for redirect URL in query parameters and localStorage
- After successful login, redirects to the intended page
- Falls back to `/dashboard` if no redirect URL is available

### 4. Signup Page Enhancement

- Redirects to login page after successful signup
- Preserves any stored redirect URL for seamless flow

## Protected Routes

- `/dashboard`
- `/profile`
- `/products`
- `/products/new`
- `/messages`
- `/borrower`
- `/lender`

## Usage Example

1. User visits `/products` without being logged in
2. System stores `/products` in localStorage
3. User is redirected to `/login?redirectTo=/products`
4. User logs in successfully
5. User is redirected to `/products` instead of `/dashboard`

## Implementation Files

- `/hooks/use-auth-redirect.ts` - Reusable authentication hook
- `/middleware.ts` - Server-side route protection
- `/app/login/page.tsx` - Enhanced login with redirect support
- `/app/signup/page.tsx` - Enhanced signup with redirect support
- Protected pages updated to use the hook

This provides a much better user experience by maintaining the user's intended navigation flow.
