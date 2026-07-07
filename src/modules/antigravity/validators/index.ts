import { z } from "zod";

// validate structure of recovery question returned from ai provider
export const RecoveryQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answer: z.string(),
  explanation: z.string().nullable().optional(),
  difficulty: z.string(),
  concept: z.string(),
  pattern: z.string(),
  questionType: z.string(),
});

// validate structure of full recovery quiz containing ten questions
export const RecoveryQuizSchema = z.object({
  questions: z.array(RecoveryQuestionSchema).length(10),
});

export type RecoveryQuestionInput = z.infer<typeof RecoveryQuestionSchema>;
export type RecoveryQuizInput = z.infer<typeof RecoveryQuizSchema>;
