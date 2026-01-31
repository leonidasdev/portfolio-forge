# Portfolio Forge Documentation

Welcome to the Portfolio Forge documentation. This directory contains comprehensive documentation for developers and contributors.

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation index
├── TODO.md                      # Project TODO list and progress tracker
├── DEPLOYMENT.md                # Deployment guide (Vercel, Docker, PM2)
├── DEVELOPMENT.md               # Local development setup guide
├── RATE_LIMITING.md             # Rate limiting configuration guide
├── architecture/                # Architecture & design documents
│   ├── ARCHITECTURE.md          # Architecture overview and patterns
│   └── DIAGRAMS.md              # Visual architecture diagrams (Mermaid)
├── api/                         # API documentation
│   ├── api-versioning.md        # API versioning strategy
│   └── API_REFERENCE.md         # Complete API reference guide
└── features/                    # Feature-specific documentation
    ├── authentication.md        # Auth flow, utilities, and patterns
    ├── supabase-client.md       # Supabase client usage guide
    ├── certification-file-upload.md # File upload feature
    └── middleware.md            # Middleware documentation
```

## Quick Links

### For New Developers
- [Project README](../README.md) - Getting started guide
- [CLAUDE.md](../.github/CLAUDE.md) - AI assistant context (great for quick project overview)
- [Development Guide](DEVELOPMENT.md) - Local development setup
- [Architecture Overview](architecture/ARCHITECTURE.md) - Understand the codebase
- [Architecture Diagrams](architecture/DIAGRAMS.md) - Visual system diagrams
- [Authentication](features/authentication.md) - Auth flow and utilities
- [Supabase Client](features/supabase-client.md) - Database client usage

### For Contributors
- [TODO List](TODO.md) - Project tasks and progress
- [Architecture Overview](architecture/ARCHITECTURE.md) - Code patterns & recommendations
- [Architecture Diagrams](architecture/DIAGRAMS.md) - Visual system diagrams
- [API Versioning](api/api-versioning.md) - API design guidelines
- [Middleware](features/middleware.md) - Request handling

### For DevOps
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions (Vercel, Docker, PM2)
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
   - Include dates on reviews/assessments

## Related Resources

- [Supabase Client README](../lib/supabase/README.md) - Supabase integration
- [Auth Library README](../lib/auth/README.md) - Authentication utilities
