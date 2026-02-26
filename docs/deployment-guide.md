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
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Rate Limiting
RATE_LIMIT_ENABLED=true

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

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/leonidasdev/portfolio-forge&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GROQ_API_KEY&envDescription=Required%20environment%20variables%20for%20Portfolio%20Forge&envLink=https://github.com/leonidasdev/portfolio-forge/blob/main/.env.example)

### Manual Deployment

#### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import the GitHub repository
4. Select the `main` branch

#### Step 2: Configure Environment Variables

Add the following environment variables in the Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) | Yes |
| `GROQ_API_KEY` | Groq API key for AI features | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | Optional |

#### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

#### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

### Post-Deployment: Supabase Auth URLs

In your Supabase project dashboard:

1. Go to **Authentication** > **URL Configuration**
2. Add your Vercel deployment URL to **Site URL**:
   ```
   https://your-app.vercel.app
   ```
3. Add redirect URLs:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```

### Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update Supabase redirect URLs to include your custom domain

### Preview Deployments

Vercel automatically creates preview deployments for pull requests:

1. Go to **Settings** > **Environment Variables**
2. Set variables for **Preview** environment
3. Use separate Supabase project for previews (recommended)

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
- [ ] Rate limiting working (configure Redis for production)
- [ ] CORS configured correctly
- [ ] Service role key NOT exposed to client

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

---

## Monitoring

### Recommended Tools

| Category | Options |
|----------|---------|
| **Error Tracking** | Sentry, LogRocket, Bugsnag |
| **Log Aggregation** | Datadog, Logtail, Papertrail |
| **Uptime Monitoring** | Better Uptime, Pingdom, UptimeRobot |
| **Performance** | Vercel Analytics, Web Vitals |

### Vercel Analytics

1. Go to **Analytics** tab in your Vercel project
2. Click "Enable Analytics"
3. View Web Vitals and performance data

### Setting Up Sentry (Example)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## GitHub Pages Export Feature

The GitHub Pages export feature allows users to deploy their portfolios directly to GitHub Pages. This section covers the deployment configuration needed for this feature.

### How It Works

1. **User-Provided Token**: Users provide their own GitHub Personal Access Token when deploying
2. **Static Site Generation**: The app generates a static HTML/CSS site from portfolio data
3. **GitHub API**: The app uses the GitHub REST API to create/update repositories and push files
4. **GitHub Actions**: A workflow file is included to enable automatic GitHub Pages deployment

### User Requirements

Users need to create a GitHub Personal Access Token with the `repo` scope:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the **`repo`** scope (Full control of private repositories)
4. Generate and save the token securely

> **Note:** The token is sent directly to the GitHub API and is NOT stored in your application's database.

### Optional: GitHub OAuth Integration (Future Enhancement)

For a seamless user experience, you can configure GitHub OAuth in Supabase:

1. **Create a GitHub OAuth App:**
   - Go to [GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Set Authorization callback URL to `https://your-supabase-project.supabase.co/auth/v1/callback`
   - Note the Client ID and Client Secret

2. **Configure Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable GitHub provider
   - Enter Client ID and Client Secret
   - Add required scopes: `repo,read:user`

3. **Update Redirect URLs:**
   - Add your production URL to Supabase Auth redirect URLs:
     ```
     https://your-domain.com/auth/callback
     ```

### Post-Deployment Checklist for Exports

- [ ] Tested "Download ZIP" functionality
- [ ] Tested "Deploy to GitHub Pages" with a GitHub PAT
- [ ] Verified generated static sites render correctly
- [ ] Rate limiting configured for export endpoints (recommend 5/min for GitHub, 10/min for ZIP)

### Database Migration

Ensure the `portfolio_exports` table is created by running the latest schema:

```sql
-- From supabase/schema.sql
-- The portfolio_exports table tracks export history and deployment status
```

---

## Troubleshooting

### Build Failures

| Error | Solution |
|-------|----------|
| TypeScript errors | Run `npm run typecheck` and fix errors |
| Missing environment variables | Ensure all required env vars are set |
| Node.js version | Ensure Node.js 18.x+ is used |

### Runtime Errors

| Error | Solution |
|-------|----------|
| Supabase connection failed | Verify `NEXT_PUBLIC_SUPABASE_URL` is correct |
| Rate limit exceeded | Configure Upstash Redis for production |
| Auth redirect failed | Add deployment URL to Supabase redirect URLs |
| File uploads failing | Check storage bucket policies |

### Performance Issues

| Issue | Solution |
|-------|----------|
| Slow API responses | Check database indexes, review N+1 queries |
| Slow page loads | Enable caching, check bundle size |
| High memory usage | Review component rendering, implement lazy loading |

---

## Cost Optimization (Vercel)

### Free Tier Limits

- 100GB bandwidth/month
- 100 hours of serverless function execution
- 6,000 build minutes/month

### Tips to Stay Within Limits

1. Enable caching for static assets
2. Optimize images with `next/image`
3. Use Incremental Static Regeneration where appropriate
4. Monitor usage in Vercel dashboard

---

## Support

For deployment issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review [GitHub Issues](https://github.com/leonidasdev/portfolio-forge/issues)
3. Ask in [GitHub Discussions](https://github.com/leonidasdev/portfolio-forge/discussions)
