# Portfolio Forge Documentation

Welcome to the Portfolio Forge documentation. This directory contains comprehensive documentation for developers and contributors.

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── CODE_REVIEW_SUMMARY.md       # Code review findings and status
├── architecture/                # Architecture & design documents
│   ├── ARCHITECTURE_REVIEW.md   # High-level architecture assessment
│   └── ARCHITECTURE_DEEP_DIVE.md # Detailed code organization analysis
├── api/                         # API documentation
│   └── api-versioning.md        # API versioning strategy
└── features/                    # Feature-specific documentation
    ├── authentication.md        # OAuth flow and architecture
    ├── auth-utilities.md        # Auth helper API reference
    ├── supabase-client.md       # Supabase client usage guide
    ├── certification-file-upload.md # File upload feature
    └── middleware.md            # Middleware documentation
```

## Quick Links

### For New Developers
- [Project README](../README.md) - Getting started guide
- [Architecture Review](architecture/ARCHITECTURE_REVIEW.md) - Understand the codebase
- [Authentication](features/authentication.md) - OAuth flow overview
- [Auth Utilities](features/auth-utilities.md) - Session handling API reference
- [Supabase Client](features/supabase-client.md) - Database client usage

### For Contributors
- [Architecture Deep Dive](architecture/ARCHITECTURE_DEEP_DIVE.md) - Code patterns & recommendations
- [API Versioning](api/api-versioning.md) - API design guidelines
- [Middleware](features/middleware.md) - Request handling

### API Documentation
- [API Versioning Strategy](api/api-versioning.md)
- API Reference (coming soon)

## Documentation Guidelines

When adding new documentation:

1. **Place files in the correct directory:**
   - `architecture/` - Design decisions, patterns, reviews
   - `api/` - API specs, endpoints, versioning
   - `features/` - Feature-specific guides
   - `examples/` - Code samples, integration guides

2. **Use consistent formatting:**
   - Start with a title and brief description
   - Include a table of contents for long documents
   - Use code blocks with language hints
   - Add diagrams where helpful

3. **Keep documentation up-to-date:**
   - Update docs when changing related code
   - Mark deprecated features clearly
   - Include dates on reviews/assessments

## Related Resources

- [Supabase Client README](../lib/supabase/README.md) - Supabase integration
- [Auth Library README](../lib/auth/README.md) - Authentication utilities
