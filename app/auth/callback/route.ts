/**
 * OAuth Callback Handler for Portfolio Forge
 * 
 * This route handles the OAuth callback from authentication providers.
 * After the user authorizes on the provider's site, they are redirected here
 * with a code that we exchange for a session.
 * 
 * Flow:
 * 1. User clicks "Sign in with Google/GitHub/LinkedIn" on /login
 * 2. User authorizes on provider's site
 * 3. Provider redirects to /auth/callback?code=...
 * 4. We exchange the code for a session
 * 5. We create/update the user's profile
 * 6. We redirect to /dashboard (or original redirectTo URL)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors (user cancelled, etc.)
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  // Code must be present for OAuth flow
  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=No authorization code provided`
    )
  }

  const cookieStore = await cookies()

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Handle cookie setting errors
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )

  try {
    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=${encodeURIComponent(sessionError.message)}`
      )
    }

    if (!session) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=Failed to create session`
      )
    }

    // Check if profile exists, create if not
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single()

    // Create profile if it doesn't exist
    if (!existingProfile && profileCheckError?.code === 'PGRST116') {
      const { error: profileCreateError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || null,
          avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || null,
        })

      if (profileCreateError) {
        console.error('Profile creation error:', profileCreateError)
        // Don't fail the auth flow, profile can be created later
      }
    }

    // Successful authentication - redirect to destination
    const redirectUrl = new URL(redirectTo, requestUrl.origin)
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Callback handler error:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=Authentication failed`
    )
  }
}
