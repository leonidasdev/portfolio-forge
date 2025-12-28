/**
 * Analyze Portfolio Agent
 * 
 * Evaluates portfolio content across multiple dimensions and provides
 * actionable recommendations with scoring.
 */

import { createServerClient } from "@/lib/supabase/server";
import { aiComplete } from "../router";

/**
 * Analyze portfolio and provide score with actionable recommendations
 * 
 * Evaluates portfolio content across multiple dimensions including clarity,
 * technical depth, seniority signals, ATS compatibility, completeness, and tone.
 * Returns a score, subscores, and specific recommendations with optional rewrites.
 * 
 * @param userId - The user's UUID
 * @returns Analysis with score, subscores, and recommendations
 */
export async function analyzePortfolio(userId: string): Promise<{
  score: number;
  subscores: {
    clarity: number;
    technicalDepth: number;
    seniority: number;
    atsAlignment: number;
    completeness: number;
    toneConsistency: number;
  };
  recommendations: Array<{
    title: string;
    description: string;
    suggestedRewrite?: string;
    sectionId?: string;
    sectionType?: string;
  }>;
}> {
  const supabase = await createServerClient();

  // Fetch portfolio and sections
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

  // Build content profile
  let summaryText = "";
  let summarySectionId = "";
  const experienceTexts: Array<{ text: string; id: string }> = [];
  const certificationTexts: string[] = [];
  const skills: string[] = [];
  let sectionCount = sections.length;
  let wordCount = 0;

  for (const section of sections) {
    switch (section.section_type) {
      case "summary":
        summaryText = section.content?.text || "";
        summarySectionId = section.id;
        wordCount += summaryText.split(/\s+/).length;
        break;
      case "work_experience":
        const expText = section.content?.description || "";
        if (expText) {
          experienceTexts.push({ text: expText, id: section.id });
          wordCount += expText.split(/\s+/).length;
        }
        if (section.content?.jobs && Array.isArray(section.content.jobs)) {
          section.content.jobs.forEach((job: any) => {
            if (job.description) {
              wordCount += job.description.split(/\s+/).length;
            }
          });
        }
        break;
      case "certifications":
        if (section.content?.certifications && Array.isArray(section.content.certifications)) {
          certificationTexts.push(
            ...section.content.certifications.map((cert: any) => cert.title || "")
          );
        }
        break;
      case "skills":
        if (section.content?.skills && Array.isArray(section.content.skills)) {
          skills.push(...section.content.skills);
        }
        break;
      case "custom":
        const customText = section.content?.text || "";
        wordCount += customText.split(/\s+/).length;
        break;
    }
  }

  // Analyze all text for signals
  const allText = [
    summaryText,
    ...experienceTexts.map(e => e.text),
    ...certificationTexts,
    ...skills,
  ].join(" ").toLowerCase();

  // Detect tone signals
  const toneSignals = {
    passive: allText.match(/\b(was|were|been|being)\b/g)?.length || 0,
    active: allText.match(/\b(led|managed|developed|created|designed|implemented)\b/g)?.length || 0,
    weak: allText.match(/\b(helped|assisted|worked on|involved in)\b/g)?.length || 0,
    strong: allText.match(/\b(achieved|delivered|improved|optimized|increased|reduced)\b/g)?.length || 0,
  };

  // Detect seniority signals
  const senioritySignals = {
    junior: allText.match(/\b(junior|entry|associate|assistant)\b/gi)?.length || 0,
    mid: allText.match(/\b(mid|intermediate|regular)\b/gi)?.length || 0,
    senior: allText.match(/\b(senior|lead|principal|staff|architect|director|manager|head)\b/gi)?.length || 0,
  };

  // Build content profile for AI
  const contentProfile = {
    summaryText,
    experienceCount: experienceTexts.length,
    certificationCount: certificationTexts.length,
    skillsCount: skills.length,
    sectionCount,
    wordCount,
    toneSignals,
    senioritySignals,
    hasSummary: summaryText.length > 0,
    hasExperience: experienceTexts.length > 0,
    hasSkills: skills.length > 0,
    hasCertifications: certificationTexts.length > 0,
  };

  // Use AI to generate analysis
  const systemPrompt = `You are an expert career coach and ATS (Applicant Tracking System) specialist.
Analyze the portfolio content and provide a comprehensive evaluation.

Evaluate on these dimensions (0-100):
- clarity: How clear and easy to understand is the content?
- technicalDepth: How well does it demonstrate technical expertise?
- seniority: How effectively does it signal the appropriate career level?
- atsAlignment: How well optimized is it for ATS parsing?
- completeness: How complete and well-rounded is the portfolio?
- toneConsistency: How consistent is the professional tone?

Provide specific, actionable recommendations. For the most critical issues, include a suggestedRewrite.

Return ONLY valid JSON in this format:
{
  "score": 75,
  "subscores": {
    "clarity": 80,
    "technicalDepth": 70,
    "seniority": 75,
    "atsAlignment": 65,
    "completeness": 80,
    "toneConsistency": 85
  },
  "recommendations": [
    {
      "title": "Short recommendation title",
      "description": "Detailed explanation of what to improve and why",
      "suggestedRewrite": "Optional: suggested improved text for a specific section"
    }
  ]
}`;

  const userPrompt = `Analyze this portfolio:

SUMMARY:
${summaryText || "(No summary provided)"}

EXPERIENCE SECTIONS: ${experienceTexts.length}
${experienceTexts.map((exp, i) => `Experience ${i + 1}:\n${exp.text}`).join("\n\n")}

SKILLS: ${skills.length}
${skills.join(", ")}

CERTIFICATIONS: ${certificationTexts.length}
${certificationTexts.join(", ")}

METRICS:
- Total sections: ${sectionCount}
- Total words: ${wordCount}
- Passive voice usage: ${toneSignals.passive}
- Active verbs: ${toneSignals.active}
- Weak verbs: ${toneSignals.weak}
- Strong verbs: ${toneSignals.strong}
- Junior signals: ${senioritySignals.junior}
- Mid signals: ${senioritySignals.mid}
- Senior signals: ${senioritySignals.senior}

Provide score, subscores, and 3-5 specific recommendations. Include suggestedRewrite for the top 2 issues.`;

  try {
    const result = await aiComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1024,
    });

    const parsed = JSON.parse(result.text);

    // Add section IDs to recommendations where applicable
    const enhancedRecommendations = parsed.recommendations.map((rec: any) => {
      // If the recommendation mentions summary and we have a suggestedRewrite
      if (rec.suggestedRewrite && rec.title.toLowerCase().includes("summary") && summarySectionId) {
        return {
          ...rec,
          sectionId: summarySectionId,
          sectionType: "summary",
        };
      }
      // If the recommendation mentions experience and we have a suggestedRewrite
      if (rec.suggestedRewrite && rec.title.toLowerCase().includes("experience") && experienceTexts.length > 0) {
        return {
          ...rec,
          sectionId: experienceTexts[0].id,
          sectionType: "work_experience",
        };
      }
      return rec;
    });

    return {
      score: Math.min(100, Math.max(0, parsed.score || 0)),
      subscores: {
        clarity: Math.min(100, Math.max(0, parsed.subscores?.clarity || 0)),
        technicalDepth: Math.min(100, Math.max(0, parsed.subscores?.technicalDepth || 0)),
        seniority: Math.min(100, Math.max(0, parsed.subscores?.seniority || 0)),
        atsAlignment: Math.min(100, Math.max(0, parsed.subscores?.atsAlignment || 0)),
        completeness: Math.min(100, Math.max(0, parsed.subscores?.completeness || 0)),
        toneConsistency: Math.min(100, Math.max(0, parsed.subscores?.toneConsistency || 0)),
      },
      recommendations: enhancedRecommendations || [],
    };
  } catch (error) {
    console.error("Failed to analyze portfolio:", error);

    // Fallback analysis based on heuristics
    const subscores = {
      clarity: summaryText.length > 50 ? 70 : 40,
      technicalDepth: skills.length >= 5 ? 75 : 50,
      seniority: senioritySignals.senior > 0 ? 80 : 60,
      atsAlignment: toneSignals.active > toneSignals.passive ? 70 : 50,
      completeness: sectionCount >= 4 ? 80 : 50,
      toneConsistency: toneSignals.strong > toneSignals.weak ? 75 : 55,
    };

    const avgScore = Math.round(
      Object.values(subscores).reduce((sum, val) => sum + val, 0) / 6
    );

    const recommendations = [];
    
    if (!contentProfile.hasSummary) {
      recommendations.push({
        title: "Add a Professional Summary",
        description: "A strong summary section is critical for making a first impression. Add 2-3 sentences highlighting your key strengths.",
      });
    }

    if (toneSignals.passive > toneSignals.active) {
      recommendations.push({
        title: "Use More Active Voice",
        description: "Replace passive constructions with active verbs (led, developed, created) to demonstrate ownership and impact.",
      });
    }

    if (contentProfile.skillsCount < 5) {
      recommendations.push({
        title: "Expand Your Skills Section",
        description: "Add more relevant technical skills to improve ATS matching and showcase your expertise.",
      });
    }

    return {
      score: avgScore,
      subscores,
      recommendations,
    };
  }
}
