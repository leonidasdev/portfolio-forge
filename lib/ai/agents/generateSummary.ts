/**
 * Generate Summary Agent
 *
 * High-level agent that generates a portfolio summary for a user
 * by fetching their data and using AI to create a cohesive summary.
 */

import { queries } from '@/lib/supabase/queries'
import { createServerClient } from '@/lib/supabase/server'
import { generateSummary } from '../abilities/generateSummary'

/**
 * Generate a professional summary for a user's portfolio
 *
 * Fetches the user's certifications, work experience, and skills,
 * then uses AI to generate a cohesive 120-word summary.
 *
 * @param userId - The user's UUID
 * @returns Promise containing the generated summary text
 */
export async function generatePortfolioSummaryForUser(
  userId: string
): Promise<{ summary: string }> {
  const supabase = await createServerClient()

  // Fetch user data using typed queries
  const [certResult, expResult, skillResult] = await Promise.all([
    queries.certifications.list(supabase),
    queries.workExperience.list(supabase),
    queries.skills.list(supabase),
  ])

  const certifications = certResult.data
  const experience = expResult.data
  const skills = skillResult.data

  // Convert to text blocks
  let certificationsText: string | undefined
  let experienceText: string | undefined
  let skillsText: string | undefined

  // Build certifications text
  if (certifications && certifications.length > 0) {
    certificationsText = certifications
      .map((cert) => `${cert.title} – ${cert.issuing_organization}`)
      .join('\n')
  }

  // Build experience text
  if (experience && experience.length > 0) {
    experienceText = experience
      .map((exp) => {
        const parts = [`${exp.position} at ${exp.company}`]
        if (exp.description) {
          parts.push(exp.description)
        }
        return parts.join(': ')
      })
      .join('\n\n')
  }

  // Build skills text
  if (skills && skills.length > 0) {
    skillsText = skills.map((skill) => skill.name).join(', ')
  }

  // Generate summary using AI
  const result = await generateSummary({
    certificationsText,
    experienceText,
    skillsText,
    maxWords: 120,
  })

  return { summary: result.summary }
}
