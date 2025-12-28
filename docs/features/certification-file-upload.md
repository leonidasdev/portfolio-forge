# Certification File Upload System

Complete documentation for the certification file upload and storage system in Portfolio Forge.

## Overview

Portfolio Forge uses Supabase Storage for certification file management (PDFs and images). Files are uploaded directly from the client to Supabase Storage, bypassing the API server for better performance.

## Architecture

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ 1. Upload file
       ↓
┌──────────────────┐
│ Supabase Storage │
│  (certifications)│
└──────┬───────────┘
       │
       │ 2. Get file_path
       ↓
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ 3. POST /api/v1/certifications
       │    (with file_path)
       ↓
┌──────────────────┐
│   API Routes     │
│  (Supabase DB)   │
└──────────────────┘
```

## File Structure

Files are organized in Supabase Storage with the following structure:

```
certifications/
├── {userId}/
│   ├── {certificationId}/
│   │   └── {timestamp}-{random}-{filename}
│   └── temp/
│       └── {timestamp}-{random}-{filename}
```

**Examples:**
- `123e4567.../cert-456/1640000000-abc123-aws-certificate.pdf`
- `123e4567.../temp/1640000000-xyz789-google-cert.pdf`

## Storage Configuration

### Bucket Settings

- **Name:** `certifications`
- **Public:** `false` (controlled per-file)
- **File Size Limit:** 10MB
- **Allowed MIME Types:**
  - `application/pdf`
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

### RLS Policies

1. **Upload Policy:** Users can upload to `/{userId}/...`
2. **View Policy (Private):** Users can view their own files
3. **View Policy (Public):** Anyone can view files where `certifications.is_public = true`
4. **Update Policy:** Users can update their own files
5. **Delete Policy:** Users can delete their own files

## Client-Side Upload

### Upload Function

```typescript
import { uploadCertificationFile } from '@/lib/storage/certifications'

// Upload file
const filePath = await uploadCertificationFile(
  userId,
  file,
  certificationId // optional
)
```

### Complete Upload Flow

```tsx
'use client'

import { useState } from 'react'
import { useUserId } from '@/lib/auth/SessionContext'
import { uploadCertificationFile } from '@/lib/storage/certifications'

export function UploadForm() {
  const userId = useUserId()
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    try {
      // 1. Upload file to storage
      const filePath = await uploadCertificationFile(userId, file)
      
      // 2. Create certification via API
      const response = await fetch('/api/v1/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          issuing_organization: formData.get('issuer'),
          certification_type: file.type === 'application/pdf' ? 'pdf' : 'image',
          file_path: filePath,
          file_type: file.type,
          is_public: true,
        }),
      })

      const { data } = await response.json()
      console.log('Created:', data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="Title" required />
      <input name="issuer" placeholder="Issuer" required />
      <input 
        name="file" 
        type="file" 
        accept=".pdf,.jpg,.jpeg,.png,.webp" 
        required 
      />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  )
}
```

## API Integration

### POST /api/v1/certifications

```typescript
// Request body includes file_path from upload
{
  "title": "AWS Solutions Architect",
  "issuing_organization": "Amazon Web Services",
  "certification_type": "pdf",
  "file_path": "user-id/cert-id/1640000000-abc123-cert.pdf",
  "file_type": "application/pdf",
  "is_public": true
}
```

### PATCH /api/v1/certifications/[id]

When updating with a new file, delete the old file first:

```typescript
// 1. Client uploads new file
const newFilePath = await uploadCertificationFile(userId, newFile, certId)

// 2. Update certification (API deletes old file automatically)
await fetch(`/api/v1/certifications/${certId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    file_path: newFilePath,
    file_type: newFile.type,
  }),
})
```

### DELETE /api/v1/certifications/[id]

Automatically deletes associated file when certification is deleted.

## URL Generation

### Public Certifications (is_public = true)

Use public URLs for files that should be openly accessible:

```typescript
import { getPublicUrl } from '@/lib/storage/certifications'

const url = getPublicUrl(filePath)
// Returns: https://{project}.supabase.co/storage/v1/object/public/certifications/{filePath}
```

### Private Certifications (is_public = false)

Use signed URLs with expiration:

```typescript
import { getSignedUrl } from '@/lib/storage/certifications'

const url = await getSignedUrl(filePath, 3600) // 1 hour
// Returns: https://{project}.supabase.co/storage/v1/object/sign/certifications/{filePath}?token=...
```

### Helper Function

```typescript
import { getCertificationFileUrl } from '@/lib/storage/certifications'

const url = await getCertificationFileUrl(filePath, certification.is_public)
```

## Server-Side Operations

For API routes, use server-side utilities:

```typescript
import {
  getSignedUrlServer,
  getPublicUrlServer,
  deleteCertificationFileServer,
} from '@/lib/storage/certifications-server'

// Generate signed URL (server)
const signedUrl = await getSignedUrlServer(filePath, 3600)

// Get public URL (server)
const publicUrl = getPublicUrlServer(filePath)

// Delete file (server)
await deleteCertificationFileServer(filePath)
```

## File Validation

### Client-Side Validation

The upload utility validates:
- **File size:** Max 10MB
- **MIME type:** PDF, JPEG, PNG, WebP only

```typescript
// Validation happens automatically in uploadCertificationFile()
try {
  await uploadCertificationFile(userId, file)
} catch (error) {
  // Error: "File size exceeds 10MB limit"
  // Error: "File type not allowed..."
}
```

### Allowed MIME Types

- `application/pdf`
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

## Error Handling

### Upload Errors

```typescript
try {
  const filePath = await uploadCertificationFile(userId, file)
} catch (error) {
  if (error.message.includes('size exceeds')) {
    // File too large
  } else if (error.message.includes('not allowed')) {
    // Invalid file type
  } else {
    // Network or storage error
  }
}
```

### Delete Errors

```typescript
try {
  await deleteCertificationFile(filePath)
} catch (error) {
  // File not found or permission denied
  console.error('Delete failed:', error)
}
```

## Best Practices

### 1. Upload Before Creating Record

Always upload the file first, then create the database record:

```typescript
// Correct approach
const filePath = await uploadCertificationFile(userId, file)
await createCertification({ file_path: filePath, ... })

// Avoid - creates orphaned records if upload fails
await createCertification({ ... })
await uploadCertificationFile(userId, file)
```

### 2. Clean Up on Failure

If certification creation fails after upload, delete the file:

```typescript
let filePath: string | null = null

try {
  filePath = await uploadCertificationFile(userId, file)
  await createCertification({ file_path: filePath })
} catch (error) {
  if (filePath) {
    await deleteCertificationFile(filePath).catch(console.error)
  }
  throw error
}
```

### 3. Use Appropriate URL Type

```typescript
// Public certifications
if (certification.is_public) {
  const url = getPublicUrl(filePath) // Fast, cacheable
}

// Private certifications
if (!certification.is_public) {
  const url = await getSignedUrl(filePath) // Secure, expires
}
```

### 4. Handle File Replacement

When updating a certification with a new file:

```typescript
// API route handles this automatically, but in manual scenarios:
const oldFilePath = certification.file_path
const newFilePath = await uploadCertificationFile(userId, newFile)

try {
  await updateCertification({ file_path: newFilePath })
  if (oldFilePath) {
    await deleteCertificationFile(oldFilePath)
  }
} catch (error) {
  // Roll back: delete new file
  await deleteCertificationFile(newFilePath)
  throw error
}
```

### 5. Optimize for Large Lists

When fetching many certifications, generate URLs on-demand:

```typescript
// Avoid - Generates signed URLs for all (slow)
const certs = await getCertifications()
const withUrls = await Promise.all(
  certs.map(async c => ({
    ...c,
    url: await getSignedUrl(c.file_path)
  }))
)

// Preferred - Only generate when needed
function CertificationItem({ cert }: { cert: Certification }) {
  const [url, setUrl] = useState<string>()
  
  useEffect(() => {
    if (!cert.is_public) {
      getSignedUrl(cert.file_path).then(setUrl)
    }
  }, [])
  
  const displayUrl = cert.is_public 
    ? getPublicUrl(cert.file_path)
    : url
  
  return <a href={displayUrl}>View</a>
}
```

## Security Considerations

### User Isolation

- Files stored in `/{userId}/...` folders
- RLS policies prevent cross-user access
- File paths validated on upload

### Public Access Control

- Public access requires `is_public = true` in database
- Soft-deleted certifications don't expose files
- Signed URLs expire (default: 1 hour)

### File Type Restrictions

- Only PDF and image files allowed
- MIME type validated on upload
- File size limited to 10MB

## Troubleshooting

### "Failed to upload file"

**Causes:**
- File exceeds 10MB limit
- Invalid MIME type
- Network error
- Bucket doesn't exist

**Solutions:**
- Check file size and type
- Verify bucket configuration
- Check network connection

### "Failed to generate signed URL"

**Causes:**
- File doesn't exist
- User doesn't have permission
- Bucket not configured

**Solutions:**
- Verify file_path exists in storage
- Check RLS policies
- Ensure user is authenticated

### "Public files not accessible"

**Causes:**
- `is_public = false` in database
- Certification is deleted
- RLS policy not configured

**Solutions:**
- Set `is_public = true`
- Check `is_deleted = false`
- Verify public RLS policy exists

## Related Files

- `lib/storage/certifications.ts` - Client-side utilities
- `lib/storage/certifications-server.ts` - Server-side utilities
- `supabase/storage-buckets.sql` - Bucket configuration
- `app/api/v1/certifications/route.ts` - API endpoints
- `docs/storage-integration-examples.ts` - Integration examples
