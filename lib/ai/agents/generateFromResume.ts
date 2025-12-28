/**
 * Generate Portfolio from Resume Agent
 * 
 * Extracts structured data from resume text and generates
 * a complete portfolio with sections and recommendations.
 */

import { createServerClient } from "@/lib/supabase/server";
import { generateSummary } from "../abilities/generateSummary";
import { aiComplete } from "../router";

interface ExtractedResumeData {
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
  }>;
}

interface PortfolioSection {
  section_type: string;
  title?: string;
  content: any;
  display_order: number;
  is_visible: boolean;
}

interface GeneratePortfolioResult {
  sections: PortfolioSection[];
  suggestedTemplate: string;
  suggestedTheme: string;
}

/**
 * Extract structured data from resume text
 * 
 * Uses AI to parse resume text and extract structured information
 * about experience, skills, certifications, education, and summary.
 * 
 * @param resumeText - The resume content
 * @returns Structured resume data
 */
async function extractResumeData(resumeText: string): Promise<ExtractedResumeData> {
  const systemPrompt = `You are an expert at parsing resumes and extracting structured data.
Extract the following information from the resume:
- Professional summary or objective
- Work experience (role, company, dates, description)
- Certifications (title, issuing organization)
- Skills (technical skills, tools, methodologies)
- Education (degree, institution)

Return ONLY valid JSON in this exact format:
{
  "summary": "Professional summary text",
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or Present",
      "description": "What they did in this role"
    }
  ],
  "certifications": [
    {
      "title": "Certification Name",
      "issuer": "Issuing Organization"
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name"
    }
  ]
}

If a section is missing from the resume, return an empty array or empty string.`;

  const userPrompt = `Extract structured data from this resume:

${resumeText}

Return JSON with the extracted information.`;

  try {
    const result = await aiComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 1024,
    });

    const parsed = JSON.parse(result.text);
    
    return {
      summary: parsed.summary || "",
      experience: parsed.experience || [],
      certifications: parsed.certifications || [],
      skills: parsed.skills || [],
      education: parsed.education || [],
    };
  } catch (error) {
    console.error("Failed to extract resume data:", error);
    // Return empty structure on error
    return {
      summary: "",
      experience: [],
      certifications: [],
      skills: [],
      education: [],
    };
  }
}

/**
 * Suggest template and theme based on extracted resume data
 * 
 * Analyzes the content to recommend appropriate template and theme.
 * 
 * @param data - Extracted resume data
 * @returns Suggested template and theme names
 */
function suggestTemplateAndTheme(data: ExtractedResumeData): { template: string; theme: string } {
  // Logic for template suggestion
  let template = "single-column";
  
  // If they have significant experience, suggest timeline
  if (data.experience.length >= 3) {
    template = "timeline";
  }
  // If they have many skills and certifications, suggest grid
  else if (data.skills.length >= 10 && data.certifications.length >= 2) {
    template = "grid";
  }
  // If they have moderate content, suggest two-column
  else if (data.experience.length >= 2 || data.skills.length >= 5) {
    template = "two-column";
  }
  
  // Logic for theme suggestion
  let theme = "professional";
  
  // Check for tech-related content
  const allText = [
    ...data.skills,
    ...data.experience.map(e => e.role + " " + e.description),
  ].join(" ").toLowerCase();
  
  if (allText.includes("creative") || allText.includes("design") || allText.includes("ux")) {
    theme = "creative";
  } else if (allText.includes("modern") || allText.includes("startup")) {
    theme = "modern";
  } else if (allText.includes("minimal") || allText.includes("clean")) {
    theme = "minimal";
  } else if (allText.includes("elegant") || allText.includes("corporate")) {
    theme = "elegant";
  }
  
  return { template, theme };
}

/**
 * Generate a complete portfolio from resume text
 * 
 * Extracts structured data from resume, creates portfolio sections,
 * refines the summary, and suggests template/theme.
 * 
 * @param userId - The user's UUID
 * @param resumeText - Resume or LinkedIn content
 * @returns Complete portfolio structure with sections and suggestions
 */
export async function generatePortfolioFromResume(
  userId: string,
  resumeText: string
): Promise<GeneratePortfolioResult> {
  // Extract structured data from resume
  const extractedData = await extractResumeData(resumeText);
  
  // Refine the summary using AI
  let refinedSummary = extractedData.summary;
  if (extractedData.summary) {
    try {
      const summaryResult = await generateSummary({
        certificationsText: extractedData.certifications
          .map(c => `${c.title} - ${c.issuer}`)
          .join("\n"),
        experienceText: extractedData.experience
          .map(e => `${e.role} at ${e.company}: ${e.description}`)
          .join("\n\n"),
        skillsText: extractedData.skills.join(", "),
        maxWords: 120,
      });
      refinedSummary = summaryResult.summary;
    } catch (error) {
      console.error("Failed to refine summary:", error);
      // Keep original summary on error
    }
  }
  
  // Create portfolio sections
  const sections: PortfolioSection[] = [];
  let displayOrder = 0;
  
  // 1. Summary Section
  if (refinedSummary) {
    sections.push({
      section_type: "summary",
      content: { text: refinedSummary },
      display_order: displayOrder++,
      is_visible: true,
    });
  }
  
  // 2. Skills Section
  if (extractedData.skills.length > 0) {
    sections.push({
      section_type: "skills",
      content: { skills: extractedData.skills },
      display_order: displayOrder++,
      is_visible: true,
    });
  }
  
  // 3. Experience Section
  if (extractedData.experience.length > 0) {
    // Create a simplified experience section
    const experienceDescription = extractedData.experience
      .map(exp => {
        const dateRange = exp.startDate && exp.endDate 
          ? `${exp.startDate} - ${exp.endDate}`
          : "";
        return `${exp.role} at ${exp.company}${dateRange ? ` (${dateRange})` : ""}\n${exp.description}`;
      })
      .join("\n\n");
    
    sections.push({
      section_type: "work_experience",
      content: {
        description: experienceDescription,
        jobs: extractedData.experience,
      },
      display_order: displayOrder++,
      is_visible: true,
    });
  }
  
  // 4. Certifications Section
  if (extractedData.certifications.length > 0) {
    sections.push({
      section_type: "certifications",
      content: { certifications: extractedData.certifications },
      display_order: displayOrder++,
      is_visible: true,
    });
  }
  
  // 5. Education Section (as custom section)
  if (extractedData.education.length > 0) {
    const educationText = extractedData.education
      .map(edu => `${edu.degree}\n${edu.institution}`)
      .join("\n\n");
    
    sections.push({
      section_type: "custom",
      title: "Education",
      content: { text: educationText },
      display_order: displayOrder++,
      is_visible: true,
    });
  }
  
  // Suggest template and theme
  const suggestions = suggestTemplateAndTheme(extractedData);
  
  return {
    sections,
    suggestedTemplate: suggestions.template,
    suggestedTheme: suggestions.theme,
  };
}
