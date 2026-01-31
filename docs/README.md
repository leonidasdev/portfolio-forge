# Portfolio Forge Documentation

Welcome to the Portfolio Forge documentation. This directory contains comprehensive documentation for developers and contributors.

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── TODO.md                      # Project TODO list and progress tracker
├── CODE_REVIEW_SUMMARY.md       # Code review findings and status
├── DEPLOYMENT.md                # Deployment guide for production
├── VERCEL_DEPLOYMENT.md         # Vercel-specific deployment guide
├── DEVELOPMENT.md               # Local development setup guide
├── RATE_LIMITING.md             # Rate limiting configuration guide
├── architecture/                # Architecture & design documents
│   ├── ARCHITECTURE_REVIEW.md   # High-level architecture assessment
│   ├── ARCHITECTURE_DEEP_DIVE.md # Detailed code organization analysis
│   └── DIAGRAMS.md              # Visual architecture diagrams (Mermaid)
├── api/                         # API documentation
│   ├── api-versioning.md        # API versioning strategy
│   └── API_REFERENCE.md         # Complete API reference guide
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
- [CLAUDE.md](../CLAUDE.md) - AI assistant context (great for quick project overview)
- [Development Guide](DEVELOPMENT.md) - Local development setup
- [Architecture Review](architecture/ARCHITECTURE_REVIEW.md) - Understand the codebase
- [Architecture Diagrams](architecture/DIAGRAMS.md) - Visual system diagrams
- [Authentication](features/authentication.md) - OAuth flow overview
- [Auth Utilities](features/auth-utilities.md) - Session handling API reference
- [Supabase Client](features/supabase-client.md) - Database client usage

### For Contributors
- [TODO List](TODO.md) - Project tasks and progress
- [Architecture Deep Dive](architecture/ARCHITECTURE_DEEP_DIVE.md) - Code patterns & recommendations
- [Architecture Diagrams](architecture/DIAGRAMS.md) - Visual system diagrams
- [API Versioning](api/api-versioning.md) - API design guidelines
- [Middleware](features/middleware.md) - Request handling
- [Code Review Summary](CODE_REVIEW_SUMMARY.md) - Review findings

### For DevOps
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Vercel Deployment](VERCEL_DEPLOYMENT.md) - Vercel-specific deployment guide
- [Rate Limiting](RATE_LIMITING.md) - Rate limiting configuration

### API Documentation
- [API Reference](api/API_REFERENCE.md) - Complete REST API documentation
- [API Versioning Strategy](api/api-versioning.md)
- [Health Check Endpoint](/api/health) - System health monitoring

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
