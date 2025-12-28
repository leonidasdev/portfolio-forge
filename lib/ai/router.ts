/**
 * AI Router
 * 
 * Abstraction layer over the AI provider.
 * Allows swapping providers in the future without changing ability code.
 */

import { groqComplete, GroqCompletionParams, GroqCompletionResult } from "./provider";

/**
 * Universal AI completion function
 * 
 * Currently routes to Groq, but can be extended to support
 * multiple providers with routing logic.
 * 
 * @param params - Completion parameters
 * @returns Completion result
 */
export async function aiComplete(
  params: GroqCompletionParams
): Promise<GroqCompletionResult> {
  return groqComplete(params);
}
