/**
 * Rewrite Portfolio Agent
 *
 * High-level agent that rewrites all sections of a portfolio
 * with a specified tone while maintaining factual accuracy.
 */

import { createServerClient } from '@/lib/supabase/server'
import { improveText, type Tone } from '../abilities/improveText'

interface RewrittenSection {
  id: string
  type: string
  updatedContent: Record<string, unknown>
}

/**
 * Rewrite entire portfolio for a user with specified tone
 *
 * Fetches all portfolio sections, rewrites each one using the improveText
 * ability with the specified tone, and returns updated content for each section.
 *
 * @param userId - The user's UUID
 * @param tone - The tone to use for rewriting (concise, formal, casual, senior, technical)
 * @returns Array of rewritten sections with their updated content
 */
export async function rewriteEntirePortfolio(
  userId: string,
  tone: Tone
): Promise<{ sections: RewrittenSection[] }> {
  const supabase = await createServerClient()

  // Fetch all portfolio sections for the user
  // First get the user's portfolios
  const { data: portfolios } = await (supabase.from('portfolios') as any)
    .select('id')
    .eq('user_id', userId)

  if (!portfolios || portfolios.length === 0) {
    return { sections: [] }
  }

  // For simplicity, use the first portfolio
  // In production, you might want to specify which portfolio to rewrite
  const portfolioId = portfolios[0].id

  // Fetch all sections for this portfolio
  const { data: sections } = await (supabase.from('portfolio_sections') as any)
    .select('id, section_type, custom_content, description')
    .eq('portfolio_id', portfolioId)
    .in('section_type', ['about', 'skills', 'experience', 'custom'])

  if (!sections || sections.length === 0) {
    return { sections: [] }
  }

  const rewrittenSections: RewrittenSection[] = []

  // Type for custom_content - flexible JSON structure
  type ContentJson = Record<string, unknown> | null

  // Process each section
  for (const section of sections) {
    try {
      let textToImprove = ''
      const content = section.custom_content as ContentJson
      let updatedContent: Record<string, unknown> = content ? { ...content } : {}

      // Extract text based on section type
      switch (section.section_type) {
        case 'about':
          textToImprove = (content?.text as string) || section.description || ''
          if (textToImprove.trim()) {
            const improved = await improveText({ text: textToImprove, tone })
            updatedContent = { text: improved.improved }
          }
          break

        case 'skills':
          const skills = (content?.skills as string[]) || []
          if (skills.length > 0) {
            textToImprove = skills.join('\n')
            const improved = await improveText({ text: textToImprove, tone })
            // Split back into array
            updatedContent = {
              skills: improved.improved.split('\n').filter((s) => s.trim()),
            }
          }
          break

        case 'experience':
          textToImprove = (content?.description as string) || section.description || ''
          if (textToImprove.trim()) {
            const improved = await improveText({ text: textToImprove, tone })
            updatedContent = {
              ...content,
              description: improved.improved,
            }
          }
          break

        case 'custom':
          textToImprove = (content?.text as string) || ''
          if (textToImprove.trim()) {
            const improved = await improveText({ text: textToImprove, tone })
            updatedContent = { text: improved.improved }
          }
          break
      }

      // Only include sections that had content to improve
      if (textToImprove.trim()) {
        rewrittenSections.push({
          id: section.id,
          type: section.section_type,
          updatedContent,
        })
      }
    } catch (error) {
      console.error(`Failed to rewrite section ${section.id}:`, error)
      // Continue with other sections even if one fails
    }
  }

  return { sections: rewrittenSections }
}
