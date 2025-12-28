/**
 * Groq AI Provider
 * 
 * Direct integration with Groq's OpenAI-compatible API.
 * Handles chat completion requests with system and user prompts.
 */

import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "./config";
import { ERROR_MESSAGES } from "./constants";

export interface GroqCompletionParams {
  systemPrompt?: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GroqCompletionResult {
  text: string;
}

interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqAPIRequest {
  model: string;
  messages: GroqChatMessage[];
  temperature: number;
  max_tokens: number;
}

interface GroqAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call Groq's chat completion API
 * 
 * @param params - Completion parameters including prompts and model settings
 * @returns Completion result with generated text
 * @throws Error if API call fails or API key is missing
 */
export async function groqComplete(
  params: GroqCompletionParams
): Promise<GroqCompletionResult> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  const messages: GroqChatMessage[] = [];
  
  if (params.systemPrompt) {
    messages.push({
      role: "system",
      content: params.systemPrompt,
    });
  }
  
  messages.push({
    role: "user",
    content: params.userPrompt,
  });

  const requestBody: GroqAPIRequest = {
    model: params.model || DEFAULT_MODEL,
    messages,
    temperature: params.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: params.maxTokens || DEFAULT_MAX_TOKENS,
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Groq API request failed with status ${response.status}: ${errorText}`
    );
  }

  const data: GroqAPIResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error("Groq API returned no choices");
  }

  const text = data.choices[0].message.content;

  return { text };
}
