# Supabase Client Setup for Portfolio Forge

This directory contains the Supabase client configuration for Portfolio Forge.

## Files

### `types.ts`
TypeScript types generated from the Supabase database schema. These types provide full type safety when querying the database.

**Regenerate types:**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

### `server.ts`
Server-side Supabase client for use in:
- Server Components
- Server Actions
- Route Handlers (API routes)

**Features:**
- Automatic session handling via cookies
- RLS enforcement
- Helper functions for auth checks

**Example usage:**
```tsx
import { createServerClient, getUser } from '@/lib/supabase/server'

export default async function Page() {
  const user = await getUser()
  const supabase = await createServerClient()
  const { data } = await supabase.from('portfolios').select('*')
  return <div>{data?.length} portfolios</div>
}
```

### `client.ts`
Client-side Supabase client for use in:
- Client Components
- Browser-side operations
- File uploads
- Real-time subscriptions

**Features:**
- File upload utilities
- OAuth authentication helpers
- Real-time subscription utilities
- Storage management

**Example usage:**
```tsx
'use client'
import { createBrowserClient, storage } from '@/lib/supabase/client'

export default function Component() {
  const supabase = createBrowserClient()
  
  async function uploadFile(file: File, userId: string) {
    const result = await storage.uploadCertification(userId, file)
    return result
  }
  
  return <div>...</div>
}
```

## Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Key Differences: Server vs Client

| Feature | Server Client | Client Client |
|---------|---------------|---------------|
| Where to use | Server Components, API routes, Server Actions | Client Components, browser code |
| Session handling | Automatic via cookies | Automatic via cookies |
| File uploads | No | Yes |
| Real-time | No | Yes |
| RLS enforcement | Yes | Yes |
| Import statement | `import { createServerClient } from '@/lib/supabase/server'` | `import { createBrowserClient } from '@/lib/supabase/client'` |

## Storage Utilities

The client provides built-in storage utilities for file management:

### Upload a file
```tsx
import { storage } from '@/lib/supabase/client'

const result = await storage.uploadCertification(userId, file, 'optional-filename.pdf')
```

### Get a public URL
```tsx
const url = storage.getCertificationPublicUrl('user-id/filename.pdf')
```

### Get a signed URL (for private files)
```tsx
const { data } = await storage.getCertificationSignedUrl('user-id/filename.pdf', 3600)
```

### Delete a file
```tsx
await storage.deleteCertification('user-id/filename.pdf')
```

## Authentication Utilities

The client provides auth helpers:

### Sign in with OAuth
```tsx
import { auth } from '@/lib/supabase/client'

await auth.signInWithOAuth('google')
```

### Sign out
```tsx
await auth.signOut()
```

### Get current user
```tsx
const { user } = await auth.getUser()
```

### Listen to auth changes
```tsx
const unsubscribe = auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session)
})

// Later: unsubscribe()
```

## Real-time Subscriptions

Subscribe to table changes:

```tsx
import { realtime } from '@/lib/supabase/client'

const unsubscribe = realtime.subscribeToTable(
  'portfolios',
  (payload) => {
    console.log('Portfolio changed:', payload)
  }
)

// Later: unsubscribe()
```

Subscribe to a specific portfolio:

```tsx
const unsubscribe = realtime.subscribeToPortfolio(
  portfolioId,
  (payload) => {
    console.log('This portfolio changed:', payload)
  }
)
```

## Example Components

See the `components/examples` directory for complete examples:

- **CertificationUpload.tsx**: File upload with progress tracking
- **PortfolioList.tsx**: Client-side queries with real-time updates

## Security Notes

1. **Row-Level Security (RLS)**: All queries automatically enforce RLS policies. Users can only access their own data unless specifically granted access.

2. **Storage Security**: Files are organized by user ID. Storage policies ensure users can only access their own files.

3. **Public Portfolios**: Public portfolios are accessible via secure tokens, not direct user ID access.

4. **Environment Variables**: Never commit `.env.local` to version control.

## Troubleshooting

### "User not authenticated" errors
- Ensure you're calling `createServerClient()` or `createBrowserClient()` correctly
- Check that the user is logged in before making requests
- Verify RLS policies in your Supabase dashboard

### File upload fails
- Check file size (max 10MB by default)
- Verify file type is allowed
- Ensure storage bucket exists and has correct policies
- Check that user is authenticated

### Real-time not working
- Verify Realtime is enabled in Supabase dashboard
- Check that RLS policies allow SELECT on the table
- Ensure subscription is not unsubscribed too early
