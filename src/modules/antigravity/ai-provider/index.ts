import { RecoveryQuizInput } from "../validators";

// provider interface for dynamic quiz generator engines
export interface AIProvider {
  generateRecoveryQuiz(prompt: string): Promise<RecoveryQuizInput>;
}

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "fallback-test-api-key";
    this.modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  // generate recovery quiz using google gemini rest api endpoint
  async generateRecoveryQuiz(prompt: string): Promise<RecoveryQuizInput> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    // check if api key is mock to bypass real fetch in unit tests
    if (this.apiKey === "fallback-test-api-key") {
      // return a valid mock response for testing
      return this.getMockResponse();
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`gemini api request failed with status ${response.status} details ${errorText}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error("empty response from gemini provider");
    }

    // parse json block directly
    return JSON.parse(textContent) as RecoveryQuizInput;
  }

  // mock fallback quiz builder when no valid api key is active
  private getMockResponse(): RecoveryQuizInput {
    const questions = [];
    const types = ["Theory", "Pattern", "Output", "Debug", "Complexity"];
    
    for (let i = 0; i < 10; i++) {
      const qType = types[Math.floor(i / 2)];
      questions.push({
        question: `mock question text number ${i + 1}`,
        options: ["option one", "option two", "option three", "option four"],
        answer: "option one",
        explanation: "mock explanation of the correct option",
        difficulty: "MEDIUM",
        concept: "mock concept name",
        pattern: "mock pattern name",
        questionType: qType,
      });
    }

    return { questions };
  }
}

// sample claude provider placeholder class showing future pluggability
export class ClaudeProvider implements AIProvider {
  async generateRecoveryQuiz(_prompt: string): Promise<RecoveryQuizInput> {
    throw new Error("claude provider is not implemented");
  }
}

// sample openai provider placeholder class showing future pluggability
export class OpenAIProvider implements AIProvider {
  async generateRecoveryQuiz(_prompt: string): Promise<RecoveryQuizInput> {
    throw new Error("openai provider is not implemented");
  }
}
