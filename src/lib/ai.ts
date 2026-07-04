/**
 * AI Provider interface for LLM completions (e.g. Gemini).
 */
export interface AIProvider {
  generateText(prompt: string, options?: AICompletionOptions): Promise<string>;
  generateJSON<T>(prompt: string, schema: any, options?: AICompletionOptions): Promise<T>;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemInstruction?: string;
}

/**
 * Prompt Builder interface for constructing system and user prompts.
 */
export interface PromptBuilder<T = any> {
  buildSystemPrompt(context: T): string;
  buildUserPrompt(context: T): string;
}

/**
 * Recovery Service interface for building personalized learning recovery nodes
 * when a student fails a test.
 */
export interface RecoveryService {
  analyzeFailureAndGeneratePath(
    workspaceId: string,
    failedTopicId: string,
    testAttemptId: string
  ): Promise<RecoveryPlanResult>;
}

export interface RecoveryPlanResult {
  recoveryNodes: Array<{
    title: string;
    description: string;
    subtopics: string[];
    recommendedTimeMinutes: number;
    recommendedResources: string[];
  }>;
  suggestedFocusArea: string;
  reassessmentRequired: boolean;
}

// Concrete mock implementation of interfaces just to fulfill compiles without actual API calls
export class MockAIProvider implements AIProvider {
  async generateText(prompt: string, _options?: AICompletionOptions): Promise<string> {
    return `Mock AI completion response for prompt length: ${prompt.length}`;
  }

  async generateJSON<T>(_prompt: string, _schema: any, _options?: AICompletionOptions): Promise<T> {
    return {} as T;
  }
}
