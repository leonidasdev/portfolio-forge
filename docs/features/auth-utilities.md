# Authentication Utilities for Portfolio Forge

This directory contains reusable session-handling utilities for Next.js App Router and Supabase.

## Overview

These utilities provide a clean, consistent way to handle authentication in Server Components, Server Actions, and Route Handlers. They wrap the Supabase server client and provide type-safe session access with optional automatic redirects.

## Files

- **getSession.ts** - Read authenticated sessions (no redirect)
- **requireSession.ts** - Enforce authentication (auto-redirect)
- **index.ts** - Barrel export for convenience imports

## Usage Patterns

### Pattern 1: Optional Authentication (getAuthSession)

Use when authentication is optional and you want custom handling:

```tsx
import { getAuthSession } from '@/lib/auth'

export default async function OptionalAuthPage() {
  const session = await getAuthSession()
  
  if (!session) {
    return <div>Public content - not logged in</div>
  }
  
  return <div>Private content for {session.user.email}</div>
}
```

### Pattern 2: Required Authentication (requireSession)

Use when authentication is required and you want automatic redirect:

```tsx
import { requireSession } from '@/lib/auth'

export default async function ProtectedPage() {
  // Automatically redirects to /login if not authenticated
  const session = await requireSession()
  
  // If we reach here, user is authenticated
  return <div>Welcome {session.user.email}</div>
}
```

### Pattern 3: Just Need User ID (requireUserId)

Most concise when you only need the user ID:

```tsx
import { requireUserId } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export default async function UserDataPage() {
  const userId = await requireUserId()
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return <div>Profile data for {userId}</div>
}
```

### Pattern 4: Just Need User Object (requireUser)

When you need user metadata but not the full session:

```tsx
import { requireUser } from '@/lib/auth'

export default async function ProfilePage() {
  const user = await requireUser()
  
  return (
    <div>
      <h1>{user.email}</h1>
      <p>{user.user_metadata.full_name}</p>
    </div>
  )
}
```

### Pattern 5: Boolean Check (isAuthenticated)

Simple boolean check without fetching session details:

```tsx
import { isAuthenticated } from '@/lib/auth'

export default async function ConditionalPage() {
  const authenticated = await isAuthenticated()
  
  return (
    <div>
      {authenticated ? (
        <div>Authenticated content</div>
      ) : (
        <div>Public content</div>
      )}
    </div>
  )
}
```

## API Reference

### getAuthSession()

```typescript
function getAuthSession(): Promise<Session | null>
```

Returns the current authenticated session or null.

**Returns:**
- `Session` - Full session object with user, tokens, and metadata
- `null` - No active session

**Does NOT redirect** - You must handle unauthenticated users manually.

### getAuthUser()

```typescript
function getAuthUser(): Promise<User | null>
```

Convenience helper that returns just the user object from the session.

**Returns:**
- `User` - User object with id, email, metadata, etc.
- `null` - No active session

### isAuthenticated()

```typescript
function isAuthenticated(): Promise<boolean>
```

Returns boolean indicating if user is authenticated.

**Returns:**
- `true` - User has active session
- `false` - No active session

### requireSession(redirectTo?)

```typescript
function requireSession(redirectTo?: string): Promise<Session>
```

Requires authentication. Redirects to `/login` if not authenticated.

**Parameters:**
- `redirectTo` (optional) - Path to return to after login

**Returns:**
- `Session` - Guaranteed to exist (or redirect occurs)

**Throws:**
- Next.js redirect (this is expected behavior, do not catch)

**Example with redirect preservation:**
```typescript
const session = await requireSession('/dashboard/settings')
// User will be sent to: /login?redirectTo=/dashboard/settings
```

### requireUser()

```typescript
function requireUser(): Promise<User>
```

Requires authentication. Returns just the user object.

**Returns:**
- `User` - Guaranteed to exist (or redirect occurs)

**Throws:**
- Next.js redirect if not authenticated

### requireUserId()

```typescript
function requireUserId(): Promise<string>
```

Requires authentication. Returns just the user ID.

**Returns:**
- `string` - User ID (UUID)

**Throws:**
- Next.js redirect if not authenticated

## Type Definitions

### Session Type

```typescript
import type { Session } from '@supabase/supabase-js'

interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: User
}
```

### User Type

```typescript
import type { User } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  email_confirmed_at?: string
  phone?: string
  created_at: string
  updated_at: string
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
}
```

## Integration with Middleware

These utilities work seamlessly with the middleware from Subtask 3.1:

1. **Middleware** - First line of defense
   - Protects `/dashboard/*` routes
   - Protects `/api/v1/*` routes (except `/api/v1/public/*`)
   - Redirects unauthenticated users
   - Refreshes sessions automatically

2. **Session Utilities** - Second line of defense
   - Use in Server Components for additional checks
   - Use in Route Handlers for API authentication
   - Provides type-safe session access
   - Enables custom redirect logic

**Double protection pattern:**
```tsx
// Middleware already redirected unauthenticated users
// But we can still check in the component for clarity
const session = await requireSession()
```

## Best Practices

### 1. Choose the Right Helper

- Use `requireUserId()` when you only need the user ID (most common)
- Use `requireUser()` when you need user metadata
- Use `requireSession()` when you need tokens or full session
- Use `getAuthSession()` for optional authentication

### 2. Let Middleware Handle Most Cases

Don't over-use session checks. Middleware already protects routes:

```tsx
// Unnecessary - middleware already protects /dashboard/*
export default async function DashboardPage() {
  const session = await requireSession()
  // ...
}

// Better - trust middleware, just fetch data
export default async function DashboardPage() {
  const userId = await requireUserId() // For type safety and user ID
  // ...
}
```

### 3. Use TypeScript for Safety

Always import types for better IDE support:

```typescript
import { requireSession } from '@/lib/auth'
import type { Session } from '@supabase/supabase-js'

const session: Session = await requireSession()
```

### 4. Handle Redirects Gracefully

Don't try to catch Next.js redirects:

```tsx
// Avoid - don't catch redirect errors
try {
  const session = await requireSession()
} catch (error) {
  // This catches the redirect!
}

// Correct - let redirect happen
const session = await requireSession()
```

### 5. Custom Redirect Logic

When you need custom handling, use `getAuthSession()`:

```tsx
const session = await getAuthSession()

if (!session) {
  // Log analytics
  console.log('Unauthenticated access attempt')
  
  // Custom redirect with extra params
  redirect('/login?source=settings&plan=premium')
}
```

## Examples

### Protected Server Component

```tsx
import { requireUserId } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const userId = await requireUserId()
  const supabase = await createServerClient()
  
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
  
  return <div>{/* Render data */}</div>
}
```

### Protected Route Handler

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // This won't redirect in route handlers - returns early instead
  const userId = await requireUserId().catch(() => {
    return null
  })
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
  
  return NextResponse.json({ data })
}
```

### Server Action

```tsx
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

## Troubleshooting

### "redirect() called outside of render"

This error occurs when `requireSession()` is called in a try-catch or after response headers are sent.

**Solution:** Don't catch redirects, and call `requireSession()` early in the function.

### Infinite redirect loops

Check that your login page is not protected:

```typescript
// middleware.ts
const isAuthRoute = pathname.startsWith('/auth/') || pathname === '/login'
if (isAuthRoute) {
  return response // Allow access
}
```

### Type errors with Session

Import types from `@supabase/supabase-js`:

```typescript
import type { Session, User } from '@supabase/supabase-js'
```

## Related Documentation

- [Authentication Flow](authentication.md)
- [Middleware Documentation](middleware.md)
- [Supabase Client](supabase-client.md)
