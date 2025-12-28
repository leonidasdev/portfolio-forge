/**
 * Middleware Configuration Documentation
 * 
 * This document explains how the middleware works and how to customize it.
 */

# Next.js Middleware for Supabase Authentication

## Overview

The middleware automatically:
1. Refreshes Supabase auth sessions
2. Protects routes that require authentication
3. Redirects unauthenticated users to login
4. Allows public access to specific routes

## Route Protection

### Protected Routes (Require Authentication)

**Dashboard Routes:**
- `/dashboard/*` - All dashboard pages
- Example: `/dashboard`, `/dashboard/portfolios`, `/dashboard/settings`

**API Routes:**
- `/api/v1/*` - All versioned API routes except public ones
- Example: `/api/v1/portfolios`, `/api/v1/certifications`

### Public Routes (No Authentication Required)

**Public Portfolio Views:**
- `/p/*` - Public portfolio pages accessed via share links
- Example: `/p/abc123token`

**Public API Routes:**
- `/api/v1/public/*` - Public API endpoints
- Example: `/api/v1/public/portfolio/abc123token`

**Authentication Routes:**
- `/login` - Login page
- `/auth/*` - Auth callback and OAuth handlers
- Example: `/auth/callback`, `/auth/sign-out`

## Behavior

### For Unauthenticated Users:

1. **Accessing protected routes** → Redirected to `/login?redirectTo=<original-path>`
2. **Accessing public routes** → Allowed
3. **Accessing API routes** → Returns 401 error

### For Authenticated Users:

1. **Accessing `/login`** → Redirected to `/dashboard`
2. **Accessing protected routes** → Allowed
3. **Accessing public routes** → Allowed

## Session Refresh

The middleware automatically refreshes the user's session on every request. This ensures:
- Expired tokens are refreshed seamlessly
- Server Components always have access to the latest session
- No manual token refresh needed in application code

## Customization

### Adding More Protected Routes

Edit `middleware.ts` and add your route pattern:

```typescript
const isAdminRoute = pathname.startsWith('/admin')

if (isAdminRoute && !user) {
  // Redirect to login
}
```

### Adding More Public Routes

Add your route pattern to the public route checks:

```typescript
const isPublicBlog = pathname.startsWith('/blog')

if (isAuthRoute || isPublicPortfolio || isPublicApi || isPublicBlog) {
  return response
}
```

### Role-Based Protection

Check user metadata or database for roles:

```typescript
// Get user's role from database
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

// Protect admin routes
if (isAdminRoute && profile?.role !== 'admin') {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Custom Redirect After Login

The middleware stores the original URL in `redirectTo` query param:

```typescript
// In your login page:
const searchParams = useSearchParams()
const redirectTo = searchParams.get('redirectTo') || '/dashboard'

// After successful login:
router.push(redirectTo)
```

## Matcher Configuration

The middleware runs on all routes except:
- Static files (`_next/static/*`)
- Image optimization (`_next/image/*`)
- Favicon (`favicon.ico`)
- Image files (`*.png`, `*.jpg`, `*.svg`, etc.)

To modify which routes the middleware processes, edit the `matcher` in `middleware.ts`:

```typescript
export const config = {
  matcher: [
    // Your custom matcher pattern
    '/dashboard/:path*',
    '/api/:path*',
  ],
}
```

## Performance Considerations

1. **Session Check**: The middleware checks auth on every request. This is necessary for security but adds ~20-50ms latency.

2. **Database Queries**: Avoid making database queries in middleware when possible. Use RLS policies instead.

3. **Edge Runtime**: Consider using Edge Runtime for faster middleware execution:

```typescript
export const runtime = 'edge' // Add this to middleware.ts
```

## Troubleshooting

### Issue: Infinite redirect loops

**Cause**: Middleware redirecting authenticated users to a protected route that redirects back.

**Solution**: Ensure authenticated users aren't redirected to routes they can access.

### Issue: 401 errors on authenticated API requests

**Cause**: Session not being read correctly or cookies not being set.

**Solution**: 
1. Check that cookies are allowed in your browser
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Check that the Supabase client configuration matches in both middleware and application code

### Issue: Session not refreshing

**Cause**: Middleware not running or cookies not being updated.

**Solution**:
1. Verify the matcher configuration includes your route
2. Check browser console for cookie errors
3. Ensure `setAll` is properly updating response cookies

## Security Best Practices

1. **Always use HTTPS in production** - Required for secure cookies
2. **Set proper CORS headers** - Configure in Supabase dashboard
3. **Use RLS policies** - Don't rely solely on middleware for data security
4. **Validate tokens** - Supabase automatically validates JWT tokens
5. **Regular security audits** - Review middleware logic periodically

## Testing

Test protected routes:
```bash
# Should redirect to login
curl http://localhost:3000/dashboard

# Should return 401
curl http://localhost:3000/api/v1/portfolios
```

Test public routes:
```bash
# Should work without auth
curl http://localhost:3000/p/abc123token
curl http://localhost:3000/api/v1/public/portfolio/abc123token
```

## Related Files

- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/callback/route.ts` - OAuth callback handler
