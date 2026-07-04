import { z } from "zod";

export const StudyLinkInputSchema = z.object({
  description: z.string().max(1000).optional(),
  learningObjectives: z.string().max(2000).optional(),
  estimatedTime: z.number().int().min(0).optional().default(0),
  prerequisites: z.string().max(1000).optional(),
  gfgUrl: z.string().url("Invalid GeeksforGeeks URL").or(z.string().length(0)).optional(),
  officialDocUrl: z.string().url("Invalid official documentation URL").or(z.string().length(0)).optional(),
  additionalResources: z.string().max(2000).optional(),
});

export const CreateSubtopicSchema = z.object({
  name: z.string().min(1, "Subtopic name is required").max(100),
  description: z.string().max(1000).optional(),
  topicId: z.string().uuid("Invalid topic ID"),
  studyLink: StudyLinkInputSchema.optional(),
});

export const UpdateSubtopicSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  topicId: z.string().uuid().optional(),
  studyLink: StudyLinkInputSchema.partial().optional(),
});

export type CreateSubtopicInput = z.infer<typeof CreateSubtopicSchema>;
export type UpdateSubtopicInput = z.infer<typeof UpdateSubtopicSchema>;
