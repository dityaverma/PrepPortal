import { z } from "zod";

export const CreateTestSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID"),
  topicId: z.string().uuid("Invalid topic ID"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  questionType: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

export const StudentAnswerSchema = z.object({
  questionId: z.string().uuid("Invalid question ID"),
  studentAnswer: z.string().min(1, "Answer cannot be empty"),
});

export const SubmitTestSchema = z.object({
  answers: z.array(StudentAnswerSchema).min(1, "Submission must contain at least one answer"),
  timeSpent: z.number().int().nonnegative().optional().default(0),
});

export type CreateTestInput = z.infer<typeof CreateTestSchema>;
export type SubmitTestInput = z.infer<typeof SubmitTestSchema>;
