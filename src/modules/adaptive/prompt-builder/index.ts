// prompt builder constructs instructions for the AI provider
export interface PromptBuilderInput {
  role: string;
  selectedCompanies: string[];
  subject: string;
  topic: string;
  weakConcepts: string[];
  weakPatterns: string[];
  difficulty: string;
  questionTypes: string[];
  attemptNumber: number;
}

export class PromptBuilder {
  // generate a clean system instructions prompt
  buildPrompt(input: PromptBuilderInput): string {
    const companies = input.selectedCompanies.join(", ") || "generic technology companies";
    const concepts = input.weakConcepts.join(", ") || "basic elements";
    const patterns = input.weakPatterns.join(", ") || "general problem solving";

    return `You are a placement preparation AI engine creating a recovery quiz.
Create a quiz for a user preparing for a ${input.role} role at these companies: ${companies}.
Subject: ${input.subject}
Topic: ${input.topic}
Difficulty level: ${input.difficulty}
Attempt count: ${input.attemptNumber}

Quiz generation rules:
1. Generate exactly 10 questions.
2. The question types distribution must be:
   - 2 Theory
   - 2 Pattern
   - 2 Output
   - 2 Debug
   - 2 Complexity
3. Questions must focus only on these weak concepts: ${concepts}.
4. Questions must target these weak patterns: ${patterns}.
5. Match the difficulty level: ${input.difficulty}.

Output format rules:
- Generate only valid JSON.
- Never use markdown blocks or wrapper elements.
- Never write text explanations outside of the JSON.
- Return a JSON object matching this schema:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option a", "option b", "option c", "option d"],
      "answer": "correct option text",
      "explanation": "brief explanation text",
      "difficulty": "${input.difficulty}",
      "concept": "concept name",
      "pattern": "pattern name",
      "questionType": "Theory or Pattern or Output or Debug or Complexity"
    }
  ]
}`;
  }
}

export const promptBuilder = new PromptBuilder();
