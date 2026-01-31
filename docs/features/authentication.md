# Authentication

This document covers authentication in Portfolio Forge, including OAuth flows, session utilities, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [OAuth Flow](#oauth-flow)
3. [Session Utilities](#session-utilities)
4. [Usage Patterns](#usage-patterns)
5. [Configuration](#configuration)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Portfolio Forge uses **Supabase Auth** for authentication with support for:
- Email/Password authentication
- OAuth providers (Google, GitHub, LinkedIn)
- Session management with automatic refresh
- Row-Level Security (RLS) integration

---

## OAuth Flow

```
1. User clicks "Sign in with [Provider]" on /auth/login
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

---

## Key Files

| File | Purpose |
|------|---------|
| `/app/auth/login/page.tsx` | Login page with OAuth buttons |
| `/app/auth/signup/page.tsx` | User registration |
| `/app/auth/callback/route.ts` | OAuth callback handler |
| `/lib/auth/index.ts` | Session utilities |
| `/lib/supabase/server.ts` | Supabase server client |
| `/middleware.ts` | Route protection |

---

## Session Utilities

The `lib/auth/` module provides type-safe session access with optional automatic redirects.

### API Reference

#### `getAuthSession()`

Returns the current authenticated session or null. Does NOT redirect.

```typescript
import { getAuthSession } from '@/lib/auth'

export default async function OptionalAuthPage() {
  const session = await getAuthSession()

  if (!session) {
    return <div>Public content</div>
  }

  return <div>Private content for {session.user.email}</div>
}
```

#### `getAuthUser()`

Returns just the user object from the session.

```typescript
import { getAuthUser } from '@/lib/auth'

const user = await getAuthUser() // User | null
```

#### `isAuthenticated()`

Returns boolean indicating if user is authenticated.

```typescript
import { isAuthenticated } from '@/lib/auth'

const authenticated = await isAuthenticated() // boolean
```

#### `requireSession(redirectTo?)`

Requires authentication. Redirects to `/auth/login` if not authenticated.

```typescript
import { requireSession } from '@/lib/auth'

export default async function ProtectedPage() {
  // Automatically redirects if not authenticated
  const session = await requireSession()

  return <div>Welcome {session.user.email}</div>
}
```

#### `requireUser()`

Requires authentication. Returns just the user object.

```typescript
import { requireUser } from '@/lib/auth'

const user = await requireUser() // User (guaranteed)
```

#### `requireUserId()`

Most concise - returns just the user ID.

```typescript
import { requireUserId } from '@/lib/auth'

const userId = await requireUserId() // string (UUID)
```

---

## Usage Patterns

### Pattern 1: Optional Authentication

```typescript
import { getAuthSession } from '@/lib/auth'

export default async function OptionalAuthPage() {
  const session = await getAuthSession()

  if (!session) {
    return <div>Public content - not logged in</div>
  }

  return <div>Private content for {session.user.email}</div>
}
```

### Pattern 2: Required Authentication

```typescript
import { requireSession } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await requireSession()
  return <div>Welcome {session.user.email}</div>
}
```

### Pattern 3: Using User ID for Database Queries

```typescript
import { requireUserId } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export default async function UserDataPage() {
  const userId = await requireUserId()
  const supabase = await createServerClient()

  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)

  return <div>{/* Render data */}</div>
}
```

### Pattern 4: Client Components

```tsx
'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ClientComponent() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

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

### Pattern 5: Route Handlers

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId()
    const supabase = await createServerClient()

    const { data } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### Pattern 6: Server Actions

```typescript
'use server'

import { requireUserId } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const userId = await requireUserId()
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.get('full_name'),
      headline: formData.get('headline'),
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
```

---

## Configuration

### Supabase Dashboard Setup

1. **Enable OAuth Providers:**
   - Go to Authentication → Providers
   - Enable Google, GitHub, and Azure (for LinkedIn)
   - Configure OAuth credentials

2. **Google OAuth:**
   - Create OAuth 2.0 Client ID in Google Cloud Console
   - Add redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

3. **GitHub OAuth:**
   - Create OAuth App in GitHub Settings
   - Callback URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret to Supabase

4. **Configure Redirect URLs:**
   - Add your app URL to Site URL: `https://your-app.com`
   - Add redirect URLs: `https://your-app.com/auth/callback`

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Middleware Integration

The auth utilities work with the middleware for double protection:

1. **Middleware** - First line of defense
   - Protects `/dashboard/*` routes
   - Protects `/api/v1/*` routes (except public endpoints)
   - Redirects unauthenticated users
   - Refreshes sessions automatically

2. **Session Utilities** - Second line of defense
   - Use in Server Components for additional checks
   - Use in Route Handlers for API authentication
   - Provides type-safe session access
   - Enables custom redirect logic

---

## Security Best Practices

1. **Never expose session tokens** - Use server-side auth checks
2. **Validate sessions on every request** - Middleware handles this automatically
3. **Use RLS policies** - Database enforces access control
4. **Secure redirects** - Validate `redirectTo` parameter, only allow internal redirects
5. **Handle expired sessions** - Middleware refreshes automatically
6. **Don't catch redirect errors** - Let Next.js handle them

### Session Management

- Default session duration: 1 hour
- Refresh token duration: 30 days
- Sessions stored in HTTP-only cookies
- Secure flag enabled in production
- SameSite=Lax for CSRF protection

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "No authorization code provided" | User cancelled OAuth flow or provider configuration issue |
| "Failed to create session" | Code already used or expired (10 min timeout) |
| "Profile creation error" | Check database RLS policies |
| Infinite redirect loops | Ensure `/auth/login` is not protected in middleware |
| "redirect() called outside of render" | Don't catch redirect errors, call `requireSession()` early |

### Type Errors

Import types from `@supabase/supabase-js`:

```typescript
import type { Session, User } from '@supabase/supabase-js'
```

### Testing Locally

1. Run app: `npm run dev`
2. Visit `http://localhost:3000/auth/login`
3. Click OAuth provider button
4. Authorize on provider site
5. Verify redirect to dashboard

---

## Related Documentation

- [Middleware Documentation](middleware.md)
- [Supabase Client](supabase-client.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
