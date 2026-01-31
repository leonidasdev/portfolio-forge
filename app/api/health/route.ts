/**
 * Health Check API Endpoint
 *
 * Provides system health status including:
 * - Overall application status
 * - Database connectivity
 * - Redis connectivity (if configured)
 * - AI service availability
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: CheckResult
    redis: CheckResult
    ai: CheckResult
  }
  uptime: number
}

interface CheckResult {
  status: 'ok' | 'error' | 'skipped'
  latency?: number
  message?: string
}

const startTime = Date.now()

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return { status: 'error', message: 'Database not configured' }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { error } = await supabase.from('portfolios').select('id').limit(1)

    if (error) {
      return { status: 'error', message: error.message, latency: Date.now() - start }
    }

    return { status: 'ok', latency: Date.now() - start }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    }
  }
}

async function checkRedis(): Promise<CheckResult> {
  const start = Date.now()

  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!redisUrl || !redisToken) {
      return { status: 'skipped', message: 'Redis not configured (using in-memory fallback)' }
    }

    // Simple ping to Redis
    const response = await fetch(`${redisUrl}/ping`, {
      headers: {
        Authorization: `Bearer ${redisToken}`,
      },
    })

    if (!response.ok) {
      return {
        status: 'error',
        message: `Redis returned ${response.status}`,
        latency: Date.now() - start,
      }
    }

    return { status: 'ok', latency: Date.now() - start }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    }
  }
}

async function checkAI(): Promise<CheckResult> {
  const start = Date.now()

  try {
    const groqKey = process.env.GROQ_API_KEY

    if (!groqKey) {
      return { status: 'error', message: 'Groq API key not configured' }
    }

    // Just check if the key format looks valid (don't make actual API call)
    if (groqKey.length < 20) {
      return { status: 'error', message: 'Groq API key appears invalid' }
    }

    return { status: 'ok', latency: Date.now() - start }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      latency: Date.now() - start,
    }
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const [database, redis, ai] = await Promise.all([checkDatabase(), checkRedis(), checkAI()])

  const checks = { database, redis, ai }

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (database.status === 'error') {
    status = 'unhealthy'
  } else if (redis.status === 'error' || ai.status === 'error') {
    status = 'degraded'
  }

  const health: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
