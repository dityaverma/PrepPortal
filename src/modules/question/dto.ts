import { z } from "zod";

const QuestionOptionInputSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  value: z.string().min(1, "Option key/value is required"),
  isCorrect: z.boolean().default(false),
});

export const CreateQuestionSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  topicId: z.string().uuid("Invalid topic ID"),
  subtopicId: z.string().uuid("Invalid subtopic ID"),
  questionType: z.enum([
    "THEORY",
    "SCENARIO",
    "DEBUG",
    "OUTPUT_PREDICTION",
    "INTERVIEW",
    "DIAGRAM",
    "ORDERING",
    "MATCHING",
  ]),
  text: z.string().min(1, "Question text is required"),
  explanation: z.string().optional(),
  correctAnswer: z.string().min(1, "Correct answer reference is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  options: z.array(QuestionOptionInputSchema).min(2, "At least 2 options are required for a question"),
  companyIds: z.array(z.string().uuid()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export const UpdateQuestionSchema = CreateQuestionSchema.partial();

export const BulkImportSchema = z.object({
  questions: z.array(CreateQuestionSchema).min(1, "Bulk import requires at least one question"),
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;
export type BulkImportInput = z.infer<typeof BulkImportSchema>;
export type QuestionQueryParams = {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  difficulty?: string;
  questionType?: string;
  companyId?: string;
};
