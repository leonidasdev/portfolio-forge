/**
 * Generate Summary Agent
 * 
 * High-level agent that generates a portfolio summary for a user
 * by fetching their data and using AI to create a cohesive summary.
 */

import { createServerClient } from "@/lib/supabase/server";
import { generateSummary } from "../abilities/generateSummary";

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
  const supabase = await createServerClient();
  
  // Fetch certifications
  const { data: certifications } = await supabase
    .from("certifications")
    .select("title, issuer")
    .eq("user_id", userId);
  
  // Fetch work experience
  const { data: experience } = await supabase
    .from("work_experience")
    .select("role, company, description")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });
  
  // Fetch skills
  const { data: skills } = await supabase
    .from("skills")
    .select("name")
    .eq("user_id", userId);
  
  // Convert to text blocks
  let certificationsText: string | undefined;
  let experienceText: string | undefined;
  let skillsText: string | undefined;
  
  // Build certifications text
  if (certifications && certifications.length > 0) {
    certificationsText = certifications
      .map(cert => `${cert.title} – ${cert.issuer}`)
      .join("\n");
  }
  
  // Build experience text
  if (experience && experience.length > 0) {
    experienceText = experience
      .map(exp => {
        const parts = [`${exp.role} at ${exp.company}`];
        if (exp.description) {
          parts.push(exp.description);
        }
        return parts.join(": ");
      })
      .join("\n\n");
  }
  
  // Build skills text
  if (skills && skills.length > 0) {
    skillsText = skills
      .map(skill => skill.name)
      .join(", ");
  }
  
  // Generate summary using AI
  const result = await generateSummary({
    certificationsText,
    experienceText,
    skillsText,
    maxWords: 120,
  });
  
  return { summary: result.summary };
}
