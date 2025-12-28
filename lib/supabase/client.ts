/**
 * Supabase Client-Side Client for Portfolio Forge
 * 
 * This module provides client-side Supabase client utilities for:
 * - Client Components
 * - Browser-side operations
 * - File uploads to Supabase Storage
 * - Real-time subscriptions
 * - OAuth authentication flows
 * 
 * The client automatically includes the user's session from cookies.
 * 
 * Usage in Client Components:
 * ```tsx
 * 'use client'
 * import { createBrowserClient } from '@/lib/supabase/client'
 * 
 * export default function Component() {
 *   const supabase = createBrowserClient()
 *   
 *   async function fetchData() {
 *     const { data } = await supabase.from('portfolios').select('*')
 *     return data
 *   }
 *   
 *   return <div>...</div>
 * }
 * ```
 * 
 * File Upload Example:
 * ```tsx
 * const supabase = createBrowserClient()
 * const file = event.target.files[0]
 * const { data, error } = await supabase.storage
 *   .from('certifications')
 *   .upload(`${userId}/${file.name}`, file)
 * ```
 */

import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import { Database } from './types'

/**
 * Creates a Supabase client for browser/client-side use
 * Automatically reads cookies and includes auth session
 * This client is safe to use in Client Components
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Storage utilities for file uploads
 */
export const storage = {
  /**
   * Uploads a certification file (PDF or image) to Supabase Storage
   * Files are organized by user ID: certifications/{userId}/{filename}
   * 
   * @param userId - The authenticated user's ID
   * @param file - The File object to upload
   * @param fileName - Optional custom filename (defaults to file.name)
   * @returns Upload result with path and error if any
   */
  uploadCertification: async (
    userId: string,
    file: File,
    fileName?: string
  ) => {
    const supabase = createBrowserClient()
    
    // Generate unique filename with timestamp to avoid collisions
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const finalFileName = fileName || `${timestamp}-${file.name}`
    const filePath = `${userId}/${finalFileName}`
    
    const { data, error } = await supabase.storage
      .from('certifications')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })
    
    if (error) {
      return { data: null, error, path: null }
    }
    
    return {
      data,
      error: null,
      path: filePath,
      fileType: file.type,
    }
  },

  /**
   * Gets a public URL for a certification file
   * Note: For private files, use getSignedUrl instead
   * 
   * @param filePath - The file path in storage (e.g., userId/filename)
   * @returns Public URL to access the file
   */
  getCertificationPublicUrl: (filePath: string) => {
    const supabase = createBrowserClient()
    
    const { data } = supabase.storage
      .from('certifications')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  /**
   * Gets a signed URL for a private certification file
   * Signed URLs expire after the specified duration
   * 
   * @param filePath - The file path in storage
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL with expiration
   */
  getCertificationSignedUrl: async (
    filePath: string,
    expiresIn: number = 3600
  ) => {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase.storage
      .from('certifications')
      .createSignedUrl(filePath, expiresIn)
    
    if (error) {
      return { data: null, error }
    }
    
    return { data, error: null }
  },

  /**
   * Deletes a certification file from storage
   * 
   * @param filePath - The file path to delete
   * @returns Deletion result
   */
  deleteCertification: async (filePath: string) => {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase.storage
      .from('certifications')
      .remove([filePath])
    
    return { data, error }
  },

  /**
   * Lists all files for a user in the certifications bucket
   * 
   * @param userId - The user's ID
   * @returns List of files
   */
  listUserCertifications: async (userId: string) => {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase.storage
      .from('certifications')
      .list(userId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })
    
    return { data, error }
  },
}

/**
 * Auth utilities for client-side authentication
 */
export const auth = {
  /**
   * Sign in with OAuth provider (Google, GitHub, LinkedIn)
   * 
   * @param provider - OAuth provider name
   * @param redirectTo - URL to redirect after successful sign-in
   * @returns Sign-in result
   */
  signInWithOAuth: async (
    provider: 'google' | 'github' | 'azure' | 'linkedin',
    redirectTo?: string
  ) => {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    })
    
    return { data, error }
  },

  /**
   * Sign out the current user
   * 
   * @returns Sign-out result
   */
  signOut: async () => {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Get the current session
   * 
   * @returns Current session or null
   */
  getSession: async () => {
    const supabase = createBrowserClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Get the current user
   * 
   * @returns Current user or null
   */
  getUser: async () => {
    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  /**
   * Listen to auth state changes
   * Useful for updating UI when user signs in/out
   * 
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange: (
    callback: (event: string, session: any) => void
  ) => {
    const supabase = createBrowserClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      callback
    )
    
    return () => subscription.unsubscribe()
  },
}

/**
 * Real-time utilities for live data subscriptions
 */
export const realtime = {
  /**
   * Subscribe to changes in a table
   * 
   * @param table - Table name to subscribe to
   * @param callback - Function to call when data changes
   * @param filter - Optional filter conditions
   * @returns Unsubscribe function
   */
  subscribeToTable: (
    table: string,
    callback: (payload: any) => void,
    filter?: { column: string; value: string }
  ) => {
    const supabase = createBrowserClient()
    
    let channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter: `${filter.column}=eq.${filter.value}` }),
        },
        callback
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  },

  /**
   * Subscribe to portfolio changes for real-time updates
   * 
   * @param portfolioId - The portfolio ID to watch
   * @param callback - Function to call when portfolio changes
   * @returns Unsubscribe function
   */
  subscribeToPortfolio: (
    portfolioId: string,
    callback: (payload: any) => void
  ) => {
    return realtime.subscribeToTable('portfolios', callback, {
      column: 'id',
      value: portfolioId,
    })
  },
}
