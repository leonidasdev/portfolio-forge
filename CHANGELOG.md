# Changelog

All notable changes to Portfolio Forge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Global error boundary (`app/global-error.tsx`) for graceful error handling
- Custom 404 page (`app/not-found.tsx`) with navigation options
- Dashboard-specific error boundary (`app/dashboard/error.tsx`)
- Consolidated error classes in `lib/api/errors.ts`:
  - `ApiError`, `AuthError`, `ValidationError`, `NotFoundError`, `RateLimitError`
  - Type guards for error identification
- Structured logger (`lib/logger.ts`) with:
  - Log levels (debug, info, warn, error)
  - JSON output for production
  - Child loggers for different domains
  - Timing utilities
- Application constants (`lib/constants.ts`) for:
  - Validation limits
  - Rate limiting values
  - Cache durations
  - UI constants
  - Standard error/success messages
- CI/CD pipeline (`.github/workflows/ci.yml`) with:
  - Linting
  - Type checking
  - Testing
  - Build verification
- GitHub templates:
  - Pull request template
  - Bug report template
  - Feature request template
- Security documentation (`SECURITY.md`)
- Contribution guidelines (`CONTRIBUTING.md`)
- CLAUDE.md - AI assistant context file for project continuity

### Changed
- Updated route handler to use centralized logger
- Consolidated duplicate `ApiError` classes from client.ts and route-handler.ts
- Fixed Jest configuration for ts-jest v30 (removed deprecated `isolatedModules`)
- Improved type safety across codebase (~100% reduction in `any` types, except Supabase query limitations)
- **Next.js 15.5 compatibility:** Added Suspense boundaries and async params handling
- Migrated ESLint to flat config format (`eslint.config.mjs`)
- Documented Supabase query type safety as technical debt in TODO.md

### Fixed
- Parsing errors in API routes (`suggest-tags`, `portfolio-sections`)
- Rate limit test async/await issues (7 tests)
- Unused variable warnings (~30 files)
- `prefer-const` warnings (4 files)
- `react/no-unescaped-entities` errors (2 files)
- Next.js 15.5 async params in dynamic routes (`[id]`, `[token]`)
- Next.js 15.5 `useSearchParams()` Suspense boundary requirements

## [0.1.0] - 2026-01-31

### Added
- Initial release of Portfolio Forge
- Core portfolio management features:
  - Create, edit, delete portfolios
  - Multiple section types (summary, experience, education, skills, projects, certifications)
  - Custom sections support
- AI-powered features:
  - Resume parsing and portfolio generation
  - Job-optimized portfolio rewriting
  - Smart tag suggestions
  - Text improvement
  - Template recommendations
  - Portfolio analysis
- Multiple portfolio templates:
  - Single Column
  - Two Column
  - Timeline
  - Grid
- Theme customization:
  - Multiple color themes
  - Typography options
- Certification management:
  - Upload and organize certifications
  - Tag-based filtering
  - File storage with Supabase
- Authentication:
  - Supabase Auth integration
  - OAuth support (GitHub, Google)
  - Email/password authentication
- Sharing features:
  - Public portfolio links
  - Token-based access control
- API:
  - RESTful API design (`/api/v1/`)
  - Rate limiting
  - Input validation with Zod
  - Standardized error responses

### Security
- Row Level Security (RLS) on all database tables
- Rate limiting for all endpoints
- Input validation on all routes
- XSS protection via React

---

## Version Guidelines

### Version Numbering
- **Major (X.0.0):** Breaking changes, major feature overhauls
- **Minor (0.X.0):** New features, non-breaking changes
- **Patch (0.0.X):** Bug fixes, security patches

### Release Types
- **Alpha:** Early testing, may be unstable
- **Beta:** Feature complete, testing phase
- **RC:** Release candidate, final testing
- **Stable:** Production ready

[Unreleased]: https://github.com/leonidasdev/portfolio-forge/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/leonidasdev/portfolio-forge/releases/tag/v0.1.0
