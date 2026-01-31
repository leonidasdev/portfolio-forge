# Contributing to Portfolio Forge

Thank you for your interest in contributing to Portfolio Forge! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git
- A Supabase account (for testing)
- A Groq API key (for AI features)

### Setting Up Local Development

1. **Fork the repository**
   ```bash
   # Click the 'Fork' button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/portfolio-forge.git
   cd portfolio-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run tests to verify setup**
   ```bash
   npm test
   ```

## Development Workflow

### Branching Strategy

We use a feature branch workflow:

- `main` - Production-ready code
- `feature/*` - New features (e.g., `feature/add-dark-mode`)
- `fix/*` - Bug fixes (e.g., `fix/auth-redirect`)
- `refactor/*` - Code refactoring (e.g., `refactor/split-builder-component`)
- `docs/*` - Documentation updates (e.g., `docs/api-reference`)

### Creating a Feature Branch

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create and switch to a new branch
git checkout -b feature/your-feature-name
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern="rate-limit"
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid using `any` type - use `unknown` or specific types
- Enable strict mode compliance
- Export types from `types/` directory

```typescript
// ✅ Good
interface UserData {
  id: string
  email: string
}

function processUser(user: UserData): void {
  // ...
}

// ❌ Bad
function processUser(user: any): void {
  // ...
}
```

### React Components

- Use functional components with hooks
- Use `'use client'` directive only when necessary
- Keep components small and focused (< 200 lines)
- Extract custom hooks for reusable logic

```typescript
// ✅ Good - Small, focused component
export function UserAvatar({ user }: { user: User }) {
  return (
    <img
      src={user.avatarUrl}
      alt={user.name}
      className="w-10 h-10 rounded-full"
    />
  )
}

// ❌ Bad - Too many responsibilities
export function UserProfile({ user }) {
  // 500 lines of mixed concerns...
}
```

### API Routes

- Use the `withApiHandler` wrapper for consistent error handling
- Use `requireAuth` for authenticated routes
- Validate all inputs with Zod schemas
- Return consistent response shapes

```typescript
// ✅ Good
export const POST = withApiHandler(async (request: NextRequest) => {
  const { user, supabase } = await requireAuth(request)
  const body = await validateBody(request, createPortfolioSchema)

  // ... implementation

  return NextResponse.json({ portfolio })
})
```

### File Organization

```
components/
├── feature-name/
│   ├── FeatureComponent.tsx    # Main component
│   ├── FeatureSubComponent.tsx # Sub-components
│   ├── useFeature.ts           # Custom hooks
│   ├── feature.types.ts        # Types (if many)
│   └── index.ts                # Barrel export
```

### Documentation

- Add JSDoc comments to exported functions
- Include `@param`, `@returns`, and `@example` where helpful
- Document complex business logic inline

```typescript
/**
 * Generates a public share link for a portfolio.
 *
 * @param portfolioId - The UUID of the portfolio
 * @returns Object containing the public URL and token
 * @throws {ApiError} If portfolio not found or user unauthorized
 *
 * @example
 * const { url, token } = await generatePublicLink('abc-123')
 */
export async function generatePublicLink(portfolioId: string) {
  // ...
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
# Feature
git commit -m "feat(ai): add batch rewrite capability for portfolio sections"

# Bug fix
git commit -m "fix(auth): resolve redirect loop on expired session"

# Documentation
git commit -m "docs(api): add OpenAPI specification for AI endpoints"

# Refactoring
git commit -m "refactor(builder): split SectionEditor into smaller components"
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   npm test
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Update documentation** if you've changed APIs or added features

4. **Rebase on latest main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

### PR Checklist

When opening a PR, please ensure:

- [ ] Tests are added/updated for new functionality
- [ ] All tests pass locally
- [ ] Code follows the project's coding standards
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventional commits
- [ ] PR description clearly explains the changes
- [ ] No unnecessary files are included

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Delete your feature branch after merge

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description** - Clear description of the bug
2. **Steps to Reproduce** - Detailed steps to reproduce
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, browser, Node version
6. **Screenshots** - If applicable

### Feature Requests

For feature requests, please include:

1. **Problem Statement** - What problem does this solve?
2. **Proposed Solution** - How should it work?
3. **Alternatives Considered** - Other approaches you've thought of
4. **Additional Context** - Any other relevant information

## Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Check existing documentation in `/docs`
- Review closed issues for similar questions

## License

By contributing to Portfolio Forge, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).

---

Thank you for contributing to Portfolio Forge!
