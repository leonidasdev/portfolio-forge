# Deployment Guide

This guide covers deploying Portfolio Forge to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Vercel Deployment](#vercel-deployment)
4. [Self-Hosted Deployment](#self-hosted-deployment)
5. [Supabase Setup](#supabase-setup)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Supabase project created
- [ ] Database schema applied (`supabase/schema.sql`)
- [ ] Storage buckets created (`supabase/storage-buckets.sql`)
- [ ] Groq API key for AI features
- [ ] Redis instance (optional, for distributed rate limiting)
- [ ] Domain name (optional)

---

## Environment Variables

### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Configuration
GROQ_API_KEY=your-groq-api-key
```

### Optional Variables

```env
# Redis (for production rate limiting)
REDIS_URL=redis://user:password@host:port

# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Security Notes

- Never commit `.env` files to version control
- Use platform-specific secret management (Vercel, AWS Secrets Manager, etc.)
- Rotate keys regularly
- Use separate keys for staging and production

---

## Vercel Deployment

### Automatic Deployment

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Set different values for Production/Preview/Development

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

4. **Deploy**
   - Push to main branch for production deployment
   - Pull requests create preview deployments

### Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. SSL is automatic

---

## Self-Hosted Deployment

### Docker Deployment

1. **Create Dockerfile** (if not exists)
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Update next.config.js**
   ```javascript
   module.exports = {
     output: 'standalone',
     // ... other config
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t portfolio-forge .
   docker run -p 3000:3000 --env-file .env portfolio-forge
   ```

### PM2 Deployment

1. **Install PM2**
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem.config.js**
   ```javascript
   module.exports = {
     apps: [{
       name: 'portfolio-forge',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

3. **Start Application**
   ```bash
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

---

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and keys

### 2. Apply Database Schema

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL Editor
# Copy contents of supabase/schema.sql
```

### 3. Create Storage Buckets

```sql
-- Run in SQL Editor
-- Copy contents of supabase/storage-buckets.sql
```

### 4. Configure Authentication

1. Go to Authentication → Providers
2. Enable desired providers:
   - Email (enabled by default)
   - GitHub (requires OAuth app)
   - Google (requires OAuth credentials)

3. Configure redirect URLs:
   ```
   https://your-domain.com/auth/callback
   ```

### 5. Enable Row Level Security

Ensure RLS is enabled on all tables:
```sql
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
```

---

## Post-Deployment Checklist

### Security
- [ ] All environment variables configured
- [ ] RLS enabled on all tables
- [ ] HTTPS enforced
- [ ] Rate limiting working (test with Redis)
- [ ] CORS configured correctly

### Functionality
- [ ] Authentication working (login/signup/OAuth)
- [ ] Database operations working
- [ ] File uploads working
- [ ] AI features responding
- [ ] Email notifications (if configured)

### Performance
- [ ] Build completed without errors
- [ ] No console errors in production
- [ ] Page load times acceptable
- [ ] API response times acceptable

### Monitoring
- [ ] Error tracking configured
- [ ] Log aggregation set up
- [ ] Uptime monitoring configured
- [ ] Performance monitoring configured

---

## Monitoring

### Recommended Tools

1. **Error Tracking**
   - Sentry
   - LogRocket
   - Bugsnag

2. **Log Aggregation**
   - Datadog
   - Logtail
   - Papertrail

3. **Uptime Monitoring**
   - Better Uptime
   - Pingdom
   - UptimeRobot

4. **Performance**
   - Vercel Analytics
   - Google Analytics
   - Web Vitals

### Setting Up Sentry (Example)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Troubleshooting

### Build Failures

**Error: TypeScript errors**
```bash
npm run typecheck
# Fix reported errors
```

**Error: Missing environment variables**
- Ensure all required env vars are set in deployment platform
- Check for typos in variable names

### Runtime Errors

**Error: Supabase connection failed**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check if Supabase project is active
- Verify network access (IP allowlist if configured)

**Error: Rate limiting not working**
- In production, Redis is required
- Check `REDIS_URL` is configured
- Verify Redis connection

**Error: File uploads failing**
- Check storage bucket policies
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check file size limits

### Performance Issues

**Slow API responses**
- Check database indexes
- Enable query logging in Supabase
- Review N+1 queries

**Slow page loads**
- Enable caching headers
- Check bundle size
- Review component rendering

---

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [GitHub Issues](https://github.com/leonidasdev/portfolio-forge/issues)
3. Ask in [GitHub Discussions](https://github.com/leonidasdev/portfolio-forge/discussions)
