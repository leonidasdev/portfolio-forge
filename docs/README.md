# Portfolio Forge Documentation

Welcome to the Portfolio Forge documentation. This directory contains comprehensive documentation for developers and contributors.

## Documentation Structure

```text
docs/
├── README.md                        # This file - Documentation index
├── TODO.md                          # Project TODO list and progress tracker
├── CLAUDE.md                        # AI assistant context file
├── deployment-guide.md              # Deployment guide (Vercel, Docker, PM2)
├── development-guide.md             # Local development setup guide
├── rate-limiting.md                 # Rate limiting configuration guide
├── pull-request-template.md         # PR template for contributors
├── architecture/                    # Architecture and design documents
│   ├── architecture.md              # Architecture overview and patterns
│   └── diagrams.md                  # Visual architecture diagrams (Mermaid)
├── api/                             # API documentation
│   ├── api-versioning.md            # API versioning strategy
│   └── api-reference.md             # Complete API reference guide
└── features/                        # Feature-specific documentation
    ├── authentication.md            # Auth flow, utilities, and patterns
    ├── supabase-client.md           # Supabase client usage guide
    ├── certification-file-upload.md # File upload feature
    └── middleware.md                # Middleware documentation
```

## Quick Links

### For New Developers

- [Project README](../README.md) - Getting started guide
- [CLAUDE.md](CLAUDE.md) - AI assistant context (project overview)
- [Development Guide](development-guide.md) - Local development setup
- [Architecture Overview](architecture/architecture.md) - Understand the codebase
- [Architecture Diagrams](architecture/diagrams.md) - Visual system diagrams
- [Authentication](features/authentication.md) - Auth flow and utilities
- [Supabase Client](features/supabase-client.md) - Database client usage

### For Contributors

- [TODO List](TODO.md) - Project tasks and progress
- [Pull Request Template](pull-request-template.md) - PR guidelines
- [Architecture Overview](architecture/architecture.md) - Code patterns and recommendations
- [Architecture Diagrams](architecture/diagrams.md) - Visual system diagrams
- [API Versioning](api/api-versioning.md) - API design guidelines
- [Middleware](features/middleware.md) - Request handling

### For DevOps

- [Deployment Guide](deployment-guide.md) - Production deployment instructions (Vercel, Docker, PM2)
- [Rate Limiting](rate-limiting.md) - Rate limiting configuration

### API Documentation

- [API Reference](api/api-reference.md) - Complete REST API documentation
- [API Versioning Strategy](api/api-versioning.md) - Versioning guidelines

## Documentation Guidelines

When adding new documentation:

1. **Place files in the correct directory:**
   - `architecture/` - Design decisions, patterns, reviews
   - `api/` - API specs, endpoints, versioning
   - `features/` - Feature-specific guides

2. **Use kebab-case for file names** (e.g., `deployment-guide.md`)

3. **Follow professional tone** - No emojis, clear technical language
