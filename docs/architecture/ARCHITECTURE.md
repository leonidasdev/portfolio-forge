# Architecture Overview

This document provides a comprehensive overview of Portfolio Forge's architecture, patterns, and code organization.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Directory Structure](#directory-structure)
3. [Key Architectural Patterns](#key-architectural-patterns)
4. [AI System Architecture](#ai-system-architecture)
5. [API Design](#api-design)
6. [State Management](#state-management)
7. [Type System](#type-system)
8. [Performance Considerations](#performance-considerations)

---

## High-Level Architecture

Portfolio Forge is a **Next.js 15 application** using the App Router with a clean layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (React Components, Hooks, Client-side State)               │
├─────────────────────────────────────────────────────────────┤
│                      Next.js App Router                      │
│  (Server Components, Route Handlers, Server Actions)        │
├─────────────────────────────────────────────────────────────┤
│                      Business Logic                          │
│  (lib/ai, lib/auth, lib/api, lib/validation)                │
├─────────────────────────────────────────────────────────────┤
│                      Data Access Layer                       │
│  (lib/supabase - Server & Client Clients)                   │
├─────────────────────────────────────────────────────────────┤
│                      External Services                       │
│  (Supabase PostgreSQL, Supabase Auth, Groq AI API)          │
└─────────────────────────────────────────────────────────────┘
```

### Core Technologies

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Next.js 15, Tailwind CSS |
| Backend | Next.js API Routes, Server Actions |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| AI | Groq API (llama-3.3-70b-versatile) |
| Validation | Zod |
| Testing | Jest, React Testing Library, Playwright |

---

## Directory Structure

```
portfolio-forge/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/v1/            # API Routes (versioned)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard pages
│   └── p/[token]/         # Public portfolio viewer
│
├── components/             # React Components
│   ├── portfolio-builder/ # Builder UI components
│   ├── portfolio-renderer/# Rendering components
│   ├── portfolio-sections/# Section type components
│   ├── portfolio-templates/# Layout templates
│   └── portfolio-themes/  # Theme system
│
├── lib/                    # Business Logic
│   ├── ai/                # AI integration layer
│   │   ├── abilities/     # Single-purpose AI functions
│   │   ├── agents/        # Multi-step AI workflows
│   │   ├── config.ts      # Configuration constants
│   │   ├── provider.ts    # Groq API integration
│   │   └── router.ts      # Provider abstraction
│   ├── api/               # API utilities
│   │   ├── client.ts      # Frontend API client
│   │   ├── auth-middleware.ts # Auth utilities for routes
│   │   └── index.ts       # Response utilities
│   ├── auth/              # Authentication utilities
│   ├── supabase/          # Supabase clients
│   └── validation/        # Zod schemas
│
├── hooks/                  # Custom React Hooks
├── types/                  # TypeScript Types
├── supabase/               # Database Schema
└── docs/                   # Documentation
```

---

## Key Architectural Patterns

### 1. Layered AI Architecture

The AI system follows a clear layered pattern:

```
┌───────────────────────┐
│      API Routes       │  ← HTTP endpoints
├───────────────────────┤
│       Agents          │  ← Multi-step workflows
├───────────────────────┤
│     Abilities         │  ← Single AI operations
├───────────────────────┤
│       Router          │  ← Provider abstraction
├───────────────────────┤
│      Provider         │  ← Groq API client
└───────────────────────┘
```

**Benefits:**
- Easy to swap AI providers
- Testable at each layer
- Clear separation of concerns

### 2. Server-First Rendering

Portfolio Forge prioritizes server components:

```tsx
// Server Component (default) - fetches data
export default async function DashboardPage() {
  const userId = await requireUserId()
  const portfolios = await fetchPortfolios(userId)

  return <PortfolioList portfolios={portfolios} />
}

// Client Component - only when needed for interactivity
'use client'
export function EditButton({ onEdit }) {
  return <button onClick={onEdit}>Edit</button>
}
```

### 3. Centralized API Client

All API calls go through a centralized client:

```typescript
// lib/api/client.ts
class ApiClient {
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: unknown): Promise<T>
  async patch<T>(endpoint: string, data: unknown): Promise<T>
  async delete(endpoint: string): Promise<void>
}

export const apiClient = new ApiClient()
```

### 4. Type-Safe Database Access

Database types are auto-generated from Supabase:

```typescript
// types/portfolio.ts
import type { Database } from '@/lib/supabase/types'

export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type Section = Database['public']['Tables']['portfolio_sections']['Row']
```

---

## AI System Architecture

### Provider Layer

The provider abstracts the AI API:

```typescript
// lib/ai/provider.ts
export async function createGroqCompletion(params: GroqCompletionParams) {
  const response = await groq.chat.completions.create({
    model: params.model || AI_CONFIG.defaultModel,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.userPrompt }
    ],
    temperature: params.temperature,
    max_tokens: params.maxTokens
  })

  return response.choices[0]?.message?.content
}
```

### Abilities Layer

Single-purpose AI functions:

```typescript
// lib/ai/abilities/suggestTags.ts
export async function suggestTags(
  context: SuggestTagsContext,
  options?: SuggestTagsOptions
): Promise<string[]> {
  const response = await aiRouter.complete({
    systemPrompt: SUGGEST_TAGS_SYSTEM_PROMPT,
    userPrompt: formatTagsPrompt(context),
    temperature: 0.7,
    maxTokens: 200
  })

  return parseTagsResponse(response)
}
```

### Agents Layer

Multi-step AI workflows:

```typescript
// lib/ai/agents/analyzePortfolio.ts
export async function analyzePortfolio(userId: string) {
  // 1. Fetch portfolio data
  const portfolio = await fetchPortfolioData(userId)

  // 2. Use abilities to analyze
  const completeness = await assessCompleteness(portfolio)
  const quality = await assessContentQuality(portfolio)
  const keywords = await extractKeywords(portfolio)

  // 3. Generate recommendations
  const recommendations = await generateRecommendations({
    completeness,
    quality,
    keywords
  })

  return { completeness, quality, keywords, recommendations }
}
```

---

## API Design

### Versioned API Structure

```
/api/v1/
├── ai/                     # AI endpoints
│   ├── analyze-portfolio/
│   ├── improve-text/
│   ├── suggest-tags/
│   └── ...
├── portfolios/             # Portfolio CRUD
├── portfolio-sections/     # Section management
├── certifications/         # Certification CRUD
├── tags/                   # Tag management
├── templates/              # Template metadata
└── themes/                 # Theme metadata
```

### Route Handler Pattern

```typescript
// app/api/v1/portfolios/route.ts
import { withApiHandler, requireAuth } from '@/lib/api'
import { createPortfolioSchema } from '@/lib/validation'

export const POST = withApiHandler(async (request) => {
  const { user, supabase } = await requireAuth()
  const body = createPortfolioSchema.parse(await request.json())

  const { data, error } = await supabase
    .from('portfolios')
    .insert({ ...body, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json(data, { status: 201 })
})
```

### Error Response Format

All API errors follow a consistent format:

```typescript
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",         // Optional
  "details": { ... }            // Optional
}
```

---

## State Management

### Server State

Server state is managed through:
- **Server Components** - Direct data fetching
- **Server Actions** - Mutations with revalidation
- **API Routes** - Complex operations

### Client State

Client state uses:
- **React useState/useReducer** - Local component state
- **Context API** - Shared state (BuilderContext)
- **URL State** - Query parameters for filters/sorting

### BuilderContext Example

```typescript
// components/portfolio-builder/BuilderContext.tsx
const BuilderContext = createContext<BuilderContextType>(null)

export function BuilderProvider({ children, initialSections }) {
  const [sections, setSections] = useState(initialSections)
  const [editingSection, setEditingSection] = useState(null)

  const updateSection = async (id, content) => {
    // Optimistic update
    setSections(prev => prev.map(s =>
      s.id === id ? { ...s, content } : s
    ))

    // Server sync
    await apiClient.patch(`/portfolio-sections/${id}`, { content })
  }

  return (
    <BuilderContext.Provider value={{ sections, updateSection, ... }}>
      {children}
    </BuilderContext.Provider>
  )
}
```

---

## Type System

### Database Types

Auto-generated from Supabase schema:

```typescript
// lib/supabase/types.ts (auto-generated)
export interface Database {
  public: {
    Tables: {
      portfolios: {
        Row: { id: string; title: string; ... }
        Insert: { title: string; ... }
        Update: { title?: string; ... }
      }
    }
  }
}
```

### Domain Types

Application-specific types:

```typescript
// types/portfolio.ts
export type SectionType =
  | 'summary'
  | 'experience'
  | 'skills'
  | 'certifications'
  | 'custom'

export type Tone =
  | 'concise'
  | 'formal'
  | 'casual'
  | 'senior'
  | 'technical'

export interface AIAnalysisResult {
  score: number
  feedback: string[]
  recommendations: string[]
}
```

### API Types

Request/response types:

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

---

## Performance Considerations

### Server Components

- Default to server components for data fetching
- Reduces client-side JavaScript
- Better SEO and initial load performance

### Caching Strategy

```typescript
// Revalidation patterns
export const revalidate = 60 // Revalidate every 60 seconds

// On-demand revalidation
revalidatePath('/dashboard/portfolios')
revalidateTag('portfolios')
```

### Optimistic Updates

```typescript
async function handleDelete(id: string) {
  const previousSections = sections

  // Optimistic update
  setSections(sections.filter(s => s.id !== id))

  try {
    await apiClient.delete(`/portfolio-sections/${id}`)
  } catch (error) {
    // Rollback on error
    setSections(previousSections)
    toast.error('Failed to delete section')
  }
}
```

### Code Splitting

```typescript
// Dynamic imports for heavy components
const AIAnalyzer = dynamic(
  () => import('@/components/portfolio-builder/AIPortfolioAnalyzer'),
  { loading: () => <LoadingSpinner /> }
)
```

---

## Security Architecture

### Authentication Flow

1. **Middleware** - Protects routes at the edge
2. **Session Utilities** - Type-safe session access in components
3. **RLS Policies** - Database-level access control

### Data Access Control

```sql
-- Row Level Security
CREATE POLICY "Users can only access own portfolios"
ON portfolios
FOR ALL
USING (auth.uid() = user_id);
```

### Input Validation

```typescript
// All inputs validated with Zod
const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.record(z.unknown()),
})

const validated = schema.parse(input)
```

---

## Testing Architecture

### Unit Tests

```typescript
// Test individual functions
describe('suggestTags', () => {
  it('returns relevant tags for content', async () => {
    const tags = await suggestTags({ summary: 'Software engineer...' })
    expect(tags).toContain('software-engineering')
  })
})
```

### Integration Tests

```typescript
// Test API routes
describe('POST /api/v1/portfolios', () => {
  it('creates a new portfolio', async () => {
    const response = await request(app)
      .post('/api/v1/portfolios')
      .send({ title: 'My Portfolio' })

    expect(response.status).toBe(201)
  })
})
```

### E2E Tests

```typescript
// Test user flows with Playwright
test('user can create portfolio', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('text=New Portfolio')
  await page.fill('[name=title]', 'My Portfolio')
  await page.click('text=Create')

  await expect(page).toHaveURL(/\/dashboard\/portfolios\//)
})
```

---

## Further Reading

- [Deployment Guide](../deployment-guide.md)
- [Authentication](../features/authentication.md)
- [API Versioning](../api/api-versioning.md)
- [Middleware](../features/middleware.md)
