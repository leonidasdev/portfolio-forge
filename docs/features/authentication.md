# OAuth Authentication Flow for Portfolio Forge

## Overview

Portfolio Forge uses Supabase OAuth for authentication with support for Google, GitHub, and LinkedIn.

## Flow Diagram

```
1. User clicks "Sign in with [Provider]" on /login
   ↓
2. Redirected to provider's authorization page
   ↓
3. User authorizes the application
   ↓
4. Provider redirects to /auth/callback?code=...
   ↓
5. Backend exchanges code for session
   ↓
6. User profile created/updated
   ↓
7. User redirected to /dashboard (or original URL)
```

## Files

### `/app/(auth)/login/page.tsx`

Client component that displays OAuth buttons for Google, GitHub, and LinkedIn.

**Features:**
- OAuth provider buttons with loading states
- Error handling and display
- Preserves `redirectTo` parameter for post-login redirect
- Minimal UI with basic styling

**Usage:**
```tsx
// Users visit /login to see OAuth options
// After successful auth, redirected to /dashboard or redirectTo URL
```

### `/app/(auth)/callback/route.ts`

Server-side route handler that processes OAuth callbacks.

**Responsibilities:**
- Exchange authorization code for session
- Create user profile if first-time login
- Handle OAuth errors
- Redirect to destination

**Flow:**
1. Receives `code` parameter from OAuth provider
2. Exchanges code for Supabase session
3. Checks if user profile exists
4. Creates profile if new user
5. Redirects to dashboard or original URL

### `/app/(auth)/logout/actions.ts`

Server actions for logging out users.

**Functions:**
- `signOut()` - Signs out and redirects to /login
- `signOutWithoutRedirect()` - Signs out without redirect (for custom flows)

**Usage in components:**
```tsx
'use client'
import { signOut } from '@/app/(auth)/logout/actions'

<button onClick={() => signOut()}>Sign Out</button>
```

### `/app/(auth)/logout/LogoutButton.tsx`

Reusable client component for logout functionality.

**Features:**
- Loading state during logout
- Disabled state to prevent double-clicks
- Minimal styling

**Usage:**
```tsx
import { LogoutButton } from '@/app/(auth)/logout/LogoutButton'

<LogoutButton />
```

### `/app/dashboard/page.tsx` (Updated)

Server component demonstrating session access.

**Features:**
- Reads session using `getSession()`
- Reads user using `getUser()`
- Redirects unauthenticated users to /login
- Displays session expiry time
- Includes logout button

## Configuration

### Supabase Dashboard Setup

1. **Enable OAuth Providers:**
   - Go to Authentication → Providers
   - Enable Google, GitHub, and Azure (for LinkedIn)
   - Configure OAuth credentials

2. **Google OAuth:**
   - Create OAuth 2.0 Client ID in Google Cloud Console
   - Add authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

3. **GitHub OAuth:**
   - Create OAuth App in GitHub Settings
   - Authorization callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

4. **LinkedIn (via Azure):**
   - Register app in Azure Active Directory
   - Configure redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Application ID and Secret to Supabase

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Authentication Patterns

### Reading Session in Server Components

```tsx
import { getSession, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  const user = session.user
  
  return <div>Welcome {user.email}</div>
}
```

### Reading Session in Client Components

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ClientComponent() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const supabase = createBrowserClient(...)
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  if (!user) return <div>Not logged in</div>
  return <div>Welcome {user.email}</div>
}
```

### Logout from Client Component

```tsx
'use client'
import { signOut } from '@/app/(auth)/logout/actions'

export function MyComponent() {
  return (
    <button onClick={() => signOut()}>
      Logout
    </button>
  )
}
```

### Custom Logout (without redirect)

```tsx
'use client'
import { signOutWithoutRedirect } from '@/app/(auth)/logout/actions'
import { useRouter } from 'next/navigation'

export function MyComponent() {
  const router = useRouter()
  
  const handleLogout = async () => {
    const result = await signOutWithoutRedirect()
    if (result.success) {
      router.push('/goodbye')
    }
  }
  
  return <button onClick={handleLogout}>Logout</button>
}
```

## Session Management

### Session Duration

- Default session duration: 1 hour
- Refresh token duration: 30 days
- Sessions are automatically refreshed by middleware

### Session Storage

- Sessions stored in HTTP-only cookies
- Secure flag enabled in production
- SameSite=Lax for CSRF protection

### Session Refresh

Middleware automatically refreshes sessions on each request:
```typescript
// middleware.ts handles refresh automatically
const { data: { user } } = await supabase.auth.getUser()
```

## Security Best Practices

1. **Never expose session tokens:**
   - Use server-side auth checks
   - Don't send tokens to client unnecessarily

2. **Validate sessions on every request:**
   - Middleware handles this automatically
   - Check session in API routes

3. **Use RLS policies:**
   - Database enforces access control
   - Don't rely solely on application-level checks

4. **Secure redirects:**
   - Validate `redirectTo` parameter
   - Only allow internal redirects

5. **Handle expired sessions:**
   - Middleware refreshes automatically
   - Redirect to login on refresh failure

## Troubleshooting

### "No authorization code provided"

- User cancelled OAuth flow
- Provider didn't return code
- Check provider configuration

### "Failed to create session"

- Code already used (replay attack prevention)
- Code expired (usually 10 minutes)
- Retry authentication

### "Profile creation error"

- Database RLS policies may be too strict
- Profile will be created on next login attempt
- Check Supabase logs

### Infinite redirect loops

- Check middleware configuration
- Ensure `/login` is not protected
- Verify callback route is public

## Testing

### Test OAuth Flow Locally

1. Run app locally: `npm run dev`
2. Visit `http://localhost:3000/login`
3. Click OAuth provider button
4. Authorize on provider site
5. Verify redirect to dashboard

### Test Logout

1. From dashboard, click logout button
2. Verify redirect to `/login`
3. Try accessing `/dashboard` directly
4. Should redirect to `/login`

### Test Session Persistence

1. Login successfully
2. Refresh the page
3. Should remain logged in
4. Check session expiry in dashboard

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth 2.0 Flow](https://oauth.net/2/)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
