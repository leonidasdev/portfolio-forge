/**
 * Server Actions for Portfolio Management
 *
 * This file demonstrates using Supabase server client in Server Actions
 * Server Actions are functions that run on the server and can be called from client components
 */

'use server'

import { queries } from '@/lib/supabase/queries'
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

    // Use typed query helper
    const { data, error } = await queries.portfolios.create(supabase, {
      user_id: user.id,
      title,
      slug,
      description,
      theme,
      is_public: isPublic,
    })

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

    // Use typed query helper (RLS will ensure the user can only update their own portfolio)
    const { data, error } = await queries.portfolios.update(supabase, portfolioId, {
      title,
      description,
      theme,
      is_public: isPublic,
    })

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

    // Use typed query helper (RLS will ensure the user can only delete their own portfolio)
    const { error } = await queries.portfolios.softDelete(supabase, portfolioId)

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

    // First verify the portfolio belongs to the user using typed query helper
    const { data: portfolio, error: portfolioError } = await queries.portfolios.getById(
      supabase,
      portfolioId
    )

    if (portfolioError || !portfolio) {
      return { error: 'Portfolio not found' }
    }

    // Generate a token using the database function
    const { data: tokenData, error: tokenError } = await supabase.rpc('generate_public_link_token')

    if (tokenError || !tokenData) {
      return { error: 'Failed to generate token' }
    }

    // Create the public link using typed query helper
    const { data, error } = await queries.publicLinks.create(supabase, {
      portfolio_id: portfolioId,
      token: tokenData,
      is_active: true,
    })

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

    // Use typed query helper (RLS will ensure the user can only deactivate their own links)
    const { error } = await queries.publicLinks.update(supabase, linkId, { is_active: false })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')

    return { success: true }
  } catch (_error) {
    return { error: 'Failed to deactivate link' }
  }
}
