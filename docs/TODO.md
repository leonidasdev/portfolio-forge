# Portfolio Forge - Comprehensive TODO List

**Analysis Date:** February 26, 2026
**Last Reviewed:** February 26, 2026
**Analyst:** GitHub Copilot
**Project Version:** 0.1.0

---

## Executive Summary

Portfolio Forge is a **well-architected Next.js 15+ application** with solid fundamentals. The codebase demonstrates good practices in API design, authentication, and AI integration. Most critical items have been completed. Focus now shifts to feature completion and polish.

### Overall Assessment Scores

| Category               | Score    | Status                                                                          |
| ---------------------- | -------- | ------------------------------------------------------------------------------- |
| **Architecture**       | 9/10     | Excellent (clean layers, modularity, separation of concerns)                    |
| **Code Quality**       | 9/10     | Excellent (typed queries, constants, logger, hooks, UI lib)                     |
| **Documentation**      | 9.5/10   | Excellent (SECURITY, CHANGELOG, DEPLOYMENT, RATE_LIMITING, API Reference)       |
| **Testing**            | 8.5/10   | Great (388 tests, E2E, coverage gaps: auth flows, visual regression)            |
| **Linting/Formatting** | 9.5/10   | Excellent (4 warnings, pre-commit hooks)                                        |
| **CI/CD**              | 8/10     | Good (lint, typecheck, test, build jobs, missing preview deploys)               |
| **Security**           | 8/10     | Good (RLS, SECURITY.md, error boundaries)                                       |
| **Production Readiness**| 8/10    | Good (error handling, loading states, missing GitHub OAuth for export)          |
| **UI/UX**              | 8/10     | Good (component library complete, missing dark mode)                            |
| **Features**           | 7.5/10   | Good (core complete, GitHub Pages export in progress)                           |

---

## Current Sprint - Active Priorities

### HIGH PRIORITY

| # | Task | Status | Effort |
|---|------|--------|--------|
| 1 | Complete GitHub Pages Export (Phase 4, 6) | COMPLETED | High |
| 2 | Add CI/CD preview deployments (Vercel) | Not Started | Medium |
| 3 | E2E tests for authenticated flows | Not Started | Medium |
| 4 | Fix 4 ESLint warnings (unused userId) | Not Started | Low |

### MEDIUM PRIORITY

| # | Task | Status | Effort |
|---|------|--------|--------|
| 5 | Increase test coverage to 70% | Not Started | Medium |
| 6 | Complete accessibility audit | Not Started | Medium |
| 7 | Update architecture docs (export/github) | COMPLETED | Low |
| 8 | Add dark mode support | Not Started | High |

### LOW PRIORITY

| # | Task | Status | Effort |
|---|------|--------|--------|
| 9 | Performance optimizations (React Query) | Not Started | High |
| 10 | Create Postman API collection | Not Started | Low |
| 11 | Add Docker support for local dev | Not Started | Medium |
| 12 | Visual regression tests | Not Started | Medium |
| 13 | Replace console.* with logger | Not Started | Low |

---

## Table of Contents

1. [Critical Issues (P0)](#1-critical-issues-p0---fix-immediately)
2. [High Priority (P1)](#2-high-priority-p1---fix-before-deploy)
3. [Medium Priority (P2)](#3-medium-priority-p2---next-sprint)
4. [Low Priority (P3)](#4-low-priority-p3---future-improvements)
5. [Documentation TODOs](#5-documentation-todos)
6. [Infrastructure TODOs](#6-infrastructure-todos)
7. [Testing TODOs](#7-testing-todos)
8. [Implementation Checklist](#implementation-checklist)

---

## 1. Critical Issues (P0) - Fix Immediately

### 1.1 Parsing Errors in API Routes

**Status:** COMPLETED

**Files Affected:**

- `app/api/v1/ai/suggest-tags/route.ts` - Fixed
- `app/api/v1/portfolio-sections/[id]/route.ts` - Fixed

**Action Items:**

- [x] Fix syntax error in `suggest-tags/route.ts`
- [x] Fix syntax error in `portfolio-sections/[id]/route.ts`
- [x] Run `npm run build` to verify compilation

---

### 1.2 Missing CI/CD Pipeline

**Status:** COMPLETED

**Files Created:**

- `.github/workflows/ci.yml` - Lint, typecheck, test, build pipeline
- `.github/pull_request_template.md` - PR template
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template

**Action Items:**

- [x] Create `.github/workflows/ci.yml` for automated testing
- [x] Create PR template
- [x] Create issue templates
- [ ] Configure Vercel deployment (or alternative)
- [x] Add pre-commit hooks with Husky

---

### 1.3 Missing Essential Project Files

**Status:** COMPLETED

**Files Created:**

- `LICENSE` - Apache License 2.0
- `CONTRIBUTING.md` - Comprehensive contribution guidelines

**Action Items:**

- [x] Create `CONTRIBUTING.md` with contribution guidelines
- [x] Create `LICENSE` file (Apache 2.0)
- [x] Verify `.env.example` contains all required variables

---

### 1.4 ESLint Configuration Issues

**Status:** COMPLETED

**Files Created/Updated:**

- `.eslintrc.json` - Comprehensive ESLint configuration
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Prettier ignore patterns
- `package.json` - Added lint:fix, format, typecheck, validate scripts

**Action Items:**

- [x] Migrate from `next lint` to ESLint CLI (gradual migration configured)
- [x] Create comprehensive `.eslintrc.json` configuration
- [x] Create `.prettierrc` for consistent formatting
- [x] Fix all parsing errors (2 files)
- [x] Fix all `@typescript-eslint/no-unused-vars` warnings (30+ files fixed)
- [x] Fix `react/no-unescaped-entities` errors (2 files)
- [x] Fix `prefer-const` errors (4 files)
- [x] Fix rate-limit test async/await issues (7 tests fixed)
- [x] Reduce `@typescript-eslint/no-explicit-any` warnings (from 98 to 49)
- [x] **COMPLETED** Fix all remaining `any` types (49 to 0 warnings)

---

## 2. High Priority (P1) - Fix Before Deploy

### 2.1 Type Safety Improvements

**Status:** COMPLETED
**Progress:** Reduced from 98 to 0 `any` types (100% fixed)

**Files Fixed:**
- `lib/api/route-handler.ts` - Defined LogData interface
- `lib/api/client.ts` - Used `unknown` instead of `any`
- `lib/validation/helpers.ts` - Defined ZodIssue interface
- `lib/api/rate-limit.ts` - Updated RouteHandler types
- `lib/ai/agents/*.ts` - Defined content interfaces
- Various component files with proper typing
- `lib/api/__tests__/route-handler.test.ts` - MockRequest/MockResponse interfaces
- `lib/api/__tests__/auth-middleware.test.ts` - MockRequest interface
- `lib/validation/__tests__/helpers.test.ts` - createMockRequest with NextRequest
- `components/portfolio-builder/SectionEditor.tsx` - SectionContent union types

**All `any` Types Eliminated (January 31, 2026):**
| Location | Original | Fixed | Solution |
|----------|----------|-------|----------|
| Test files | ~30 | 0 | Typed mock interfaces |
| SectionEditor.tsx | ~13 | 0 | SectionContent union type |
| validation/helpers.ts | ~3 | 0 | ZodIssue interface |
| Dynamic content | ~3 | 0 | Proper type assertions |

**Action Items:**
- [x] Create proper type definitions in `types/` folder
- [x] Replace `any` with `unknown` where input type is uncertain
- [x] Create specific types for API responses
- [x] Use type guards instead of `any` casts
- [x] Fixed all remaining `any` types

---

### 2.2 Component Refactoring (Large Files)

**Status:** âœ… COMPLETED
**Previous State (before refactoring):**
- `Builder.tsx` - Was ~1150 lines â†’ Now ~209 lines (uses BuilderContext)
- `SectionEditor.tsx` - Was ~759 lines â†’ Now ~459 lines (uses editors/)
- `CertificationForm.tsx` - Was ~547 lines â†’ Now ~350 lines (uses form/)

**Files Created:**
- `components/portfolio-builder/BuilderContext.tsx` - State management
- `components/portfolio-builder/editors/` - Individual section editors
- `components/portfolio-builder/toolbars/` - AI toolbar components
- `components/certifications/form/FormField.tsx` - Reusable form inputs
- `components/certifications/form/CertificationTypeSelector.tsx` - Type selector
- `components/certifications/form/FileUpload.tsx` - File upload component
- `components/certifications/form/FormActions.tsx` - Submit/cancel buttons
- `components/certifications/form/index.ts` - Barrel exports
- `components/certifications/CertificationFormRefactored.tsx` - Refactored form
- `components/certifications/index.ts` - Component exports

**Action Items:**
- [x] Split `Builder.tsx` into smaller components:
  - [x] `AIFeatures.tsx` - AI feature container (already modular: AI*.tsx)
  - [x] `SectionList.tsx` - Section management (SectionCard.tsx)
  - [x] Use `BuilderContext.tsx` for state management
- [x] Split `SectionEditor.tsx`:
  - [x] Create individual editors in `editors/` folder
  - [x] SummaryEditor, SkillsEditor, WorkExperienceEditor, etc.
- [x] Split `CertificationForm.tsx`:
  - [x] Separate form logic from file upload (FileUpload.tsx)
  - [x] Extract validation logic (validateForm function)
  - [x] Create reusable form field components (FormField.tsx)

---

### 2.3 Hooks Are Not Actually React Hooks

**Status:** âœ… COMPLETED
**Location:** `hooks/` directory

**Files Updated:**
- `useImproveText.ts` - Now a proper React hook with loading/error states
- `useGenerateSummary.ts` - Now a proper React hook with loading/error states
- `useSuggestTags.ts` - Now a proper React hook with loading/error states
- `useAIRequest.ts` - NEW: Generic hook for any AI endpoint
- `index.ts` - NEW: Re-exports all hooks

**Features Added:**
- `isLoading` state for UI feedback
- `error` state for error handling
- `result` state for caching last result
- `reset()` method to clear state
- Backward-compatible standalone functions (marked @deprecated)

**Action Items:**
- [x] Convert to actual React hooks with loading/error states
- [x] Create generic `useAIRequest<T>` hook for common patterns
- [x] Create index.ts for convenient imports

---

### 2.4 Rate Limiting Production Readiness

**Status:** âœ… COMPLETED
**Documentation Created:**
- `docs/rate-limiting.md` - Comprehensive rate limiting guide

**Contents:**
- Architecture overview
- Rate limit configurations
- Development vs Production mode
- Redis setup (Upstash, Redis Cloud, self-hosted)
- Rate limit headers documentation
- Client-side error handling
- Monitoring and troubleshooting
- Best practices

**Action Items:**
- [x] Document Redis requirement for production
- [x] Create fallback strategy documentation
- [x] Document rate limit headers (`X-RateLimit-*`)
- [ ] Add health check endpoint for Redis connection
- [ ] Test rate limiting with Upstash Redis

---

### 2.5 Error Boundaries and Loading States

**Status:** âœ… COMPLETED
**Files Created:**
- `app/global-error.tsx` - Global error boundary
- `app/dashboard/error.tsx` - Dashboard error boundary
- `app/dashboard/loading.tsx` - Dashboard loading skeleton
- `app/dashboard/portfolios/error.tsx` - Portfolios error boundary
- `app/dashboard/portfolios/loading.tsx` - Portfolios loading skeleton
- `app/dashboard/certifications/error.tsx` - Certifications error boundary
- `app/dashboard/certifications/loading.tsx` - Certifications loading skeleton
- `app/not-found.tsx` - Custom 404 page

**Action Items:**
- [x] Create `app/global-error.tsx` global error boundary
- [x] Create `app/not-found.tsx` custom 404 page
- [x] Add `error.tsx` to `/dashboard`, `/portfolios`, `/certifications`
- [x] Add `loading.tsx` with skeleton components
- [ ] Implement proper Suspense boundaries (deferred)

---

### 2.6 Reusable UI Component Library

**Status:** âœ… COMPLETED
**Files Created:**
- `components/ui/Skeleton.tsx` - Reusable skeleton loading components
- `components/ui/index.ts` - UI component barrel exports
- `lib/utils.ts` - Utility functions (cn, formatRelativeTime, debounce, etc.)

**Skeleton Components:**
- `Skeleton` - Basic skeleton element with pulse animation
- `SkeletonText` - Multi-line text skeleton
- `SkeletonAvatar` - Avatar/profile image skeleton (sm, md, lg)
- `SkeletonButton` - Button skeleton (sm, md, lg)
- `SkeletonCard` - Card component skeleton with image and text
- `SkeletonTable` - Table skeleton with configurable rows/columns
- `SkeletonListItem` - List item skeleton with avatar

**Utility Functions:**
- `cn()` - Tailwind class merging (clsx + tailwind-merge)
- `formatRelativeTime()` - Date formatting ("2 days ago")
- `truncate()` - String truncation with ellipsis
- `capitalize()` - First letter capitalization
- `generateId()` - Random ID generation
- `deepClone()` - Object deep cloning
- `debounce()` - Function debouncing
- `isBrowser()` - Browser detection
- `sleep()` - Async sleep utility

**Dependencies Added:**
- `clsx` - Conditional class construction
- `tailwind-merge` - Tailwind class conflict resolution

**Action Items:**
- [x] Create reusable Skeleton component library
- [x] Update loading.tsx files to use Skeleton components
- [x] Create lib/utils.ts with common utilities
- [ ] Add more UI components (Button, Input, Card, etc.) as needed

---

### 2.7 GitHub Pages Portfolio Export

**Status:** COMPLETED (All core functionality implemented)
**Priority:** HIGH - Key feature for developer portfolio hosting

**Overview:**
Enable users to export their portfolio as a static site and deploy it directly to GitHub Pages. This provides developers with:
- Portfolio hosted at `username.github.io/portfolio` or custom domain
- Free, reliable hosting on GitHub's infrastructure
- Portfolio visible on their GitHub profile
- Version-controlled portfolio with git history

**Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Portfolio Forge App                       │
├─────────────────────────────────────────────────────────────┤
│  1. User clicks "Export to GitHub Pages"                    │
│  2. Static HTML/CSS/JS generated from portfolio data        │
│  3. User provides GitHub Personal Access Token              │
│  4. Creates/updates repo: username/portfolio (or custom)    │
│  5. Pushes static files + GitHub Actions workflow           │
│  6. GitHub Pages automatically deploys                      │
└─────────────────────────────────────────────────────────────┘
```

**Phase 1: Static Export Engine** [COMPLETED]
- [x] Create `lib/export/static-generator.ts` - Core export logic
- [x] Create `lib/export/html-renderer.ts` - Render portfolio to HTML
- [x] Create `lib/export/types.ts` - Type definitions
- [x] Support all templates (single-column, two-column, grid, timeline)
- [x] Support all themes via CSS variables
- [x] Generate optimized output with meta tags for SEO (og:image, description, etc.)
- [x] Generate 404.html, robots.txt, sitemap.xml, CNAME
- [x] Generate GitHub Actions workflow for auto-deployment

**Phase 2: GitHub Integration** [COMPLETED]
- [x] Create `lib/github/client.ts` - GitHub API client
- [x] Create repository management functions
- [x] Create commit/push functionality via GitHub API
- [x] Create GitHub Pages deployment function
- [x] GitHub token input flow in UI (user provides PAT)

**Phase 3: Export API Routes** [COMPLETED]
- [x] `POST /api/v1/export/github` - Trigger GitHub Pages export
- [x] `POST /api/v1/export/download` - Download as ZIP
- [x] Rate limiting for export endpoints (5 req/min)

**Phase 4: GitHub Pages Deployment** [COMPLETED]
- [x] Generate `.github/workflows/deploy.yml` for automatic deployment
- [x] Support custom domains via CNAME file
- [x] Handle repository naming (username/portfolio-name)

**Phase 5: Dashboard UI** [COMPLETED]
- [x] Create `components/export/GitHubExportButton.tsx`
- [x] Create `components/export/DownloadExportButton.tsx`
- [x] Config modal for repo settings
- [x] Success/error modals
- [x] GitHub token input with validation
- [x] Re-deploy functionality (same flow, updates existing repo)

**Files Created:**
```
lib/
├── export/
│   ├── types.ts               [DONE] Export types and interfaces
│   ├── static-generator.ts    [DONE] Main export orchestrator
│   ├── html-renderer.ts       [DONE] Portfolio → HTML conversion
│   └── index.ts               [DONE] Barrel exports
├── github/
│   ├── client.ts              [DONE] GitHub API client
│   └── index.ts               [DONE] Barrel exports

app/api/v1/
├── export/
│   ├── github/
│   │   └── route.ts           [DONE] POST - trigger export
│   └── download/
│       └── route.ts           [DONE] POST - download ZIP

components/export/
├── GitHubExportButton.tsx     [DONE]
├── DownloadExportButton.tsx   [DONE]
└── index.ts                   [DONE]
```

**Database Changes:**
```sql
-- Add to schema.sql
CREATE TABLE portfolio_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL DEFAULT 'github_pages', -- 'github_pages', 'zip', 'netlify', etc.
  github_repo_url TEXT,
  github_pages_url TEXT,
  last_deployed_at TIMESTAMPTZ,
  last_commit_sha TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'building', 'deployed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE portfolio_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own exports"
  ON portfolio_exports FOR ALL
  USING (auth.uid() = user_id);
```

**Environment Variables:**
```env
# GitHub OAuth (for repo access)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
```

**Dependencies to Add:**
- `octokit` - GitHub API client
- `jszip` - ZIP file generation (for download option)
- `html-minifier-terser` - HTML minification
- `clean-css` - CSS minification

**Action Items:**
- [ ] Phase 1: Static Export Engine
- [ ] Phase 2: GitHub Integration
- [ ] Phase 3: Export API Routes
- [ ] Phase 4: GitHub Pages Deployment
- [ ] Phase 5: Dashboard UI
- [ ] Phase 6: Sync & Updates
- [ ] Add comprehensive tests for export functionality
- [ ] Update documentation (deployment-guide.md, api-reference.md)

---

## 3. Medium Priority (P2) - Next Sprint

### 3.1 Remove/Update Deprecated Code

**Status:** [COMPLETED]
**Items:**
- [x] Remove deprecated AI files (`lib/ai/agent.ts` → use `lib/ai/agents/*`)
- [x] All API routes are in `/api/v1/` - No legacy routes found
- [x] Update `jest.config.js` - `isolatedModules` is deprecated in ts-jest v30
- [x] Migrate away from `next lint` before Next.js 16 (migrated to ESLint CLI flat config)

---

### 3.2 Consolidate Duplicate Code

**Status:** âœ… COMPLETED

**Duplicate `ApiError` Class:** FIXED
- [x] Created `lib/api/errors.ts` - Consolidated error classes
- [x] Updated `lib/api/client.ts` - Now imports from errors.ts
- [x] Updated `lib/api/route-handler.ts` - Now imports from errors.ts
- [x] Updated test to use new ApiError signature

**Duplicate Fetch Patterns:**
50+ instances of the same fetch/error handling pattern across components.

**Action Items:**
- [x] Consolidate `ApiError` into single location (`lib/api/errors.ts`)
- [ ] Migrate all components to use `apiClient` from `lib/api/client.ts`
- [ ] Create fetch hooks for common patterns

---

### 3.3 Logging Infrastructure

**Status:** âœ… COMPLETED
**Files Created:**
- `lib/logger.ts` - Structured logging utility

**Features Implemented:**
- Log levels (debug, info, warn, error)
- Environment-aware log filtering (debug hidden in production)
- JSON output for production (easy log aggregation)
- Pretty output for development
- Child loggers for different domains (apiLogger, authLogger, aiLogger, dbLogger)
- Timing utilities (time, timeAsync)
- Request/response logging helpers

**Action Items:**
- [x] Create structured logger (`lib/logger.ts`)
- [x] Update route-handler.ts to use new logger
- [ ] Replace remaining `console.*` with logger calls (gradual migration)
- [ ] Add log levels (debug, info, warn, error) âœ“
- [ ] Configure for production (no debug logs) âœ“
- [ ] Consider integration with logging service (e.g., LogRocket, Sentry)

---

### 3.4 Magic Numbers and Constants

**Status:** âœ… COMPLETED
**Files Created:**
- `lib/constants.ts` - Centralized constants file

**Constants Defined:**
- TEXT_LIMITS: Resume lengths, AI input limits
- FIELD_LIMITS: Form field validation limits
- FILE_LIMITS: File upload size limits
- PAGINATION: Default page sizes
- RATE_LIMITS: API rate limiting values
- CACHE_DURATIONS: Cache TTLs
- TIMEOUTS: API timeout values
- PORTFOLIO: Portfolio-specific limits
- SECTION_TYPES: Available section types
- UI: UI-related constants
- ERROR_MESSAGES: Standardized error messages
- SUCCESS_MESSAGES: Standardized success messages

**Action Items:**
- [x] Create `lib/constants.ts` for validation limits
- [ ] Replace hardcoded values with constants (gradual migration)
- [ ] Document all business rules and constraints
- [ ] Make limits configurable via environment variables where appropriate

---

### 3.5 Database Schema Improvements

**Status:** ðŸŸ¡ MEDIUM
**Issues Identified:**
- Section type enum mismatch between schema and TypeScript
- Missing indexes for common queries
- No migration system in place

**Action Items:**
- [ ] Verify schema enums match TypeScript types
- [ ] Add performance indexes for user_id lookups
- [ ] Document database migration strategy
- [ ] Consider Supabase migrations or Prisma integration

---

## 4. Low Priority (P3) - Future Improvements

### 4.1 Testing Improvements

**Status:** [EXCELLENT] (356+ unit tests, 15+ E2E tests)
**Current State:**
- 19 test files, 356 tests passing (1 skipped)
- Tests cover: lib/api/, lib/validation/, lib/__tests__/, components/ui/, components/tags/, components/portfolio-builder/, app/api/v1/
- Component tests exist for UI library and Builder component
- API route integration tests for tags and portfolios endpoints
- E2E tests with Playwright: auth flows, home page, API endpoints
- Coverage threshold: 50%

**Action Items:**
- [x] Add component tests with React Testing Library (UI components tested)
- [x] Add integration tests for API routes (tags, portfolios)
- [x] Add Builder component tests (13 tests)
- [x] Add E2E tests with Playwright (auth, home, API)
- [ ] Increase coverage threshold to 70%
- [ ] Add snapshot tests for templates/themes

---

### 4.2 API Documentation

**Status:** [COMPLETED]
**Files Created:**
- `docs/api/api-reference.md` - Complete REST API documentation

**Action Items:**
- [x] Generate OpenAPI/Swagger documentation (Created comprehensive Markdown reference)
- [x] Create API reference in docs
- [x] Add request/response examples
- [x] Document rate limits per endpoint
- [ ] Create Postman/Insomnia collection (optional)

---

### 4.3 Accessibility Improvements

**Status:** [PARTIALLY COMPLETED]
**Files Created:**
- `components/ui/__tests__/accessibility.test.tsx` - jest-axe tests for UI components (23 tests)

**Action Items:**
- [x] Install jest-axe for automated accessibility testing
- [x] Add axe-core tests for UI components (Button, Modal, Input, Card, Skeleton)
- [ ] Audit remaining components with axe-core or Lighthouse
- [ ] Add ARIA labels to interactive elements (partially done)
**Action Items:**
- [x] Install jest-axe for automated accessibility testing
- [x] Add axe-core tests for UI components (Button, Modal, Input, Card, Skeleton)
- [ ] Audit remaining components with axe-core or Lighthouse
- [ ] Add ARIA labels to interactive elements (partially done)
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Add skip links

---

### 4.4 Performance Optimizations

**Status:** 🟢
---

### 4.4 Performance Optimizations

**Status:** ðŸŸ¢ LOW
**Action Items:**
- [ ] Add API response caching
- [ ] Implement React Query or SWR for data fetching
- [ ] Optimize images with next/image
- [ ] Add bundle analyzer
- [ ] Implement lazy loading for heavy components

---

### 4.5 UI/UX Improvements

**Status:** âœ… COMPLETED
**Files Created:**
- `components/ui/Button.tsx` - Reusable button with variants, sizes, loading
- `components/ui/Modal.tsx` - Modal, ConfirmModal, AlertModal, useModal, useConfirm hooks
- `components/ui/Toast.tsx` - ToastProvider, useToast hook with notification system
- `components/ui/Input.tsx` - Input, Textarea, Select components
- `components/ui/Card.tsx` - Card, CardHeader, CardBody, CardFooter components
- `components/ui/__tests__/Button.test.tsx` - 24 tests for Button component
- `components/ui/__tests__/Modal.test.tsx` - 32 tests for Modal components
- `components/ui/__tests__/Toast.test.tsx` - 18 tests for Toast system

**Button Component Features:**
- Variants: primary, secondary, outline, ghost, danger, success
- Sizes: sm, md, lg
- Loading state with spinner
- Left/right icon support
- Full width option
- asChild pattern for polymorphic rendering

**Modal System Features:**
- Base Modal with sizes (sm, md, lg, xl)
- ConfirmModal for confirm/cancel dialogs (replaces `confirm()`)
- AlertModal for info/error/success/warning alerts (replaces `alert()`)
- useModal hook for easy state management
- Escape key and backdrop click to close
- Proper accessibility (role=dialog, aria-modal)

**Toast Notification System:**
- ToastProvider wrapper (added to app/layout.tsx)
- useToast hook with success/error/warning/info methods
- Auto-dismiss with configurable duration
- Dismissible with close button
- Multiple toast support with max limit
- Configurable position (top-right, bottom-right, top-left, bottom-left)

**Action Items:**
- [x] Replace `confirm()` and `alert()` with custom modals
- [x] Add toast notifications for actions
- [x] Add loading skeletons (previously completed)
- [ ] Improve form validation UX
- [ ] Implement dark mode support

**Migration Status:** All components migrated to custom modals
- [x] CertificationList.tsx - ConfirmModal + AlertModal
- [x] TagSelector.tsx - ConfirmModal for delete confirmation
- [x] BuilderContext.tsx - State-based modals in provider
- [x] AITemplateRecommender.tsx - AlertModal for info messages
- [x] AIRewritePortfolio.tsx - ConfirmModal + AlertModal
- [x] AIResumeGenerator.tsx - ConfirmModal (danger) + AlertModal (success)
- [x] PortfolioList.tsx - ConfirmModal for delete
- [x] AIJobOptimizer.tsx - AlertModal for success
- [x] AIPortfolioAnalyzer.tsx - No native dialogs found (already clean)

---

### 4.6 Supabase Query Type Safety

**Status:** 🟡 LOW IMPACT / HIGH EFFORT
**Issue:** ESLint warnings for `@typescript-eslint/no-explicit-any` in API routes

**Root Cause:**
Supabase's query builder loses type inference when:
- Using complex joins with nested selects (e.g., `certification_tags -> tags`)
- Building dynamic queries with conditional `.eq()`, `.limit()`, etc.
- The `as any` cast is required to work around TypeScript limitations

**Affected Files:**
- `app/api/v1/certifications/route.ts`
- `app/api/v1/certifications/[id]/route.ts`
- `app/api/v1/certification-tags/route.ts`
- `app/api/v1/portfolio-sections/[id]/route.ts`
- Other API routes with complex Supabase queries

**Potential Solutions (High Effort):**
- [ ] Create typed repository/data access layer with explicit return types
- [ ] Use Supabase's `supabase-js` v2 with generated types more strictly
- [ ] Consider Prisma as an alternative ORM with better TypeScript support
- [ ] Create wrapper functions for common query patterns with proper generics

**Decision:** Keep warnings visible as technical debt reminder. The `any` casts are functionally correct but lose type safety. This is acceptable for now as:
1. Warnings don't block CI/build
2. RLS policies ensure data security
3. Runtime behavior is correct
4. Fixing requires significant refactoring

---

## 5. Documentation TODOs

### 5.1 Missing Documentation

- [x] `CONTRIBUTING.md` - Contribution guidelines
- [x] `LICENSE` - Apache License 2.0 file
- [x] `SECURITY.md` - Security policy and vulnerability reporting
- [x] `CHANGELOG.md` - Version history
- [x] `docs/deployment-guide.md` - Deployment guide
- [x] `docs/development-guide.md` - Local development setup details

### 5.2 Documentation Improvements

- [x] Add architecture diagrams (Mermaid) - `docs/architecture/diagrams.md`
- [ ] Create API reference with examples
- [ ] Add troubleshooting guide
- [ ] Document environment variables completely
- [ ] Add database schema diagram (included in diagrams.md)

### 5.3 Code Documentation

- [ ] Add JSDoc to all exported functions
- [ ] Document complex business logic
- [ ] Add inline comments for AI prompts
- [ ] Create README files for key directories

---

## 6. Infrastructure TODOs

### 6.1 CI/CD Pipeline

```yaml
# Required GitHub Actions workflows:
.github/
â”œâ”€â”€ workflows/
â”‚   â”œâ”€â”€ ci.yml           # Run tests on PR
â”‚   â”œâ”€â”€ lint.yml         # Run linting
â”‚   â”œâ”€â”€ build.yml        # Build verification
â”‚   â”œâ”€â”€ deploy-preview.yml   # Deploy PR previews
â”‚   â””â”€â”€ deploy-production.yml # Production deployment
â”œâ”€â”€ CODEOWNERS           # Code review requirements
â””â”€â”€ pull_request_template.md
```

**Action Items:**
- [ ] Create CI workflow for tests
- [ ] Create lint workflow
- [ ] Create build verification workflow
- [ ] Set up preview deployments (Vercel)
- [ ] Configure production deployment
- [ ] Add branch protection rules
- [ ] Create `CODEOWNERS` file

---

### 6.2 Development Environment

- [x] Create `.vscode/settings.json` for consistent editor config âœ“
- [x] Create `.vscode/extensions.json` with recommended extensions âœ“
- [x] Create `.vscode/launch.json` for debugging âœ“
- [ ] Add Docker support for local development
- [ ] Create `docker-compose.yml` for local Supabase
- [ ] Add `Makefile` or scripts for common tasks

---

### 6.3 Pre-commit Hooks

**Status:** âœ… COMPLETED

**Files Created:**
- `.husky/pre-commit` - Runs lint-staged
- `.husky/pre-push` - Runs typecheck and tests
- `package.json` - Added lint-staged configuration

**Configuration:**
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

**Action Items:**
- [x] Install and configure Husky
- [x] Add pre-commit hook for linting
- [x] Add pre-push hook for tests
- [x] Configure lint-staged for staged files only

---

## 7. Testing TODOs

### 7.1 Current Test Coverage

| Area | Files | Tests | Coverage |
|------|-------|-------|----------|
| `lib/api/` | 4 | ~60 | Good |
| `lib/validation/` | 1 | ~20 | Good |
| `lib/__tests__/` | 2 | ~39 | Good (logger, utils) |
| `components/ui/` | 4 | ~86 | Good (Button, Modal, Toast, Skeleton) |
| `components/tags/` | 1 | ~18 | Good (TagSelector) |
| `components/portfolio-builder/` | 2 | ~35 | Good (Builder, SectionEditor) |
| `components/certifications/` | 1 | ~20 | Good (CertificationForm) |
| `components/portfolio-templates/` | 1 | ~17 | Good (TemplateSelector) |
| API Routes | 2 | ~22 | Good (tags, portfolios) |
| E2E | 3 | ~15 | Good (auth, home, api) |

**Total:** 356 tests passing (1 skipped) + E2E tests with Playwright

### 7.2 Testing Action Items

- [x] Add component tests for UI library (Button, Modal, Toast, Skeleton)
- [x] Add component tests:
  - [x] `Builder.test.tsx` (13 tests)
  - [x] `SectionEditor.test.tsx` (22 tests)
  - [x] `CertificationForm.test.tsx` (20 tests)
  - [x] `TemplateSelector.test.tsx` (17 tests)
- [x] Add API route integration tests (tags, portfolios)
- [x] Add E2E tests with Playwright:
  - [x] Auth flow (login, signup, protected routes)
  - [x] Home page and navigation
  - [x] API endpoint validation
  - [ ] Portfolio creation (requires auth fixtures)
  - [ ] AI features (requires auth fixtures)
- [ ] Add visual regression tests
- [ ] Configure test coverage reporting in CI

---

## Implementation Checklist

### Phase 1: Critical Fixes (Week 1) - COMPLETED
- [x] Fix parsing errors in API routes
- [x] Create `LICENSE` file
- [x] Create `CONTRIBUTING.md`
- [x] Set up basic CI/CD pipeline
- [x] Fix all ESLint parsing errors
- [x] Configure Prettier

### Phase 2: Code Quality (Week 2) - COMPLETED
- [x] Fix all `@typescript-eslint/no-explicit-any` errors
- [x] Fix unused variable warnings
- [x] Set up pre-commit hooks
- [x] Add error boundaries

### Phase 3: Refactoring (Week 3-4) - COMPLETED
- [x] Split large components (Builder, SectionEditor, CertificationForm)
- [x] Consolidate duplicate code (ApiError, UI components)
- [x] Migrate to proper hooks (useImproveText, etc.)
- [x] Add structured logging (lib/logger.ts)

### Phase 4: Testing & Docs (Week 5-6) - IN PROGRESS
- [x] Add component tests (UI library: Button, Modal, Toast)
- [ ] Add API integration tests
- [x] Complete documentation (SECURITY, DEPLOYMENT, RATE_LIMITING)
- [ ] Add E2E tests

### Phase 5: Polish (Week 7+) - PARTIAL
- [ ] Performance optimizations
- [ ] Accessibility audit
- [x] UI/UX improvements (Modal system, Toast notifications)
- [ ] API documentation

### Phase 6: GitHub Pages Export (NEW) - NOT STARTED
- [ ] Create static export engine (`lib/export/`)
- [ ] Add GitHub OAuth and API integration (`lib/github/`)
- [ ] Create export API routes (`/api/v1/export/*`)
- [ ] Implement GitHub Pages deployment workflow
- [ ] Build export UI components
- [ ] Add portfolio sync/re-deploy functionality
- [ ] Update database schema for export tracking
- [ ] Write tests for export functionality

---

## 3. Code Standards & Conventions Review

**Priority:** HIGH
**Status:** IN PROGRESS
**Estimated:** 4-6 hours

A comprehensive audit of coding standards, conventions, and best practices.

### 3.1 Critical Issues (Must Fix)

#### 3.1.1 Excessive `as any` Type Casts (~30+ occurrences)
**Severity:** HIGH | **Effort:** MEDIUM

The codebase has widespread `as any` casts, particularly around Supabase queries. This undermines TypeScript's type safety.

**Locations:**
- `app/dashboard/page.tsx` - 6 occurrences
- `lib/ai/agents/*.ts` - 10+ occurrences
- `components/examples/*.tsx` - 4 occurrences
- `app/dashboard/overview/page.tsx` - Multiple

**Root Cause:** Supabase client types aren't properly inferred from `Database` type.

**Solution:**
- [ ] Create typed query helpers in `lib/supabase/queries.ts`
- [ ] Define explicit return types for all Supabase queries
- [ ] Use generics: `supabase.from<Portfolio>('portfolios')` pattern
- [ ] Consider `@supabase/supabase-js` type augmentation

```typescript
// BAD - Current pattern
const { data } = await (supabase.from('portfolios') as any).select('*')

// GOOD - Proposed pattern
const { data } = await supabase
  .from('portfolios')
  .select('*')
  .returns<Portfolio[]>()
```

#### 3.1.2 Inconsistent Folder Naming in `lib/`
**Severity:** MEDIUM | **Effort:** LOW

Mixed naming conventions in lib folder:
- `templates-themes/` (kebab-case)
- `github/` (single word)
- `export/` (single word)

API routes also inconsistent:
- `certification-tags/` (kebab-case)
- `portfolio-sections/` (kebab-case)
- `portfolios/` (simple plural)

**Solution:**
- [ ] Standardize on kebab-case for multi-word folders
- [ ] Rename `github` → `github` (acceptable as single word)
- [ ] Document naming convention in CONTRIBUTING.md

#### 3.1.3 Missing Return Type Annotations
**Severity:** MEDIUM | **Effort:** MEDIUM

Many exported functions lack explicit return types, relying on inference:

```typescript
// BAD - Current (some files)
export function formatRelativeTime(date: Date | string) { ... }

// GOOD - Should be
export function formatRelativeTime(date: Date | string): string { ... }
```

**Solution:**
- [ ] Add ESLint rule: `@typescript-eslint/explicit-function-return-type`
- [ ] Audit and fix all exported functions

### 3.2 Code Style Issues

#### 3.2.1 Inconsistent Comment Headers
**Severity:** LOW | **Effort:** LOW

Most files use the JSDoc block header style (good), but some are missing:

**Good pattern (consistently used in lib/):**
```typescript
/**
 * Module Name
 *
 * Brief description of what this module does.
 * Additional context if needed.
 */
```

**Files missing headers:**
- Some test files
- Some utility files

**Solution:**
- [ ] Create file header template in CONTRIBUTING.md
- [ ] Add header enforcement (consider ESLint plugin)

#### 3.2.2 Inline Function Documentation Inconsistency
**Severity:** LOW | **Effort:** MEDIUM

Some functions have JSDoc, others don't:

```typescript
// GOOD - Well documented (lib/utils.ts)
/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * @example cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export function cn(...inputs: ClassValue[]) { ... }

// BAD - Missing docs (some components)
export function SectionCard({ section, onEdit, onDelete }: Props) { ... }
```

**Solution:**
- [ ] Define documentation requirements by file type
- [ ] Components: Props interface with JSDoc
- [ ] Hooks: Usage examples required
- [ ] Utils: @param, @returns, @example

#### 3.2.3 Magic Strings in Components
**Severity:** MEDIUM | **Effort:** MEDIUM

Some components have hardcoded strings that should be constants:

```typescript
// BAD - In SectionCard.tsx
case 'summary':
  return 'Summary'
case 'skills':
  return 'Skills'

// GOOD - Should use constants
import { SECTION_TYPE_LABELS } from '@/lib/constants'
return SECTION_TYPE_LABELS[section.section_type]
```

**Solution:**
- [ ] Audit for hardcoded strings
- [ ] Move labels to constants.ts
- [ ] Consider i18n readiness

### 3.3 React/Next.js Conventions

#### 3.3.1 `'use client'` Placement
**Severity:** LOW | **Effort:** LOW

Some files have `'use client'` after JSDoc comments (technically works but inconsistent):

```typescript
// GOOD - Correct order
'use client'

/**
 * Component documentation
 */

// BAD - Some files have
/**
 * Component documentation
 */
'use client'
```

**Status:** Currently consistent - `'use client'` is placed after JSDoc [OK]

#### 3.3.2 Component Props Interface Naming
**Severity:** LOW | **Effort:** LOW

Mixed patterns for props interfaces:

```typescript
// Pattern 1: {ComponentName}Props (most common, good)
interface ButtonProps extends React.ButtonHTMLAttributes<...> { }

// Pattern 2: Inline definition (some places)
export function MyComponent({ prop }: { prop: string }) { }
```

**Solution:**
- [ ] Standardize on `{ComponentName}Props` pattern
- [ ] Document in CONTRIBUTING.md

### 3.4 API Route Conventions

#### 3.4.1 Inconsistent Response Shapes
**Severity:** MEDIUM | **Effort:** MEDIUM

Most routes follow good patterns, but verify all routes return:

```typescript
// GOOD - Success responses
{ portfolios: [...] }           // Collection
{ portfolio: {...} }            // Single resource
{ success: true, message: "" }  // Actions

// GOOD - Error responses (via ApiError)
{ error: "message", code: "ERROR_CODE" }
```

**Solution:**
- [ ] Audit all API routes for response consistency
- [ ] Document response shapes in api-reference.md

#### 3.4.2 Rate Limiting Applied Inconsistently
**Severity:** MEDIUM | **Effort:** LOW

Some routes use `withRateLimit`, others don't:

```typescript
// GOOD - AI routes (correctly rate limited)
export const POST = withRateLimit(withApiHandler(...), rateLimitConfigs.ai)

// NEEDS REVIEW - Some CRUD routes may be missing rate limiting
export const POST = withApiHandler(...)
```

**Solution:**
- [ ] Audit all public/authenticated routes
- [ ] Apply appropriate rate limits to each

### 3.5 Documentation Issues

#### 3.5.1 Markdown Linting Errors in TODO.md
**Severity:** LOW | **Effort:** LOW

Multiple markdown lint warnings:
- Tables missing spacing around pipes
- Lists not surrounded by blank lines
- Fenced code blocks without language

**Solution:**
- [ ] Run `markdownlint --fix` on all .md files
- [ ] Add markdownlint to lint-staged

#### 3.5.2 Stale Documentation
**Severity:** MEDIUM | **Effort:** LOW

Some docs may reference old patterns. Audit:
- [ ] README.md feature list accuracy
- [ ] api-reference.md completeness
- [ ] development-guide.md setup steps

#### 3.5.3 Missing architecture.md Updates
**Severity:** LOW | **Effort:** LOW

New modules (export/, github/) should be added to architecture docs:
- [ ] Add export system to architecture diagram
- [ ] Document GitHub integration flow

### 3.6 Naming Conventions Summary

| Category | Convention | Status |
| -------- | ---------- | ------ |
| Components | PascalCase (`Button.tsx`) | Consistent |
| Hooks | camelCase with 'use' (`useImproveText.ts`) | Consistent |
| Utils | camelCase (`formatDate.ts`) | Consistent |
| Constants | SCREAMING_SNAKE_CASE | Consistent |
| Types | PascalCase | Consistent |
| Interfaces | PascalCase (no I prefix) | Consistent |
| API Routes | kebab-case folders | Mostly consistent |
| Lib folders | kebab-case for multi-word | Needs review |
| Test files | `*.test.ts` / `*.test.tsx` | Consistent |
| CSS classes | Tailwind utilities | Consistent |

### 3.7 Framework Best Practices Checklist

#### Next.js 15 App Router
- [x] Proper `'use client'` usage
- [x] Server Components by default
- [x] API routes in app/api/
- [x] Proper loading.tsx usage
- [x] Proper error.tsx boundaries
- [ ] Metadata API usage (partial)
- [ ] Route handlers typed correctly

#### React 19
- [x] Functional components only
- [x] Proper hook usage
- [x] forwardRef for ref-passing components
- [ ] useTransition for expensive updates
- [ ] Suspense boundaries (minimal)

#### TypeScript 5.7
- [x] Strict mode enabled
- [x] Path aliases configured
- [ ] No unused variables (warn → error)
- [ ] Explicit return types (needs enforcement)
- [ ] satisfies operator usage (underutilized)

#### Tailwind CSS
- [x] Proper utility-first approach
- [x] cn() helper for class merging
- [x] Consistent spacing scale
- [ ] Custom color consistency audit
- [ ] Dark mode support (not implemented)

### 3.8 Action Items Summary

**High Priority (Do First):**
1. [x] Fix `as any` type casts in Supabase queries **[COMPLETED]**
   - Created `lib/supabase/queries.ts` with typed query helpers (~1350 lines)
   - Added `QueryError` class preserving Supabase error codes
   - Converted all API routes, dashboard pages, AI agents, and components
   - TypeScript compiles cleanly with no `as any` casts in production code
2. [x] Add explicit return types to exported functions **[COMPLETED]**
   - Added return types to `lib/utils.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`
   - Added return types to `lib/auth/getSession.ts`, `lib/auth/requireSession.ts`
   - Fixed `TypedSupabaseClient` in types.ts for schema flexibility
3. [x] Audit rate limiting coverage **[COMPLETED]**
   - All 10 AI routes now have rate limiting applied
   - 9 routes use `rateLimitConfigs.ai` (expensive LLM operations)
   - 1 route uses `rateLimitConfigs.api` (suggest-tags - lighter operation)
   - Refactored generate-portfolio-summary to use standard patterns

**Medium Priority:**
4. [x] Standardize folder naming conventions **[COMPLETED]**
   - Documented naming conventions in CONTRIBUTING.md
   - Verified existing folders follow consistent patterns
5. [x] Create typed query helpers **[COMPLETED]** (see item 1)
6. [ ] Update architecture documentation
7. [x] Add magic strings to constants **[COMPLETED]**
   - Added `SECTION_TYPE_LABELS` and `SECTION_TYPE_COLORS` to constants.ts
   - Refactored SectionCard.tsx to use constants instead of switch statements

**Low Priority:**

8. [x] Fix markdown lint errors **[COMPLETED]**
   - Fixed table formatting in TODO.md (spacing around pipes)
   - Fixed list formatting (blank lines around lists)
   - Fixed docs/README.md structure
9. [x] Add file header template **[COMPLETED]**
   - Added comprehensive File Headers section to CONTRIBUTING.md
   - Templates for: library files, React components, API routes, hooks
10. [x] Consistent props interface naming **[COMPLETED]**
   - Verified all components use `{ComponentName}Props` pattern
   - No inline prop type definitions found in production code
11. [x] Component documentation audit **[COMPLETED]**
   - All key components have proper JSDoc file headers
   - Builder, SectionCard, SectionEditor, PortfolioRenderer, etc.

---

## Notes

### Technologies Used
- **Framework:** Next.js 15.1.3 (App Router)
- **Language:** TypeScript 5.7.2
- **Database:** Supabase (PostgreSQL)
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Styling:** Tailwind CSS 3.4.17
- **Testing:** Jest 30.2.0 + React Testing Library
- **Validation:** Zod 4.2.1

### Strengths
1. Clean layered architecture
2. Proper API versioning
3. Good separation of concerns
4. Comprehensive AI integration
5. Strong TypeScript foundation
6. Good existing documentation
7. Comprehensive UI component library
8. Full test coverage for critical paths
9. Consistent JSDoc file headers
10. Well-structured barrel exports

### Areas Needing Attention
1. **Type Safety** - Eliminate `as any` casts
2. **GitHub Pages Export** - Key feature for developer portfolios
3. E2E testing (Playwright)
4. API route integration tests
5. Performance optimizations
6. Accessibility audit
7. API documentation (OpenAPI/Swagger)
8. Dark mode support

---

*This TODO list should be reviewed and updated as tasks are completed. Mark items with [x] when done.*

**Last Updated:** February 26, 2026
