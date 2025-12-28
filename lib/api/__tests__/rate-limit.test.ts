/**
 * Tests for Rate Limiting Middleware
 * 
 * @group unit
 * @group api
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock the config module before importing rate-limit
jest.mock('@/lib/config', () => ({
  config: {
    rateLimit: {
      enabled: true,
      api: { maxRequests: 100, windowSeconds: 60, perUser: true },
      auth: { maxRequests: 10, windowSeconds: 60, perUser: false },
      ai: { maxRequests: 20, windowSeconds: 60, perUser: true },
      public: { maxRequests: 30, windowSeconds: 60, perUser: false },
    },
    features: {
      rateLimitEnabled: true,
    },
  },
}));

// Mock auth middleware
jest.mock('@/lib/api/auth-middleware', () => ({
  getAuthUser: jest.fn().mockResolvedValue({ id: 'user-123' }),
}));

// Import after mocks
import {
  withRateLimit,
  rateLimitConfigs,
  checkRateLimitStatus,
  resetRateLimit,
  rateLimitStore,
} from '../rate-limit';
import type { RateLimitConfig } from '@/lib/config';

describe('rateLimitStore', () => {
  beforeEach(() => {
    rateLimitStore.clear();
  });

  describe('check()', () => {
    it('should allow requests within rate limit', () => {
      const key = 'test-key';
      const limit = 5;
      const windowSeconds = 60;

      // First request should succeed
      const result = rateLimitStore.check(key, limit, windowSeconds);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should track remaining requests correctly', () => {
      const key = 'test-key';
      const limit = 3;
      const windowSeconds = 60;

      const result1 = rateLimitStore.check(key, limit, windowSeconds);
      expect(result1.remaining).toBe(2);

      const result2 = rateLimitStore.check(key, limit, windowSeconds);
      expect(result2.remaining).toBe(1);

      const result3 = rateLimitStore.check(key, limit, windowSeconds);
      expect(result3.remaining).toBe(0);

      // Fourth request should be denied
      const result4 = rateLimitStore.check(key, limit, windowSeconds);
      expect(result4.allowed).toBe(false);
      expect(result4.remaining).toBe(0);
    });

    it('should use sliding window algorithm', () => {
      const key = 'sliding-test';
      const limit = 2;
      const windowSeconds = 1; // 1 second window

      // Use up the limit
      rateLimitStore.check(key, limit, windowSeconds);
      rateLimitStore.check(key, limit, windowSeconds);

      const result = rateLimitStore.check(key, limit, windowSeconds);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const afterExpiry = rateLimitStore.check(key, limit, windowSeconds);
          expect(afterExpiry.allowed).toBe(true);
          resolve();
        }, 1100);
      });
    });

    it('should keep separate counts for different keys', () => {
      const limit = 2;
      const windowSeconds = 60;

      // Use up limit for key1
      rateLimitStore.check('key1', limit, windowSeconds);
      rateLimitStore.check('key1', limit, windowSeconds);
      
      // key1 should be blocked
      expect(rateLimitStore.check('key1', limit, windowSeconds).allowed).toBe(false);
      
      // key2 should still work
      expect(rateLimitStore.check('key2', limit, windowSeconds).allowed).toBe(true);
    });
  });

  describe('peek()', () => {
    it('should return status without consuming a request', () => {
      const key = 'peek-test';
      const limit = 3;
      const windowSeconds = 60;

      // Make one request
      rateLimitStore.check(key, limit, windowSeconds);

      // Peek should show 2 remaining
      const peek1 = rateLimitStore.peek(key, limit);
      expect(peek1.remaining).toBe(2);

      // Peek again should still show 2 remaining (not consumed)
      const peek2 = rateLimitStore.peek(key, limit);
      expect(peek2.remaining).toBe(2);

      // Actual check should now consume
      const checkResult = rateLimitStore.check(key, limit, windowSeconds);
      expect(checkResult.remaining).toBe(1);
    });
  });

  describe('reset()', () => {
    it('should clear rate limit for a specific key', () => {
      const key = 'reset-test';
      const limit = 2;
      const windowSeconds = 60;

      // Use up limit
      rateLimitStore.check(key, limit, windowSeconds);
      rateLimitStore.check(key, limit, windowSeconds);
      expect(rateLimitStore.check(key, limit, windowSeconds).allowed).toBe(false);

      // Reset the key
      rateLimitStore.reset(key);

      // Should be allowed again
      expect(rateLimitStore.check(key, limit, windowSeconds).allowed).toBe(true);
    });
  });
});

describe('withRateLimit', () => {
  const mockHandler = jest.fn();

  beforeEach(() => {
    mockHandler.mockReset();
    rateLimitStore.clear();
    // Return a proper NextResponse that has all required methods
    mockHandler.mockImplementation(async () => {
      return NextResponse.json({ success: true }, { status: 200 });
    });
  });

  const createMockRequest = (ip: string): NextRequest => {
    const url = 'http://localhost:3000/api/test';
    const request = new NextRequest(url, {
      headers: {
        'x-forwarded-for': ip,
      },
    });
    
    return request;
  };

  it('should call handler when within rate limit', async () => {
    const rateLimitedHandler = withRateLimit(mockHandler, {
      maxRequests: 100,
      windowSeconds: 60,
      perUser: false,
    });

    const request = createMockRequest('192.168.1.100');
    const response = await rateLimitedHandler(request);

    expect(mockHandler).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('should add rate limit headers to response', async () => {
    const rateLimitedHandler = withRateLimit(mockHandler, {
      maxRequests: 10,
      windowSeconds: 60,
      perUser: false,
    });

    const request = createMockRequest('192.168.1.101');
    const response = await rateLimitedHandler(request);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
    expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });

  it('should return 429 when rate limit exceeded', async () => {
    const config: RateLimitConfig = {
      maxRequests: 2,
      windowSeconds: 60,
      perUser: false,
    };
    
    const rateLimitedHandler = withRateLimit(mockHandler, config);
    const request = createMockRequest('192.168.1.200');

    // Use up the limit
    await rateLimitedHandler(request);
    await rateLimitedHandler(request);

    // Third request should be rate limited
    const response = await rateLimitedHandler(request);
    
    expect(response.status).toBe(429);
    
    const body = await response.json();
    expect(body.error).toBe('Too many requests');
    expect(body.message).toContain('Rate limit exceeded');
    expect(response.headers.get('Retry-After')).toBeDefined();
  });

  it('should use different keys for different IPs', async () => {
    const config: RateLimitConfig = {
      maxRequests: 1,
      windowSeconds: 60,
      perUser: false,
    };
    
    const rateLimitedHandler = withRateLimit(mockHandler, config);
    
    const request1 = createMockRequest('10.0.0.1');
    const request2 = createMockRequest('10.0.0.2');

    // First IP
    const response1 = await rateLimitedHandler(request1);
    expect(response1.status).toBe(200);

    // Second IP should still work (different key)
    const response2 = await rateLimitedHandler(request2);
    expect(response2.status).toBe(200);

    // First IP should now be blocked
    const response3 = await rateLimitedHandler(request1);
    expect(response3.status).toBe(429);
  });

  it('should pass context to handler', async () => {
    const rateLimitedHandler = withRateLimit(mockHandler, rateLimitConfigs.api);
    const request = createMockRequest('192.168.1.102');
    const context = { params: { id: '123' } };

    await rateLimitedHandler(request, context);

    expect(mockHandler).toHaveBeenCalledWith(request, context);
  });
});

describe('rateLimitConfigs', () => {
  it('should have predefined configurations', () => {
    expect(rateLimitConfigs.api).toBeDefined();
    expect(rateLimitConfigs.auth).toBeDefined();
    expect(rateLimitConfigs.ai).toBeDefined();
    expect(rateLimitConfigs.public).toBeDefined();
  });

  it('should have stricter limits for auth routes', () => {
    expect(rateLimitConfigs.auth.maxRequests).toBeLessThan(
      rateLimitConfigs.api.maxRequests
    );
  });

  it('should use per-user limiting for AI routes', () => {
    expect(rateLimitConfigs.ai.perUser).toBe(true);
  });

  it('should use IP-based limiting for public routes', () => {
    expect(rateLimitConfigs.public.perUser).toBe(false);
  });
});

describe('checkRateLimitStatus', () => {
  beforeEach(() => {
    rateLimitStore.clear();
  });

  it('should return status without consuming request', () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.50' },
    });

    const config: RateLimitConfig = {
      maxRequests: 10,
      windowSeconds: 60,
      perUser: false,
    };

    const status = checkRateLimitStatus(request, config);

    expect(status).toHaveProperty('remaining');
    expect(status).toHaveProperty('limit');
    expect(status).toHaveProperty('resetAt');
    expect(status.limit).toBe(10);
  });
});

describe('resetRateLimit', () => {
  beforeEach(() => {
    rateLimitStore.clear();
  });

  it('should reset rate limit for a key', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: { 'x-forwarded-for': '192.168.1.60' },
    });

    const config: RateLimitConfig = {
      maxRequests: 1,
      windowSeconds: 60,
      perUser: false,
    };

    const handler = jest.fn().mockImplementation(async () => 
      NextResponse.json({})
    );
    const rateLimitedHandler = withRateLimit(handler, config);

    // Use up the limit
    await rateLimitedHandler(request);
    
    // Should be blocked
    const blockedResponse = await rateLimitedHandler(request);
    expect(blockedResponse.status).toBe(429);

    // Reset the limit
    resetRateLimit(request, config);

    // Should work again
    const afterReset = await rateLimitedHandler(request);
    expect(afterReset.status).toBe(200);
  });
});
