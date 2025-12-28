/**
 * Improve Text Ability
 * 
 * Rewrites portfolio text in different tones while maintaining
 * professional quality and factual accuracy.
 */

import { aiComplete } from "../router";

export type Tone = "concise" | "formal" | "casual" | "senior" | "technical";

export interface ImproveTextInput {
  text: string;
  tone?: Tone;
}

export interface ImproveTextOutput {
  improved: string;
}

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  concise: "brief, direct, and impactful - focus on key points",
  formal: "professional and polished - suitable for corporate environments",
  casual: "approachable and conversational - while remaining professional",
  senior: "authoritative and strategic - emphasizing leadership and impact",
  technical: "precise and detailed - highlighting technical depth and expertise",
};

/**
 * Improve portfolio text with specified tone
 * 
 * @param input - Text to improve and desired tone
 * @returns Improved version of the text
 */
export async function improveText(input: ImproveTextInput): Promise<ImproveTextOutput> {
  const tone = input.tone || "concise";
  const toneDescription = TONE_DESCRIPTIONS[tone];

  const systemPrompt = `You are an expert editor for professional portfolios and resumes.
Your task is to rewrite text to improve clarity, impact, and professionalism.

Style: ${toneDescription}

Rules:
- Maintain all factual information
- Do not add claims or achievements that aren't in the original
- Fix grammar and spelling
- Improve word choice and sentence structure
- Remove redundancy
- Return ONLY the rewritten text, no explanations or comments`;

  const userPrompt = `Rewrite this text in a ${tone} style:

${input.text}`;

  const result = await aiComplete({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 512,
  });

  return {
    improved: result.text.trim(),
  };
}
