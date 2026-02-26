# Portfolio Forge API Reference

**Version:** 1.0.0
**Base URL:** `/api/v1`

This document provides a comprehensive reference for the Portfolio Forge REST API. All endpoints follow RESTful conventions and return JSON responses.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints](#endpoints)
   - [Portfolios](#portfolios)
   - [Portfolio Sections](#portfolio-sections)
   - [Certifications](#certifications)
   - [Tags](#tags)
   - [Templates](#templates)
   - [Themes](#themes)
   - [AI Services](#ai-services)
   - [Export Services](#export-services)

---

## Authentication

All API endpoints require authentication via Supabase Auth session cookies. The API validates the session automatically from the `sb-access-token` cookie.

### Authentication Headers

```
Cookie: sb-access-token=<jwt_token>
```

### Unauthorized Response

```json
{
  "error": "Authentication required",
  "status": 401
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "status": 400,
  "details": {} // Optional additional context
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

API requests are rate-limited to prevent abuse. Default limits:

| Route Type | Limit | Window |
|------------|-------|--------|
| Standard API | 100 requests | 60 seconds |
| Auth routes | 5 requests | 60 seconds |
| AI endpoints | 10 requests | 60 seconds |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706745600
```

When rate limited:

```json
{
  "error": "Too many requests. Please try again later.",
  "status": 429
}
```

---

## Endpoints

---

### Portfolios

#### List Portfolios

```http
GET /api/v1/portfolios
```

Returns all portfolios for the authenticated user.

**Response:** `200 OK`

```json
{
  "portfolios": [
    {
      "id": "uuid",
      "title": "My Portfolio",
      "description": "Professional portfolio",
      "is_public": true,
      "public_link_token": "abc123",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:45:00Z"
    }
  ]
}
```

---

#### Create Portfolio

```http
POST /api/v1/portfolios
```

Creates a new portfolio.

**Request Body:**

```json
{
  "title": "My New Portfolio",
  "description": "Optional description",
  "is_public": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Portfolio title (1-100 chars) |
| description | string | No | Portfolio description |
| is_public | boolean | No | Public visibility (default: false) |

**Response:** `201 Created`

```json
{
  "portfolio": {
    "id": "uuid",
    "title": "My New Portfolio",
    "description": "Optional description",
    "is_public": false,
    "public_link_token": null,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Get Portfolio

```http
GET /api/v1/portfolios/:id
```

Returns a single portfolio with all sections.

**Response:** `200 OK`

```json
{
  "portfolio": {
    "id": "uuid",
    "title": "My Portfolio",
    "description": "Professional portfolio",
    "is_public": true,
    "sections": [
      {
        "id": "uuid",
        "section_type": "summary",
        "title": "Professional Summary",
        "content": "...",
        "display_order": 0
      }
    ]
  }
}
```

---

#### Update Portfolio

```http
PATCH /api/v1/portfolios/:id
```

Updates an existing portfolio.

**Request Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "is_public": true
}
```

**Response:** `200 OK`

```json
{
  "portfolio": {
    "id": "uuid",
    "title": "Updated Title",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

#### Delete Portfolio

```http
DELETE /api/v1/portfolios/:id
```

Soft-deletes a portfolio.

**Response:** `200 OK`

```json
{
  "success": true
}
```

---

#### Update Portfolio Template

```http
PATCH /api/v1/portfolios/:id/template
```

Updates the template for a portfolio.

**Request Body:**

```json
{
  "template": "two-column"
}
```

**Response:** `200 OK`

```json
{
  "portfolio": {
    "id": "uuid",
    "template": "two-column",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

### Portfolio Sections

#### List Sections

```http
GET /api/v1/portfolios/:portfolioId/sections
```

Returns all sections for a portfolio.

**Response:** `200 OK`

```json
{
  "sections": [
    {
      "id": "uuid",
      "portfolio_id": "uuid",
      "section_type": "summary",
      "title": "Professional Summary",
      "content": "Experienced software engineer...",
      "display_order": 0,
      "is_visible": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Create Section

```http
POST /api/v1/portfolio-sections
```

Creates a new section in a portfolio.

**Request Body:**

```json
{
  "portfolio_id": "uuid",
  "section_type": "work_experience",
  "title": "Work Experience",
  "content": "...",
  "display_order": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolio_id | uuid | Yes | Parent portfolio ID |
| section_type | string | Yes | One of: summary, skills, work_experience, education, certifications, custom |
| title | string | No | Section title |
| content | string | No | Section content (JSON or text) |
| display_order | number | No | Display order (default: 0) |

**Response:** `201 Created`

```json
{
  "section": {
    "id": "uuid",
    "portfolio_id": "uuid",
    "section_type": "work_experience",
    "title": "Work Experience",
    "content": "...",
    "display_order": 1
  }
}
```

---

#### Update Section

```http
PATCH /api/v1/portfolio-sections/:id
```

Updates an existing section.

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "is_visible": true
}
```

**Response:** `200 OK`

```json
{
  "section": {
    "id": "uuid",
    "title": "Updated Title",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

#### Delete Section

```http
DELETE /api/v1/portfolio-sections/:id
```

Deletes a section from a portfolio.

**Response:** `200 OK`

```json
{
  "success": true
}
```

---

### Certifications

#### List Certifications

```http
GET /api/v1/certifications
```

Returns all certifications for the authenticated user.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| is_public | boolean | Filter by public status |
| limit | number | Results per page (default: 50) |
| offset | number | Pagination offset |

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "AWS Solutions Architect",
      "issuing_organization": "Amazon Web Services",
      "certification_type": "external_link",
      "date_issued": "2024-01-15",
      "expiration_date": "2027-01-15",
      "credential_id": "ABC123",
      "verification_url": "https://verify.aws...",
      "is_public": true,
      "tags": [
        { "id": "uuid", "name": "cloud", "color": "#3b82f6" }
      ]
    }
  ],
  "count": 1
}
```

---

#### Create Certification

```http
POST /api/v1/certifications
```

Creates a new certification.

**Request Body:**

```json
{
  "title": "AWS Solutions Architect",
  "issuing_organization": "Amazon Web Services",
  "certification_type": "external_link",
  "date_issued": "2024-01-15",
  "expiration_date": "2027-01-15",
  "credential_id": "ABC123",
  "verification_url": "https://verify.aws...",
  "external_url": "https://credly.com/...",
  "description": "Professional level certification",
  "is_public": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Certification title |
| issuing_organization | string | Yes | Issuing organization name |
| certification_type | string | Yes | One of: pdf, image, external_link, manual |
| date_issued | date | No | Issue date (ISO format) |
| expiration_date | date | No | Expiration date (ISO format) |
| credential_id | string | No | Credential ID |
| verification_url | string | No | Verification URL |
| external_url | string | No | External badge URL (for external_link type) |
| description | string | No | Additional description |
| is_public | boolean | No | Public visibility (default: true) |

**Response:** `201 Created`

```json
{
  "certification": {
    "id": "uuid",
    "title": "AWS Solutions Architect",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Update Certification

```http
PATCH /api/v1/certifications/:id
```

Updates an existing certification.

**Response:** `200 OK`

```json
{
  "certification": {
    "id": "uuid",
    "title": "Updated Title",
    "updated_at": "2024-01-20T14:45:00Z"
  }
}
```

---

#### Delete Certification

```http
DELETE /api/v1/certifications/:id
```

Soft-deletes a certification.

**Response:** `200 OK`

```json
{
  "success": true
}
```

---

### Tags

#### List Tags

```http
GET /api/v1/tags
```

Returns all tags for the authenticated user.

**Response:** `200 OK`

```json
{
  "tags": [
    {
      "id": "uuid",
      "name": "cloud",
      "color": "#3b82f6",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Create Tag

```http
POST /api/v1/tags
```

Creates a new tag.

**Request Body:**

```json
{
  "name": "cloud",
  "color": "#3b82f6"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Tag name (1-50 chars, unique per user) |
| color | string | No | Hex color code |

**Response:** `201 Created`

```json
{
  "tag": {
    "id": "uuid",
    "name": "cloud",
    "color": "#3b82f6"
  }
}
```

**Error:** `409 Conflict` if tag name already exists

---

#### Delete Tag

```http
DELETE /api/v1/tags/:id
```

Deletes a tag. Also removes tag from all associated resources.

**Response:** `200 OK`

```json
{
  "success": true
}
```

---

### Certification Tags

#### Add Tag to Certification

```http
POST /api/v1/certification-tags
```

Associates a tag with a certification.

**Request Body:**

```json
{
  "certification_id": "uuid",
  "tag_id": "uuid"
}
```

**Response:** `201 Created`

```json
{
  "certification_tag": {
    "certification_id": "uuid",
    "tag_id": "uuid"
  }
}
```

---

#### Remove Tag from Certification

```http
DELETE /api/v1/certification-tags
```

Removes a tag association from a certification.

**Request Body:**

```json
{
  "certification_id": "uuid",
  "tag_id": "uuid"
}
```

**Response:** `200 OK`

```json
{
  "success": true
}
```

---

### Templates

#### List Templates

```http
GET /api/v1/templates
```

Returns all available portfolio templates.

**Response:** `200 OK`

```json
[
  {
    "id": "single-column",
    "name": "Single Column",
    "description": "A clean, focused single-column layout",
    "layout": "single-column",
    "supportedSections": ["summary", "skills", "work_experience", "education", "certifications", "custom"],
    "config": {}
  },
  {
    "id": "two-column",
    "name": "Two Column",
    "description": "Professional two-column layout with sidebar",
    "layout": "two-column",
    "supportedSections": ["summary", "skills", "work_experience", "education"],
    "config": {}
  }
]
```

---

### Themes

#### List Themes

```http
GET /api/v1/themes
```

Returns all available portfolio themes.

**Response:** `200 OK`

```json
[
  {
    "id": "default",
    "name": "Default",
    "description": "Clean professional theme",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#6b7280",
      "background": "#ffffff",
      "text": "#1f2937"
    }
  }
]
```

---

### AI Services

All AI endpoints require authentication and have stricter rate limits (10 requests/minute).

#### Improve Text

```http
POST /api/v1/ai/improve
```

Uses AI to improve and enhance text content.

**Request Body:**

```json
{
  "text": "I worked at company doing stuff",
  "tone": "professional",
  "context": "work_experience"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| text | string | Yes | Text to improve |
| tone | string | No | Desired tone: professional, casual, confident |
| context | string | No | Section context for better results |

**Response:** `200 OK`

```json
{
  "improved_text": "Led cross-functional team initiatives at [Company], driving measurable business outcomes through strategic project execution."
}
```

---

#### Generate Summary

```http
POST /api/v1/ai/generate-summary
```

Generates a professional summary from portfolio data.

**Request Body:**

```json
{
  "portfolio_id": "uuid",
  "source": "sections"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolio_id | uuid | Yes | Portfolio to analyze |
| source | string | No | Data source: "sections" or "user_data" |

**Response:** `200 OK`

```json
{
  "summary": "Experienced software engineer with 5+ years..."
}
```

---

#### Suggest Tags

```http
POST /api/v1/ai/suggest-tags
```

Suggests relevant tags based on content.

**Request Body:**

```json
{
  "content": "AWS Solutions Architect certification...",
  "existing_tags": ["cloud", "aws"]
}
```

**Response:** `200 OK`

```json
{
  "suggested_tags": ["architecture", "infrastructure", "certification"]
}
```

---

#### Optimize for Job

```http
POST /api/v1/ai/optimize-job
```

Optimizes portfolio content for a specific job description.

**Request Body:**

```json
{
  "portfolio_id": "uuid",
  "job_description": "We are looking for a senior software engineer..."
}
```

**Response:** `200 OK`

```json
{
  "suggestions": [
    {
      "section_id": "uuid",
      "original": "...",
      "optimized": "...",
      "keywords_added": ["leadership", "agile"]
    }
  ],
  "match_score": 85
}
```

---

#### Generate Resume

```http
POST /api/v1/ai/generate-resume
```

Generates a formatted resume from portfolio data.

**Request Body:**

```json
{
  "portfolio_id": "uuid",
  "format": "markdown",
  "style": "professional"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolio_id | uuid | Yes | Portfolio to convert |
| format | string | No | Output format: markdown, plain, html |
| style | string | No | Resume style: professional, creative, academic |

**Response:** `200 OK`

```json
{
  "resume": "# John Doe\n\n## Professional Summary\n\n..."
}
```

---

### Export Services

Portfolio export and deployment services for GitHub Pages and ZIP downloads.

#### Deploy to GitHub Pages

```
POST /api/v1/export/github
```

Generates a static site from your portfolio and deploys it to GitHub Pages.

**Request Body:**

```json
{
  "portfolioId": "uuid",
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx",
  "repoName": "my-portfolio",
  "customDomain": "portfolio.example.com",
  "isPrivate": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolioId | uuid | Yes | Portfolio to export |
| githubToken | string | Yes | GitHub Personal Access Token with `repo` scope |
| repoName | string | No | Repository name (default: "portfolio") |
| customDomain | string | No | Custom domain for GitHub Pages |
| isPrivate | boolean | No | Whether to create a private repository (default: false) |

**Response:** `200 OK`

```json
{
  "success": true,
  "repoUrl": "https://github.com/username/my-portfolio",
  "pagesUrl": "https://username.github.io/my-portfolio",
  "filesCount": 8,
  "totalSize": 25600
}
```

**Error Responses:**

- `400 Bad Request` - Invalid portfolio ID or missing GitHub token
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Portfolio not found or doesn't belong to user
- `500 Internal Server Error` - GitHub API error or deployment failure

**Notes:**
- Requires a GitHub Personal Access Token with `repo` scope
- Creates the repository if it doesn't exist
- Automatically enables GitHub Pages with GitHub Actions deployment
- Rate limited: 5 requests per minute

---

#### Download as ZIP

```
POST /api/v1/export/download
```

Generates a static site package and downloads it as a ZIP file.

**Request Body:**

```json
{
  "portfolioId": "uuid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| portfolioId | uuid | Yes | Portfolio to export |

**Response:** `200 OK`

Returns binary ZIP file with `Content-Type: application/zip` and `Content-Disposition: attachment; filename="portfolio-title.zip"`.

**ZIP Contents:**
```
portfolio-title/
├── index.html          # Main portfolio page
├── 404.html            # Custom 404 page
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── .nojekyll           # Disables Jekyll processing
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions workflow (optional)
```

**Error Responses:**

- `400 Bad Request` - Invalid or missing portfolio ID
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Portfolio not found or doesn't belong to user
- `500 Internal Server Error` - Export generation failure

**Notes:**
- Downloaded ZIP can be manually deployed to any static hosting service
- Includes all necessary files for GitHub Pages, Netlify, Vercel, etc.
- Rate limited: 10 requests per minute

---

## Webhooks (Coming Soon)

Future versions will support webhooks for:
- Portfolio published
- Certification added
- Public portfolio viewed

---

## SDKs and Tools

### API Client (TypeScript)

```typescript
import { apiClient } from '@/lib/api/client'

// GET request
const { portfolios } = await apiClient.get<{ portfolios: Portfolio[] }>('/portfolios')

// POST request
const { portfolio } = await apiClient.post<{ portfolio: Portfolio }>('/portfolios', {
  title: 'New Portfolio'
})

// PATCH request
await apiClient.patch(`/portfolios/${id}`, { title: 'Updated' })

// DELETE request
await apiClient.delete(`/portfolios/${id}`)
```

---

## Changelog

### v1.1.0 (2026-02)
- Export Services: GitHub Pages deployment
- Export Services: ZIP download
- New database table: `portfolio_exports`

### v1.0.0 (2024-01)
- Initial API release
- Portfolios CRUD
- Sections CRUD
- Certifications CRUD
- Tags CRUD
- Templates and Themes
- AI Services (improve, generate, suggest)
