/**
 * Logout Server Actions for Portfolio Forge
 * 
 * This file contains server actions for handling user logout.
 * Server actions run on the server and can be called from client components.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Signs out the current user and redirects to login
 * 
 * Usage in a client component:
 * ```tsx
 * import { signOut } from '@/app/(auth)/logout/actions'
 * 
 * <button onClick={() => signOut()}>Sign Out</button>
 * ```
 */
export async function signOut() {
  try {
    const supabase = await createServerClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      return { error: error.message }
    }

    // Revalidate all pages to clear cached data
    revalidatePath('/', 'layout')

  } catch (error) {
    console.error('Unexpected sign out error:', error)
    return { error: 'Failed to sign out' }
  }

  // Redirect to login page
  redirect('/login')
}

/**
 * Signs out the user without redirecting
 * Useful when you want to handle the redirect in the component
 * 
 * Usage:
 * ```tsx
 * const result = await signOutWithoutRedirect()
 * if (!result.error) {
 *   router.push('/login')
 * }
 * ```
 */
export async function signOutWithoutRedirect() {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }

    // Revalidate all pages to clear cached data
    revalidatePath('/', 'layout')

    return { success: true, error: null }

  } catch (error) {
    console.error('Unexpected sign out error:', error)
    return { success: false, error: 'Failed to sign out' }
  }
}
