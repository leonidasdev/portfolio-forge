# Vercel Deployment Guide

This document explains how to deploy Portfolio Forge to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Supabase project](https://supabase.com) with the database schema applied
3. A [Groq API key](https://console.groq.com) for AI features
4. (Optional) [Upstash Redis](https://upstash.com) for production rate limiting

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/leonidasdev/portfolio-forge&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GROQ_API_KEY&envDescription=Required%20environment%20variables%20for%20Portfolio%20Forge&envLink=https://github.com/leonidasdev/portfolio-forge/blob/main/.env.example)

## Manual Deployment

### Step 1: Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import the GitHub repository
4. Select the `main` branch

### Step 2: Configure Environment Variables

Add the following environment variables in the Vercel project settings:

#### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) |
| `GROQ_API_KEY` | Groq API key for AI features |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for rate limiting | In-memory (dev only) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | - |
| `RATE_LIMIT_ENABLED` | Enable/disable rate limiting | `true` |
| `NODE_ENV` | Environment mode | `production` |

### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment Setup

### 1. Configure Supabase Auth Redirect URLs

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

### 2. Set Up Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update Supabase redirect URLs to include your custom domain

### 3. Configure Rate Limiting for Production

For production, use Upstash Redis:

1. Create a free account at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the REST URL and token
4. Add to Vercel environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## Environment-Specific Deployments

### Preview Deployments

Vercel automatically creates preview deployments for pull requests. Configure preview-specific environment variables in Vercel:

1. Go to **Settings** > **Environment Variables**
2. Set variables for **Preview** environment
3. Use separate Supabase project for previews (recommended)

### Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Rate Limiting | In-memory | Upstash Redis |
| Logging | Verbose (debug) | Minimal (info+) |
| Error Details | Full stack traces | Generic messages |
| AI Requests | Limited | Production quotas |

## Monitoring

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:

1. Go to **Analytics** tab in your project
2. Click "Enable Analytics"
3. View Web Vitals and performance data

### Error Tracking

Consider adding error tracking:

```bash
npm install @sentry/nextjs
```

Then configure in `sentry.client.config.ts` and `sentry.server.config.ts`.

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify Node.js version compatibility (18.x+)

### Runtime Errors

1. Check Function logs in Vercel dashboard
2. Verify Supabase connection string
3. Check API key validity

### Common Issues

| Issue | Solution |
|-------|----------|
| "Missing environment variable" | Add all required env vars in Vercel settings |
| "Supabase connection failed" | Verify Supabase URL and keys |
| "Rate limit exceeded" | Configure Upstash Redis for production |
| "Auth redirect failed" | Add deployment URL to Supabase redirect URLs |

## CI/CD Integration

The project includes GitHub Actions for CI. To enable automatic deployments:

1. Connect your GitHub repository to Vercel
2. Enable "Git Integration" in Vercel settings
3. Configure branch deployments:
   - `main` → Production
   - Other branches → Preview

## Cost Optimization

### Vercel Free Tier Limits

- 100GB bandwidth/month
- 100 hours of serverless function execution
- 6,000 build minutes/month

### Tips to Stay Within Limits

1. Enable caching for static assets
2. Optimize images with `next/image`
3. Use Incremental Static Regeneration where appropriate
4. Monitor usage in Vercel dashboard

## Security Checklist

Before going live:

- [ ] All environment variables are set as "Encrypted"
- [ ] Service role key is NOT exposed to client
- [ ] Rate limiting is configured with Redis
- [ ] CORS is properly configured
- [ ] Auth redirect URLs are restricted to your domain
- [ ] Security headers are enabled (configured in vercel.json)

---

For more information, see the [Vercel Documentation](https://vercel.com/docs).
