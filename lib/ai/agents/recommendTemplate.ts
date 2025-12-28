/**
 * Recommend Template and Theme Agent
 * 
 * Analyzes portfolio content and recommends optimal template,
 * theme, and section ordering based on content characteristics.
 */

import { createServerClient } from "@/lib/supabase/server";
import { aiComplete } from "../router";

/**
 * Recommend template and theme based on user's portfolio content
 * 
 * Analyzes all portfolio sections to suggest optimal template, theme,
 * and section ordering based on content characteristics.
 * 
 * @param userId - The user's UUID
 * @returns Recommendations with template, theme, section order, and rationale
 */
export async function recommendTemplateAndTheme(userId: string): Promise<{
  recommendedTemplate: string;
  recommendedTheme: string;
  recommendedSectionOrder: string[];
  rationale: string;
}> {
  const supabase = await createServerClient();

  // Fetch all portfolio sections for the user
  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (!portfolios) {
    throw new Error("No portfolio found for user");
  }

  const { data: sections } = await supabase
    .from("portfolio_sections")
    .select("*")
    .eq("portfolio_id", portfolios.id)
    .order("display_order", { ascending: true });

  if (!sections || sections.length === 0) {
    throw new Error("No sections found in portfolio");
  }

  // Extract content characteristics
  let summaryText = "";
  let experienceDescriptions: string[] = [];
  let certifications: string[] = [];
  let skills: string[] = [];
  let customSections: string[] = [];
  
  for (const section of sections) {
    switch (section.section_type) {
      case "summary":
        summaryText = section.content?.text || "";
        break;
      case "work_experience":
        if (section.content?.description) {
          experienceDescriptions.push(section.content.description);
        }
        if (section.content?.jobs && Array.isArray(section.content.jobs)) {
          experienceDescriptions.push(
            ...section.content.jobs.map((job: any) => job.description || "")
          );
        }
        break;
      case "certifications":
        if (section.content?.certifications && Array.isArray(section.content.certifications)) {
          certifications = section.content.certifications.map(
            (cert: any) => cert.title || ""
          );
        }
        break;
      case "skills":
        if (section.content?.skills && Array.isArray(section.content.skills)) {
          skills = section.content.skills;
        }
        break;
      case "custom":
        if (section.title) {
          customSections.push(section.title);
        }
        break;
    }
  }

  // Build content profile
  const allText = [
    summaryText,
    ...experienceDescriptions,
    ...certifications,
    ...skills,
  ].join(" ").toLowerCase();

  const contentProfile = {
    senioritySignals: [
      allText.includes("senior") || allText.includes("lead") || allText.includes("principal"),
      allText.includes("architect") || allText.includes("director"),
      allText.includes("manager") || allText.includes("head of"),
    ].filter(Boolean).length,
    industryKeywords: {
      tech: allText.match(/\b(software|developer|engineer|programming|code|api|database)\b/gi)?.length || 0,
      creative: allText.match(/\b(design|creative|ux|ui|graphic|visual|art)\b/gi)?.length || 0,
      business: allText.match(/\b(business|management|strategy|consulting|sales|marketing)\b/gi)?.length || 0,
      data: allText.match(/\b(data|analytics|machine learning|ai|statistics|sql)\b/gi)?.length || 0,
    },
    contentDensity: allText.length,
    experienceCount: experienceDescriptions.length,
    certificationCount: certifications.length,
    skillsCount: skills.length,
    customSectionCount: customSections.length,
  };

  // Determine dominant industry
  const industries = Object.entries(contentProfile.industryKeywords);
  industries.sort((a, b) => b[1] - a[1]);
  const dominantIndustry = industries[0][0];

  // Use AI to generate recommendations
  const systemPrompt = `You are an expert portfolio designer and career advisor.
Based on the user's content profile, recommend the best template, theme, and section order.

Available templates:
- single-column: Simple, linear layout. Good for minimal content or entry-level professionals.
- two-column: Sidebar + main content. Good for moderate content, highlights skills.
- timeline: Chronological layout. Best for showing career progression.
- grid: Card-based layout. Best for showcasing projects or diverse skills.

Available themes:
- professional: Clean, corporate style. Safe for traditional industries.
- modern: Contemporary, bold. Good for tech and startups.
- creative: Colorful, unique. Best for designers and creative roles.
- minimal: Simple, elegant. Good for senior roles and consultants.
- elegant: Sophisticated, premium. Good for executives and high-level professionals.

Section types you might see:
- summary, skills, work_experience, certifications, custom sections (like Education, Projects, etc.)

Return ONLY valid JSON in this format:
{
  "recommendedTemplate": "template-name",
  "recommendedTheme": "theme-name",
  "recommendedSectionOrder": ["section_type_1", "section_type_2", ...],
  "rationale": "Brief explanation (2-3 sentences) of why these recommendations fit the user's profile"
}`;

  const userPrompt = `Analyze this portfolio content profile and recommend template, theme, and section order:

Seniority signals: ${contentProfile.senioritySignals}/3
Industry keywords:
- Tech: ${contentProfile.industryKeywords.tech}
- Creative: ${contentProfile.industryKeywords.creative}
- Business: ${contentProfile.industryKeywords.business}
- Data: ${contentProfile.industryKeywords.data}

Dominant industry: ${dominantIndustry}
Content density: ${contentProfile.contentDensity} characters
Experience count: ${contentProfile.experienceCount}
Certifications: ${contentProfile.certificationCount}
Skills: ${contentProfile.skillsCount}
Custom sections: ${contentProfile.customSectionCount}

Current section order: ${sections.map(s => s.section_type).join(", ")}

Recommend the optimal template, theme, and section order for maximum impact.`;

  try {
    const result = await aiComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 512,
    });

    const parsed = JSON.parse(result.text);

    return {
      recommendedTemplate: parsed.recommendedTemplate || "single-column",
      recommendedTheme: parsed.recommendedTheme || "professional",
      recommendedSectionOrder: parsed.recommendedSectionOrder || sections.map(s => s.section_type),
      rationale: parsed.rationale || "Recommendations based on your content profile.",
    };
  } catch (error) {
    console.error("Failed to generate recommendations:", error);
    
    // Fallback recommendations based on simple heuristics
    let template = "single-column";
    let theme = "professional";
    
    if (contentProfile.experienceCount >= 3) {
      template = "timeline";
    } else if (contentProfile.skillsCount >= 10) {
      template = "grid";
    } else if (contentProfile.experienceCount >= 2 || contentProfile.skillsCount >= 5) {
      template = "two-column";
    }
    
    if (dominantIndustry === "creative") {
      theme = "creative";
    } else if (dominantIndustry === "tech" || dominantIndustry === "data") {
      theme = "modern";
    } else if (contentProfile.senioritySignals >= 2) {
      theme = "elegant";
    }
    
    return {
      recommendedTemplate: template,
      recommendedTheme: theme,
      recommendedSectionOrder: sections.map(s => s.section_type),
      rationale: "Based on your content profile, we recommend a layout that highlights your strengths.",
    };
  }
}
