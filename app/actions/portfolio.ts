/**
 * Server Actions for Portfolio Management
 *
 * This file demonstrates using Supabase server client in Server Actions
 * Server Actions are functions that run on the server and can be called from client components
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// Note: Supabase type inference issues require type assertions
// TODO: Fix when @supabase/ssr updates type inference

'use server'

import { createServerClient, getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Creates a new portfolio for the authenticated user
 */
export async function createPortfolio(formData: FormData) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string | null
    const theme = (formData.get('theme') as string) || 'default'
    const isPublic = formData.get('is_public') === 'true'

    if (!title || !slug) {
      return { error: 'Title and slug are required' }
    }

    const supabase = await createServerClient()

    const { data, error } = await (supabase.from('portfolios') as any)
      .insert({
        user_id: user.id,
        title,
        slug,
        description,
        theme,
        is_public: isPublic,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Revalidate the dashboard page to show the new portfolio
    revalidatePath('/dashboard')

    return { data }
  } catch (_error) {
    return { error: 'Failed to create portfolio' }
  }
}

/**
 * Updates an existing portfolio
 */
export async function updatePortfolio(portfolioId: string, formData: FormData) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const theme = formData.get('theme') as string
    const isPublic = formData.get('is_public') === 'true'

    const supabase = await createServerClient()

    // RLS will ensure the user can only update their own portfolio
    const { data, error } = await (supabase.from('portfolios') as any)
      .update({
        title,
        description,
        theme,
        is_public: isPublic,
      })
      .eq('id', portfolioId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/portfolio/${portfolioId}`)

    return { data }
  } catch (_error) {
    return { error: 'Failed to update portfolio' }
  }
}

/**
 * Soft deletes a portfolio
 */
export async function deletePortfolio(portfolioId: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const supabase = await createServerClient()

    // RLS will ensure the user can only delete their own portfolio
    const { error } = await (supabase.from('portfolios') as any)
      .update({ is_deleted: true })
      .eq('id', portfolioId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')

    return { success: true }
  } catch (_error) {
    return { error: 'Failed to delete portfolio' }
  }
}

/**
 * Creates a public link for a portfolio
 */
export async function createPublicLink(portfolioId: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const supabase = await createServerClient()

    // First verify the portfolio belongs to the user
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolioId)
      .single()

    if (portfolioError || !portfolio) {
      return { error: 'Portfolio not found' }
    }

    // Generate a token using the database function
    const { data: tokenData, error: tokenError } = await supabase.rpc('generate_public_link_token')

    if (tokenError || !tokenData) {
      return { error: 'Failed to generate token' }
    }

    // Create the public link
    const { data, error } = await (supabase.from('public_links') as any)
      .insert({
        portfolio_id: portfolioId,
        token: tokenData,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/portfolio/${portfolioId}`)

    return { data }
  } catch (_error) {
    return { error: 'Failed to create public link' }
  }
}

/**
 * Deactivates a public link
 */
export async function deactivatePublicLink(linkId: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const supabase = await createServerClient()

    // RLS will ensure the user can only deactivate their own links
    const { error } = await (supabase.from('public_links') as any)
      .update({ is_active: false })
      .eq('id', linkId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')

    return { success: true }
  } catch (_error) {
    return { error: 'Failed to deactivate link' }
  }
}
