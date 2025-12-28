/**
 * Rewrite Portfolio Agent
 * 
 * High-level agent that rewrites all sections of a portfolio
 * with a specified tone while maintaining factual accuracy.
 */

import { createServerClient } from "@/lib/supabase/server";
import { improveText, type Tone } from "../abilities/improveText";

interface RewrittenSection {
  id: string;
  type: string;
  updatedContent: any;
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
  const supabase = await createServerClient();
  
  // Fetch all portfolio sections for the user
  // First get the user's portfolios
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId);
  
  if (!portfolios || portfolios.length === 0) {
    return { sections: [] };
  }
  
  // For simplicity, use the first portfolio
  // In production, you might want to specify which portfolio to rewrite
  const portfolioId = portfolios[0].id;
  
  // Fetch all sections for this portfolio
  const { data: sections } = await supabase
    .from("portfolio_sections")
    .select("id, section_type, content")
    .eq("portfolio_id", portfolioId)
    .in("section_type", ["summary", "skills", "work_experience", "custom"]);
  
  if (!sections || sections.length === 0) {
    return { sections: [] };
  }
  
  const rewrittenSections: RewrittenSection[] = [];
  
  // Process each section
  for (const section of sections) {
    try {
      let textToImprove = "";
      let updatedContent = { ...section.content };
      
      // Extract text based on section type
      switch (section.section_type) {
        case "summary":
          textToImprove = section.content?.text || "";
          if (textToImprove.trim()) {
            const improved = await improveText({ text: textToImprove, tone });
            updatedContent = { text: improved.improved };
          }
          break;
        
        case "skills":
          const skills = section.content?.skills || [];
          if (skills.length > 0) {
            textToImprove = skills.join("\n");
            const improved = await improveText({ text: textToImprove, tone });
            // Split back into array
            updatedContent = {
              skills: improved.improved.split("\n").filter(s => s.trim()),
            };
          }
          break;
        
        case "work_experience":
          textToImprove = section.content?.description || "";
          if (textToImprove.trim()) {
            const improved = await improveText({ text: textToImprove, tone });
            updatedContent = {
              ...section.content,
              description: improved.improved,
            };
          }
          break;
        
        case "custom":
          textToImprove = section.content?.text || "";
          if (textToImprove.trim()) {
            const improved = await improveText({ text: textToImprove, tone });
            updatedContent = { text: improved.improved };
          }
          break;
      }
      
      // Only include sections that had content to improve
      if (textToImprove.trim()) {
        rewrittenSections.push({
          id: section.id,
          type: section.section_type,
          updatedContent,
        });
      }
    } catch (error) {
      console.error(`Failed to rewrite section ${section.id}:`, error);
      // Continue with other sections even if one fails
    }
  }
  
  return { sections: rewrittenSections };
}
