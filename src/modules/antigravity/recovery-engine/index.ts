import { prisma } from "@/lib/prisma";
import { GeminiProvider } from "../ai-provider";
import { promptBuilder } from "../prompt-builder";
import { RecoveryQuizSchema, RecoveryQuizInput } from "../validators";

// recovery quiz engine generates validates and stores ai generated tests on learning failure
export class RecoveryEngine {
  private aiProvider: GeminiProvider;

  constructor() {
    this.aiProvider = new GeminiProvider();
  }

  // coordinate recovery quiz generation with retry mechanics
  async generateAndStoreQuiz(input: {
    userId: string;
    workspaceId: string;
    role: string;
    selectedCompanies: string[];
    subject: string;
    subjectId: string;
    topic: string;
    topicId: string;
    attemptNumber: number;
    wrongQuestionIds: string[];
    weakConcepts: string[];
    weakPatterns: string[];
    difficulty: string;
    questionTypes: string[];
  }): Promise<any> {
    const prompt = promptBuilder.buildPrompt({
      role: input.role,
      selectedCompanies: input.selectedCompanies,
      subject: input.subject,
      topic: input.topic,
      weakConcepts: input.weakConcepts,
      weakPatterns: input.weakPatterns,
      difficulty: input.difficulty,
      questionTypes: input.questionTypes,
      attemptNumber: input.attemptNumber,
    });

    let quizData: RecoveryQuizInput | null = null;
    let error: any = null;

    // run quiz generation with one retry on verification failure
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const rawResult = await this.aiProvider.generateRecoveryQuiz(prompt);
        // validate generated quiz structure against schema
        const validated = RecoveryQuizSchema.parse(rawResult);
        quizData = validated;
        break;
      } catch (err) {
        error = err;
        console.error(`[recovery-engine] attempt ${attempt} failed to validate response:`, err);
      }
    }

    if (!quizData) {
      throw new Error(`failed to generate valid recovery quiz after two attempts details: ${error?.message}`);
    }

    // store the generated quiz and questions in relational database
    const createdQuiz = await prisma.recoveryQuiz.create({
      data: {
        workspaceId: input.workspaceId,
        subjectId: input.subjectId,
        topicId: input.topicId,
        attemptNumber: input.attemptNumber,
        questions: {
          create: quizData.questions.map((q) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            answer: q.answer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            concept: q.concept,
            pattern: q.pattern,
            questionType: q.questionType,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return createdQuiz;
  }
}

export const recoveryEngine = new RecoveryEngine();
