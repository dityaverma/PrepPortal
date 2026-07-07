/**
 * AI Provider client linking Next.js to the FastAPI AI Subsystem.
 */
export interface AIProvider {
  generateText(prompt: string, options?: AICompletionOptions): Promise<string>;
  generateJSON<T>(prompt: string, schema: any, options?: AICompletionOptions): Promise<T>;
  chat(query: string, history: Array<{ role: string; content: string }>): Promise<{ answer: string; citations: any[] }>;
  compare(companyA: string, companyB: string): Promise<{ company_a: string; company_b: string; comparison_report: string }>;
  generateRoadmap(targetCompany: string, targetRole: string, profile: any, weeks?: number): Promise<any>;
  explainEligibility(profile: any, rules: any): Promise<any>;
  moderate(content: string, type?: string): Promise<any>;
}

export interface AICompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  systemInstruction?: string;
}

export class FastAPIClientAIProvider implements AIProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  }

  async generateText(prompt: string, _options?: AICompletionOptions): Promise<string> {
    // Falls back to direct chat api or similar endpoint
    const res = await this.chat(prompt, []);
    return res.answer;
  }

  async generateJSON<T>(prompt: string, _schema: any, _options?: AICompletionOptions): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: prompt }),
    });
    const data = await res.json();
    return data as T;
  }

  async chat(query: string, history: Array<{ role: string; content: string }>): Promise<{ answer: string; citations: any[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, chat_history: history }),
      });
      if (!res.ok) throw new Error(`AI Service returned status ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("FastAPI AI Chat request failed:", err);
      return {
        answer: "Unable to reach the career assistant engine at this time.",
        citations: []
      };
    }
  }

  async compare(companyA: string, companyB: string): Promise<{ company_a: string; company_b: string; comparison_report: string }> {
    const res = await fetch(`${this.baseUrl}/api/assistant/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_a: companyA, company_b: companyB }),
    });
    return res.json();
  }

  async generateRoadmap(targetCompany: string, targetRole: string, profile: any, weeks = 8): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/assistant/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_company: targetCompany,
        target_role: targetRole,
        student_profile: profile,
        weeks
      }),
    });
    return res.json();
  }

  async explainEligibility(profile: any, rules: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/assistant/eligibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, eligibility_rules: rules }),
    });
    return res.json();
  }

  async moderate(content: string, type = "interview_experience"): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/assistant/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, context_type: type }),
    });
    return res.json();
  }
}

// Export the active provider instance
export const aiProvider = new FastAPIClientAIProvider();
export const ai = aiProvider;
