/**
 * Optimize Portfolio for Job Agent
 * 
 * Analyzes a job description and optimizes portfolio content
 * to emphasize relevant skills and experience.
 */

import { createServerClient } from "@/lib/supabase/server";
import { improveText, type Tone } from "../abilities/improveText";
import { aiComplete } from "../router";

interface RewrittenSection {
  id: string;
  type: string;
  updatedContent: any;
}

interface JobInsights {
  requiredSkills: string[];
  responsibilities: string[];
  keywords: string[];
  senioritySignals: string[];
}

interface OptimizePortfolioResult {
  updatedSections: RewrittenSection[];
  suggestedSkills: string[];
  jobInsights: JobInsights;
}

/**
 * Analyze a job description to extract key information
 * 
 * Uses AI to parse job description and identify required skills,
 * responsibilities, keywords, and seniority signals.
 * 
 * @param jobDescription - The job description text
 * @returns Structured job insights
 */
async function analyzeJobDescription(jobDescription: string): Promise<JobInsights> {
  const systemPrompt = `You are an expert at analyzing job descriptions.
Extract the following information from the job description:
- Required skills (technologies, tools, methodologies)
- Key responsibilities
- Important keywords that should appear in a matching portfolio
- Seniority signals (junior, mid-level, senior, lead, etc.)

Return ONLY valid JSON in this exact format:
{
  "requiredSkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "keywords": ["keyword1", "keyword2"],
  "senioritySignals": ["signal1", "signal2"]
}`;

  const userPrompt = `Analyze this job description:

${jobDescription}

Return JSON with the extracted information.`;

  try {
    const result = await aiComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 512,
    });

    const parsed = JSON.parse(result.text);
    
    return {
      requiredSkills: parsed.requiredSkills || [],
      responsibilities: parsed.responsibilities || [],
      keywords: parsed.keywords || [],
      senioritySignals: parsed.senioritySignals || [],
    };
  } catch (error) {
    console.error("Failed to analyze job description:", error);
    // Return empty arrays on error
    return {
      requiredSkills: [],
      responsibilities: [],
      keywords: [],
      senioritySignals: [],
    };
  }
}

/**
 * Optimize entire portfolio for a specific job description
 * 
 * Analyzes the job description to understand requirements, then rewrites
 * all portfolio sections to emphasize relevant skills, experience, and keywords.
 * Also suggests missing skills that should be added.
 * 
 * @param userId - The user's UUID
 * @param jobDescription - The target job description
 * @returns Optimized sections, suggested skills, and job insights
 */
export async function optimizePortfolioForJob(
  userId: string,
  jobDescription: string
): Promise<OptimizePortfolioResult> {
  const supabase = await createServerClient();
  
  // Analyze job description first
  const jobInsights = await analyzeJobDescription(jobDescription);
  
  // Determine tone based on seniority signals
  let tone: Tone = "concise";
  const seniorityText = jobInsights.senioritySignals.join(" ").toLowerCase();
  if (seniorityText.includes("senior") || seniorityText.includes("lead") || seniorityText.includes("principal")) {
    tone = "senior";
  } else if (seniorityText.includes("technical") || seniorityText.includes("engineer")) {
    tone = "technical";
  }
  
  // Fetch user's portfolios
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId);
  
  if (!portfolios || portfolios.length === 0) {
    return {
      updatedSections: [],
      suggestedSkills: jobInsights.requiredSkills,
      jobInsights,
    };
  }
  
  const portfolioId = portfolios[0].id;
  
  // Fetch all sections
  const { data: sections } = await supabase
    .from("portfolio_sections")
    .select("id, section_type, content")
    .eq("portfolio_id", portfolioId)
    .in("section_type", ["summary", "skills", "work_experience", "custom"]);
  
  if (!sections || sections.length === 0) {
    return {
      updatedSections: [],
      suggestedSkills: jobInsights.requiredSkills,
      jobInsights,
    };
  }
  
  const updatedSections: RewrittenSection[] = [];
  let userSkills: string[] = [];
  
  // Process each section with job context
  for (const section of sections) {
    try {
      let textToImprove = "";
      let updatedContent = { ...section.content };
      
      // Build context-aware prompt suffix
      const contextSuffix = `\n\nOptimize this for a job that requires: ${jobInsights.requiredSkills.slice(0, 5).join(", ")}. Emphasize relevant experience with: ${jobInsights.responsibilities.slice(0, 3).join(", ")}.`;
      
      switch (section.section_type) {
        case "summary":
          textToImprove = section.content?.text || "";
          if (textToImprove.trim()) {
            const enhanced = textToImprove + contextSuffix;
            const improved = await improveText({ text: enhanced, tone });
            updatedContent = { text: improved.improved };
          }
          break;
        
        case "skills":
          userSkills = section.content?.skills || [];
          if (userSkills.length > 0) {
            textToImprove = userSkills.join("\n");
            // Don't add context suffix for skills - just improve formatting
            const improved = await improveText({ text: textToImprove, tone });
            updatedContent = {
              skills: improved.improved.split("\n").filter(s => s.trim()),
            };
          }
          break;
        
        case "work_experience":
          textToImprove = section.content?.description || "";
          if (textToImprove.trim()) {
            const enhanced = textToImprove + contextSuffix;
            const improved = await improveText({ text: enhanced, tone });
            updatedContent = {
              ...section.content,
              description: improved.improved,
            };
          }
          break;
        
        case "custom":
          textToImprove = section.content?.text || "";
          if (textToImprove.trim()) {
            const enhanced = textToImprove + contextSuffix;
            const improved = await improveText({ text: enhanced, tone });
            updatedContent = { text: improved.improved };
          }
          break;
      }
      
      if (textToImprove.trim()) {
        updatedSections.push({
          id: section.id,
          type: section.section_type,
          updatedContent,
        });
      }
    } catch (error) {
      console.error(`Failed to optimize section ${section.id}:`, error);
      // Continue with other sections
    }
  }
  
  // Suggest missing skills by comparing job requirements with user's skills
  const suggestedSkills = jobInsights.requiredSkills.filter(
    (reqSkill) => !userSkills.some(
      (userSkill) => userSkill.toLowerCase().includes(reqSkill.toLowerCase())
    )
  );
  
  return {
    updatedSections,
    suggestedSkills,
    jobInsights,
  };
}
