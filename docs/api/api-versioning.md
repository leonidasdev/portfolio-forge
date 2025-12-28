# API Versioning Strategy for Portfolio Forge

## Overview

Portfolio Forge uses URL-based API versioning to maintain backward compatibility and allow for breaking changes without disrupting existing clients.

## Version Structure

```
/api/v1/         - Version 1 of the API
/api/v1/public/  - Public endpoints (no authentication required)
```

## Current Version: v1

### Protected Endpoints (Authentication Required)

**Portfolios:**
- `GET /api/v1/portfolios` - List user's portfolios
- `POST /api/v1/portfolios` - Create a new portfolio
- `GET /api/v1/portfolios/[id]` - Get portfolio details
- `PATCH /api/v1/portfolios/[id]` - Update a portfolio
- `DELETE /api/v1/portfolios/[id]` - Delete a portfolio

**Certifications:**
- `GET /api/v1/certifications` - List user's certifications
- `POST /api/v1/certifications` - Create a new certification
- `GET /api/v1/certifications/[id]` - Get certification details
- `PATCH /api/v1/certifications/[id]` - Update a certification
- `DELETE /api/v1/certifications/[id]` - Delete a certification

**Projects:**
- `GET /api/v1/projects` - List user's projects
- `POST /api/v1/projects` - Create a new project
- `GET /api/v1/projects/[id]` - Get project details
- `PATCH /api/v1/projects/[id]` - Update a project
- `DELETE /api/v1/projects/[id]` - Delete a project

**Skills:**
- `GET /api/v1/skills` - List user's skills
- `POST /api/v1/skills` - Create a new skill
- `GET /api/v1/skills/[id]` - Get skill details
- `PATCH /api/v1/skills/[id]` - Update a skill
- `DELETE /api/v1/skills/[id]` - Delete a skill

**Work Experience:**
- `GET /api/v1/work-experience` - List user's work experience
- `POST /api/v1/work-experience` - Create work experience entry
- `GET /api/v1/work-experience/[id]` - Get work experience details
- `PATCH /api/v1/work-experience/[id]` - Update work experience
- `DELETE /api/v1/work-experience/[id]` - Delete work experience

**Tags:**
- `GET /api/v1/tags` - List user's tags
- `POST /api/v1/tags` - Create a new tag
- `PATCH /api/v1/tags/[id]` - Update a tag
- `DELETE /api/v1/tags/[id]` - Delete a tag

### Public Endpoints (No Authentication Required)

**Public Portfolios:**
- `GET /api/v1/public/portfolio/[token]` - View public portfolio by token
- `POST /api/v1/public/portfolio/[token]/view` - Increment view count

**Health Check:**
- `GET /api/v1/public/health` - API health status

## Version Migration Strategy

### When to Create a New Version

Create a new API version (v2) when:
1. Making breaking changes to request/response formats
2. Removing required fields
3. Changing authentication mechanisms
4. Significant architectural changes

### Backward Compatibility Rules

Within the same version:
- [OK] Add new optional fields
- [OK] Add new endpoints
- [OK] Add new query parameters (optional)
- [OK] Make required fields optional
- [NO] Remove fields
- [NO] Change field types
- [NO] Rename fields
- [NO] Make optional fields required

### Version Support Policy

- **Current version (v1)**: Fully supported, receives all new features
- **Previous version (v0)**: Deprecated, no new features, security fixes only for 6 months
- **Older versions**: Unsupported, endpoints return 410 Gone

## Implementation Details

### Directory Structure

```
app/
  api/
    v1/
      portfolios/
        route.ts
        [id]/
          route.ts
      certifications/
        route.ts
        [id]/
          route.ts
      public/
        portfolio/
          [token]/
            route.ts
        health/
          route.ts
    v2/  (future)
      ...
```

### Middleware Protection

The middleware automatically protects all `/api/v1/*` routes except `/api/v1/public/*`:

```typescript
const isPublicApi = pathname.startsWith('/api/v1/public/')
const isProtectedApi = pathname.startsWith('/api/v1/') && !isPublicApi

if (isProtectedApi && !user) {
  return NextResponse.json(
    { error: 'Authentication required' },
    { status: 401 }
  )
}
```

### Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "data": { /* resource data */ },
  "meta": {
    "timestamp": "2025-12-27T10:00:00Z",
    "version": "v1"
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-12-27T10:00:00Z",
    "version": "v1"
  }
}
```

### HTTP Status Codes

- `200 OK` - Successful GET, PATCH requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `410 Gone` - API version no longer supported
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## API Client Example

### JavaScript/TypeScript

```typescript
class PortfolioForgeAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1'
  private token: string | null = null

  async setAuthToken(token: string) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    return response.json()
  }

  // Portfolios
  async getPortfolios() {
    return this.request('/portfolios')
  }

  async createPortfolio(data: CreatePortfolioInput) {
    return this.request('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Public endpoints
  async getPublicPortfolio(token: string) {
    return this.request(`/public/portfolio/${token}`)
  }
}
```

## Testing API Versions

```bash
# Test protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/portfolios

# Test public endpoint
curl http://localhost:3000/api/v1/public/portfolio/abc123

# Test non-existent version (should return 404)
curl http://localhost:3000/api/v2/portfolios
```

## Future Considerations

### v2 Planning

Potential breaking changes for v2:
- GraphQL support
- Enhanced filtering/sorting syntax
- Nested resource expansion
- Bulk operations
- Webhook support

### Deprecation Process

1. **Announcement** (T-6 months): Announce deprecation in docs and response headers
2. **Warning** (T-3 months): Add deprecation warnings to responses
3. **Sunset** (T): Version returns 410 Gone with migration guide

### Response Headers

Include version info in headers:
```
X-API-Version: v1
X-API-Deprecated: false
X-API-Sunset-Date: null
```

## Additional Resources

- [API Documentation](./api-documentation.md)
- [Authentication Guide](./authentication.md)
- [Rate Limiting](./rate-limiting.md)
- [Error Handling](./error-handling.md)
