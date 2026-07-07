import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { z } from "zod";

// validate structured questions matching expected format
export const ExtractedQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
  questionType: z.string(),
  difficulty: z.string(),
  explanation: z.string().nullable().optional(),
});

export const ExtractedQuizSchema = z.object({
  questions: z.array(ExtractedQuestionSchema),
});

export type ExtractedQuestionInput = z.infer<typeof ExtractedQuestionSchema>;

// core service class for document processing and AI data extraction
export class QuizImportService {
  // extract raw text from buffer based on file extension type
  async extractTextFromFile(buffer: Buffer, fileName: string): Promise<string> {
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext === "txt" || ext === "md" || ext === "markdown") {
      return buffer.toString("utf8");
    }

    if (ext === "pdf") {
      const pdfParseModule = (await import("pdf-parse")) as any;
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if (ext === "docx") {
      const mammoth = await import("mammoth");
      const data = await mammoth.extractRawText({ buffer });
      return data.value || "";
    }

    if (ext === "xlsx" || ext === "csv") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      let text = "";
      for (const name of workbook.SheetNames) {
        const sheet = workbook.Sheets[name];
        text += XLSX.utils.sheet_to_csv(sheet) + "\n";
      }
      return text;
    }

    throw new Error(`unsupported file format ${ext}`);
  }

  // send extracted text to google gemini API for schema extraction
  async callGeminiExtractor(text: string): Promise<ExtractedQuestionInput[]> {
    const apiKey = process.env.GEMINI_API_KEY || "fallback-test-api-key";
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    if (apiKey === "fallback-test-api-key") {
      return this.getMockExtraction();
    }

    const prompt = `You are a strict data extraction tool.
Extract questions from the following text.
Text content:
"""
${text}
"""

Rules:
1. Extract questions exactly as they appear in the text.
2. Do not generate new questions.
3. Do not modify wording, correct answers, or options.
4. If options are missing, return null.
5. If information is missing, return null.
6. The options array must contain exactly the listed choices.
7. Return only a valid JSON response matching this schema:
{
  "questions": [
    {
      "question": "extracted question text",
      "options": ["option a", "option b", "option c", "option d"],
      "correctAnswer": "exact correct option text",
      "questionType": "Theory or Pattern or Output or Debug or Complexity",
      "difficulty": "Easy or Medium or Hard",
      "explanation": "explanation text if present in text, else null"
    }
  ]
}

Do not include markdown format wrappers or code blocks.`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`gemini API call failed with status ${response.status} details: ${errorText}`);
    }

    const result = await response.json();
    const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!extractedText) {
      throw new Error("gemini returned an empty response");
    }

    const parsed = JSON.parse(extractedText);
    const validated = ExtractedQuizSchema.parse(parsed);
    return validated.questions;
  }

  // verify if duplicate question exists in the database
  async checkDuplicate(q: ExtractedQuestionInput): Promise<boolean> {
    const existing = await prisma.question.findFirst({
      where: {
        text: {
          equals: q.question,
          mode: "insensitive",
        },
        correctAnswer: {
          equals: q.correctAnswer,
          mode: "insensitive",
        },
      },
      include: {
        options: true,
      },
    });

    if (!existing) return false;

    const existingOpts = existing.options.map((o) => o.text.trim().toLowerCase()).sort();
    const inputOpts = q.options.map((o) => o.trim().toLowerCase()).sort();

    if (existingOpts.length !== inputOpts.length) return false;
    return existingOpts.every((val, idx) => val === inputOpts[idx]);
  }

  // build detailed duplicate and validation reports
  async compileReport(questions: ExtractedQuestionInput[]): Promise<{
    questions: (ExtractedQuestionInput & { isDuplicate: boolean })[];
    hasDuplicates: boolean;
  }> {
    let hasDuplicates = false;
    const enriched = [];

    for (const q of questions) {
      const isDuplicate = await this.checkDuplicate(q);
      if (isDuplicate) {
        hasDuplicates = true;
      }
      enriched.push({
        ...q,
        isDuplicate,
      });
    }

    return {
      questions: enriched,
      hasDuplicates,
    };
  }

  // create the quiz and insert all confirmed questions inside transaction
  async confirmAndCreateQuiz(input: {
    fileName: string;
    subjectId: string;
    topicId: string;
    subtopicId: string;
    quizName: string;
    questions: (ExtractedQuestionInput & { duplicateAction?: "skip" | "replace" | "insert" })[];
  }) {
    return prisma.$transaction(async (tx) => {
      // create target quiz catalog entry
      const quiz = await tx.quiz.create({
        data: {
          name: input.quizName,
          subjectId: input.subjectId,
          topicId: input.topicId,
          subtopicId: input.subtopicId,
        },
      });

      for (const q of input.questions) {
        const isDuplicate = await this.checkDuplicate(q);

        if (isDuplicate) {
          if (q.duplicateAction === "skip") {
            continue;
          }

          if (q.duplicateAction === "replace") {
            // delete the existing duplicate question record
            await tx.question.deleteMany({
              where: {
                text: {
                  equals: q.question,
                  mode: "insensitive",
                },
              },
            });
          }
        }

        // create new question entry in database
        const createdQuestion = await tx.question.create({
          data: {
            subjectId: input.subjectId,
            topicId: input.topicId,
            subtopicId: input.subtopicId,
            questionType: q.questionType || "Theory",
            text: q.question,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty || "Medium",
            explanation: q.explanation || "",
            options: {
              create: q.options.map((opt) => ({
                text: opt,
                value: opt,
                isCorrect: opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase(),
              })),
            },
          },
        });

        // link question to quiz entry
        await tx.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionId: createdQuestion.id,
          },
        });
      }

      // log verified action into import history table
      await tx.importHistory.create({
        data: {
          fileName: input.fileName,
          fileType: input.fileName.split(".").pop() || "unknown",
          extractedCount: input.questions.length,
          status: "CONFIRMED",
          validationReport: JSON.stringify({ quizId: quiz.id }),
        },
      });

      return quiz;
    });
  }

  // fallback mock generator when api key is not active
  private getMockExtraction(): ExtractedQuestionInput[] {
    return [
      {
        question: "Which scheduling algorithm may cause starvation?",
        options: ["FCFS", "Round Robin", "Priority Scheduling", "SJF"],
        correctAnswer: "Priority Scheduling",
        questionType: "Theory",
        difficulty: "Medium",
        explanation: "Priority Scheduling can lead to starvation.",
      },
    ];
  }
}

export const quizImportService = new QuizImportService();
