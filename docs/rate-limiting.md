# Rate Limiting Guide

This guide covers rate limiting configuration for Portfolio Forge in different environments.

## Overview

Portfolio Forge implements rate limiting to:
- Protect against abuse and DDoS attacks
- Manage AI API costs
- Ensure fair usage across users
- Comply with third-party API limits (Groq)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client        │────▶│   Rate Limiter  │────▶│   API Handler   │
│   Request       │     │   Middleware    │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              ┌─────▼─────┐           ┌───────▼───────┐
              │ In-Memory │           │     Redis     │
              │  (Dev)    │           │  (Production) │
              └───────────┘           └───────────────┘
```

## Rate Limit Configurations

### Default Limits

| Endpoint Type | Requests | Window | Key Type |
|--------------|----------|--------|----------|
| Standard API | 100 | 1 minute | IP |
| Auth Routes | 10 | 1 minute | IP |
| AI Endpoints | 20 | 1 minute | User ID |
| Public Routes | 30 | 1 minute | IP |

### Configuration in Code

```typescript
// lib/api/rate-limit.ts
export const rateLimitConfigs = {
  standard: { limit: 100, windowMs: 60000, keyBy: 'ip' },
  auth: { limit: 10, windowMs: 60000, keyBy: 'ip' },
  ai: { limit: 20, windowMs: 60000, keyBy: 'user' },
  public: { limit: 30, windowMs: 60000, keyBy: 'ip' },
}
```

## Development Mode

In development, rate limiting uses an **in-memory store**:

```typescript
// Automatically selected when REDIS_URL is not set
const store = new InMemoryRateLimitStore()
```

### Characteristics:
- No external dependencies
- Fast iteration during development
- Resets on server restart
- Not shared across instances
- Not suitable for production

## Production Mode

For production, you **must** use Redis for distributed rate limiting.

### Why Redis is Required

1. **Serverless/Edge Functions**: Each invocation may run on different instances
2. **Multi-Instance Deployments**: Rate limits must be shared across all instances
3. **Persistence**: Limits survive deployments and restarts
4. **Accuracy**: Prevents limit bypass through instance hopping

### Setting Up Redis

#### Option 1: Upstash Redis (Recommended for Vercel)

1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the connection string
4. Add to environment variables:

```env
REDIS_URL=rediss://default:your-password@your-endpoint.upstash.io:6379
```

#### Option 2: Redis Cloud

1. Create account at [redis.com](https://redis.com)
2. Create a free database
3. Copy connection details:

```env
REDIS_URL=redis://default:password@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345
```

#### Option 3: Self-Hosted Redis

```env
REDIS_URL=redis://username:password@your-redis-host:6379
```

### Verifying Redis Connection

The application logs the rate limit store type on startup:

```
[Rate Limit] Using Redis store (production mode)
# or
[Rate Limit] Using in-memory store (development mode)
```

## Rate Limit Headers

All API responses include rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706713200
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |

## Handling Rate Limit Errors

When rate limit is exceeded, the API returns:

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

**HTTP Status:** `429 Too Many Requests`

### Client-Side Handling

```typescript
import { ApiError } from '@/lib/api/errors'

try {
  const data = await apiClient.post('/ai/improve-text', { text })
} catch (error) {
  if (error instanceof ApiError && error.status === 429) {
    // Show rate limit message
    showToast('Too many requests. Please wait a moment.')

    // Optionally implement retry with backoff
    const retryAfter = error.data?.retryAfter || 60
    setTimeout(() => retry(), retryAfter * 1000)
  }
}
```

## Customizing Rate Limits

### Per-Route Configuration

```typescript
// In your API route
import { withRateLimit, rateLimitConfigs } from '@/lib/api/rate-limit'

export const POST = withRateLimit(
  async (request) => {
    // Your handler
  },
  { ...rateLimitConfigs.ai, limit: 10 } // Custom limit
)
```

### Environment-Based Configuration

```typescript
const AI_RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT || '20')

export const aiConfig = {
  limit: AI_RATE_LIMIT,
  windowMs: 60000,
  keyBy: 'user' as const,
}
```

## Monitoring

### Health Check Endpoint

Create an endpoint to check rate limit store health:

```typescript
// app/api/health/route.ts
import { checkRateLimitStatus } from '@/lib/api/rate-limit'

export async function GET() {
  const status = await checkRateLimitStatus('health-check')

  return Response.json({
    status: 'ok',
    rateLimiting: {
      store: process.env.REDIS_URL ? 'redis' : 'memory',
      healthy: status.remaining >= 0,
    },
  })
}
```

### Metrics to Monitor

- Rate limit hit rate (429 responses)
- Average remaining requests per user
- Redis connection errors
- Latency of rate limit checks

## Troubleshooting

### Rate Limiting Not Working

1. **Check store type**: Look for startup log message
2. **Verify Redis connection**: Check REDIS_URL is set correctly
3. **Check key generation**: Ensure IP/User extraction is working

### Redis Connection Failures

```
Error: Redis connection failed
```

1. Verify REDIS_URL format
2. Check network connectivity
3. Verify credentials
4. Check if Redis service is running

### Inconsistent Rate Limits

If limits seem inconsistent across requests:

1. Ensure all instances use same Redis
2. Check for clock skew between servers
3. Verify sliding window implementation

## Best Practices

1. **Always use Redis in production** - In-memory won't work in serverless
2. **Set appropriate limits** - Too strict = bad UX, too loose = abuse risk
3. **Monitor rate limit metrics** - Adjust based on actual usage
4. **Implement client-side rate limiting** - Reduce unnecessary requests
5. **Use exponential backoff** - When retrying after 429 errors
6. **Document limits for users** - Include in API documentation

## Related Files

- `lib/api/rate-limit.ts` - Rate limiting middleware
- `lib/api/rate-limit-store.ts` - Store implementations
- `lib/constants.ts` - Rate limit constants
