# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Portfolio Forge seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@portfolioforge.com**

Include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours.
- **Communication:** We will keep you informed of the progress towards a fix.
- **Timeline:** We aim to address critical vulnerabilities within 7 days.
- **Credit:** If you report a valid security issue, we will credit you in our release notes (unless you prefer to remain anonymous).

## Security Best Practices

### For Contributors

1. **Never commit secrets:** Use environment variables for API keys, database credentials, etc.
2. **Validate all inputs:** Use Zod or similar for input validation.
3. **Use parameterized queries:** Supabase client handles this automatically.
4. **Implement proper authentication:** Always verify user identity before sensitive operations.
5. **Follow the principle of least privilege:** Only request necessary permissions.

### For Deployers

1. **Secure environment variables:** Never expose `.env` files publicly.
2. **Enable RLS:** Ensure Row Level Security is enabled on all Supabase tables.
3. **Use HTTPS:** Always deploy with HTTPS enabled.
4. **Configure CORS:** Restrict allowed origins in production.
5. **Rate limiting:** Ensure rate limiting is configured for production (Redis required).
6. **Monitor logs:** Set up log monitoring for suspicious activity.

## Security Features

Portfolio Forge includes the following security features:

### Authentication
- Supabase Auth with secure session management
- OAuth integration with GitHub, Google
- Email verification support
- Session expiration handling

### Authorization
- Row Level Security (RLS) on all database tables
- User-scoped data access
- API route authentication middleware

### Data Protection
- Input validation with Zod schemas
- XSS protection via React's built-in escaping
- CSRF protection via SameSite cookies
- SQL injection protection via Supabase client

### Rate Limiting
- IP-based rate limiting for public endpoints
- User-based rate limiting for authenticated endpoints
- Stricter limits for sensitive operations (auth, AI)

### Infrastructure
- Environment-specific configurations
- Secure headers (configured in `next.config.js`)
- No sensitive data in client bundles

## Known Security Considerations

### Development Mode
- In-memory rate limiting (not distributed)
- Debug logging may expose sensitive info
- Less strict CORS settings

### Production Requirements
- Redis for distributed rate limiting
- Proper log aggregation without sensitive data
- Secure environment variable management
- Regular dependency updates

## Dependency Security

We use the following tools to maintain dependency security:

- **npm audit:** Run regularly to check for vulnerabilities
- **Dependabot:** Automated security updates (when enabled)
- **GitHub Security Alerts:** Monitoring for vulnerable dependencies

To check for vulnerabilities:

```bash
npm audit
```

To fix automatically fixable vulnerabilities:

```bash
npm audit fix
```

## Security Updates

Security updates are released as patch versions. We recommend:

1. Subscribing to release notifications
2. Running `npm update` regularly
3. Monitoring the CHANGELOG for security-related fixes

## Contact

For security-related inquiries:

- **Email:** security@portfolioforge.com
- **Response Time:** Within 48 hours

For general inquiries, please use GitHub Issues or Discussions.
