# Portfolio Forge

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)
![Groq](https://img.shields.io/badge/AI-Groq-orange?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-82%20passing-brightgreen?style=for-the-badge)

A modern, AI-powered portfolio management platform built with Next.js 14+, Supabase, and Groq AI.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Reference](#-api-reference)

</div>

---

## Features

### Portfolio Builder
- **Drag-and-drop interface** for creating professional portfolios
- **Multiple templates** - Single column, two-column, grid, timeline layouts
- **Customizable themes** - Professional, modern, creative, minimal, elegant
- **Real-time preview** of changes

### AI-Powered Features (10+ capabilities)
| Feature | Description |
|---------|-------------|
| **Text Improvement** | Rewrite text in 5 tones: concise, formal, casual, senior, technical |
| **Summary Generation** | Create professional summaries from portfolio content |
| **Tag Suggestions** | AI-powered tags with confidence scores |
| **Experience Bullets** | Generate STAR-method bullet points |
| **Portfolio Analysis** | Comprehensive scoring with actionable feedback |
| **Job Optimization** | Tailor portfolio for specific job descriptions |
| **Resume Import** | Convert resume text to structured portfolio |
| **Template Recommendations** | Get AI suggestions based on your content |
| **Batch Rewrite** | Rewrite entire portfolio sections at once |
| **Theme Recommendations** | Optimal theme based on content style |

### Enterprise-Ready Security
- **Supabase Auth** with Row-Level Security (RLS)
- **API Rate Limiting** (configurable per-route)
- **Request Validation** via Zod schemas
- **Centralized Error Handling**

### Modern Architecture
- **Next.js 14+ App Router** with server components
- **TypeScript** throughout with strict typing
- **API Versioning** (v1 namespace)
- **Modular AI Layer** (provider → router → abilities → agents)

---

## Quick Start

### Prerequisites

- **Node.js 18+** and npm/yarn/pnpm
- **Supabase account** ([supabase.com](https://supabase.com))
- **Groq API key** ([console.groq.com](https://console.groq.com))
- **(Optional) Upstash Redis** for production rate limiting ([upstash.com](https://upstash.com))

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/portfolio-forge.git
cd portfolio-forge

# Install dependencies
npm install
```

### 2. Configure Supabase

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up (2-3 minutes)

#### B. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL to create tables, policies, and seed data
4. Verify tables exist in **Table Editor**

#### C. Configure Storage
1. Go to **Storage** in Supabase dashboard
2. Copy contents of `supabase/storage-buckets.sql`
3. Run in SQL Editor to create storage buckets with policies

#### D. Enable Authentication Providers
1. Go to **Authentication > Providers**
2. Enable **Google**, **GitHub**, and **LinkedIn**
3. Configure OAuth credentials:
   - **Callback URL**: `https://your-project.supabase.co/auth/v1/callback`
   - Add your redirect URLs in each provider's settings

#### E. Get API Credentials
1. Go to **Settings > API**
2. Copy:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `gsk_...`)

### 4. (Optional) Set Up Redis Rate Limiting

For production-grade rate limiting:

1. Go to [upstash.com](https://upstash.com) and create account
2. Create a new Redis database
3. Select **Serverless** plan (free tier available)
4. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**

**Note:** App works without Redis (uses in-memory fallback), but won't scale across multiple instances.

### 5. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# =============================================================================
# REQUIRED - Get from Supabase Settings > API
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# REQUIRED - Get from Groq Console
# =============================================================================
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# =============================================================================
# OPTIONAL - Production Rate Limiting (uses in-memory if not set)
# =============================================================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# =============================================================================
# OPTIONAL - Rate Limit Configuration
# =============================================================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_API_MAX=100
RATE_LIMIT_API_WINDOW=60
RATE_LIMIT_AI_MAX=20
RATE_LIMIT_AI_WINDOW=60
```

See [.env.example](.env.example) for all available options.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Create Your First User

1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Click "Sign in with Google" (or GitHub/LinkedIn)
3. Complete OAuth flow
4. You'll be redirected to `/dashboard`

### Verify Installation

Run tests to ensure everything is configured correctly:

```bash
npm test
```

You should see **82 tests passing**.

---

## Troubleshooting

### "Supabase client not initialized"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`
- Restart development server after changing env vars

### "Failed to fetch portfolios"
- Check database schema is created (run `supabase/schema.sql`)
- Verify RLS policies are enabled in Supabase dashboard
- Check browser console for specific error messages

### "AI features not working"
- Verify `GROQ_API_KEY` is valid
- Check Groq API quota at [console.groq.com](https://console.groq.com)
- Ensure key has permissions for `llama-3.3-70b-versatile` model

### OAuth redirect not working
- Add `http://localhost:3000` to allowed redirect URLs in OAuth providers
- Check callback URL is `https://your-project.supabase.co/auth/v1/callback`
- Enable the provider in Supabase Authentication settings

### Rate limiting errors in production
- Set up Upstash Redis for distributed rate limiting
- Or disable rate limiting: `RATE_LIMIT_ENABLED=false`

---

## Project Structure

```
portfolio-forge/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages (login, signup)
│   ├── api/v1/                   # Versioned API routes
│   │   ├── ai/                   # AI endpoints (10 routes)
│   │   ├── portfolios/           # Portfolio CRUD + features
│   │   ├── certifications/       # Certification management
│   │   └── tags/                 # Tag system
│   ├── dashboard/                # Protected dashboard pages
│   └── p/[token]/                # Public portfolio viewing
│
├── components/                   # React components
│   ├── portfolio-builder/        # Builder UI components
│   ├── portfolio-sections/       # Section type renderers
│   ├── portfolio-templates/      # Template components
│   ├── portfolio-themes/         # Theme providers
│   ├── certifications/           # Certification UI
│   └── tags/                     # Tag selector
│
├── lib/                          # Core libraries
│   ├── ai/                       # AI integration layer
│   │   ├── abilities/            # Single-purpose AI functions
│   │   ├── agent.ts              # Multi-step AI workflows
│   │   ├── provider.ts           # Groq API client
│   │   └── router.ts             # Provider abstraction
│   ├── api/                      # API utilities
│   │   ├── client.ts             # Frontend API client
│   │   ├── route-handler.ts      # Error handling wrapper
│   │   ├── auth-middleware.ts    # Auth utilities
│   │   └── rate-limit.ts         # Rate limiting middleware
│   ├── config/                   # Centralized configuration
│   ├── validation/               # Zod schemas & helpers
│   └── supabase/                 # Supabase client setup
│
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript definitions
├── docs/                         # Documentation
│   ├── architecture/             # Design documents
│   ├── api/                      # API documentation
│   ├── features/                 # Feature guides
│   └── examples/                 # Code examples
│
├── supabase/                     # Database schema
│   ├── schema.sql                # Main schema
│   └── storage-buckets.sql       # Storage configuration
│
└── __mocks__/                    # Jest mocks
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/architecture/ARCHITECTURE_REVIEW.md](docs/architecture/ARCHITECTURE_REVIEW.md) | Architecture assessment (8.5/10) |
| [docs/architecture/ARCHITECTURE_DEEP_DIVE.md](docs/architecture/ARCHITECTURE_DEEP_DIVE.md) | Code patterns & recommendations |
| [docs/api/api-versioning.md](docs/api/api-versioning.md) | API versioning strategy |
| [docs/features/authentication.md](docs/features/authentication.md) | Auth system documentation |

---

## API Reference

All API routes are under `/api/v1` namespace with rate limiting enabled.

### Portfolios

```
GET    /api/v1/portfolios              # List user's portfolios
POST   /api/v1/portfolios              # Create portfolio
GET    /api/v1/portfolios/:id          # Get portfolio details
PATCH  /api/v1/portfolios/:id          # Update portfolio
DELETE /api/v1/portfolios/:id          # Delete portfolio
POST   /api/v1/portfolios/:id/public-link  # Generate public share link
```

### AI Endpoints (Rate limited: 20/min)

```
POST   /api/v1/ai/improve-text               # Improve text with tone
POST   /api/v1/ai/generate-summary           # Generate portfolio summary
POST   /api/v1/ai/suggest-tags               # Get tag suggestions
POST   /api/v1/ai/generate-experience-bullets # Generate bullet points
POST   /api/v1/ai/analyze-portfolio          # Analyze portfolio quality
POST   /api/v1/ai/recommend-template-theme   # Get recommendations
POST   /api/v1/ai/rewrite-portfolio          # Batch rewrite sections
POST   /api/v1/ai/optimize-portfolio-for-job # Job-specific optimization
POST   /api/v1/ai/generate-portfolio-from-resume # Import from resume
```

### Certifications

```
GET    /api/v1/certifications          # List certifications
POST   /api/v1/certifications          # Create certification
GET    /api/v1/certifications/:id      # Get certification
PATCH  /api/v1/certifications/:id      # Update certification
DELETE /api/v1/certifications/:id      # Delete certification
```

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern="rate-limit"

# Watch mode
npm test -- --watch
```

**Current Status:** 82 tests passing

---

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
```

### Database Setup

1. Create a new Supabase project
2. Run the schema from `supabase/schema.sql`
3. Set up storage buckets from `supabase/storage-buckets.sql`
4. Enable Row-Level Security on all tables
5. Configure authentication providers

### Generate Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
```

---

## Architecture Highlights

### AI Layer Design

```
┌─────────────────┐
│   API Routes    │  HTTP endpoints (/api/v1/ai/*)
└────────┬────────┘
         │
┌────────▼────────┐
│     Agents      │  Complex multi-step workflows
└────────┬────────┘
         │
┌────────▼────────┐
│   Abilities     │  Single-purpose AI functions
└────────┬────────┘
         │
┌────────▼────────┐
│     Router      │  Provider abstraction layer
└────────┬────────┘
         │
┌────────▼────────┐
│    Provider     │  Groq API integration
└─────────────────┘
```

### Request Flow

```
Request → Rate Limit → Auth → Validation → Handler → Response
            ↓            ↓         ↓
         429 Error   401 Error  400 Error
```

---

## Security

- **Row-Level Security (RLS)** - All database tables protected
- **API Authentication** - JWT-based via Supabase Auth
- **Rate Limiting** - Configurable per endpoint type
- **Input Validation** - Zod schemas on all routes
- **Error Handling** - Centralized with no stack trace leakage

---

## Roadmap

### Completed
- [x] Core portfolio builder
- [x] 10 AI features
- [x] API versioning (v1)
- [x] Rate limiting middleware
- [x] Zod validation
- [x] Centralized config
- [x] Test infrastructure (82 tests)

### In Progress
- [ ] Component refactoring (split large files)
- [ ] API client migration in components
- [ ] Redis-backed rate limiting

### Planned
- [ ] OpenAPI documentation
- [ ] Error monitoring (Sentry)
- [ ] Background job processing
- [ ] Multi-provider AI support
- [ ] E2E tests (Playwright)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Groq](https://groq.com/) - AI inference
- [dnd-kit](https://dndkit.com/) - Drag and drop
- [Zod](https://zod.dev/) - Schema validation
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

<div align="center">

**[Back to top](#portfolio-forge)**

Built with Next.js, Supabase, and Groq AI

</div>
