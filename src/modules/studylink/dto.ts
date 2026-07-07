import { z } from "zod";

/**
 * Study Link Validation Schemas
 */
export const StudyLinkInputSchema = z.object({
  description: z.string().max(1000).optional(),
  learningObjectives: z.string().max(2000).optional(),
  estimatedTime: z.number().int().min(0).optional().default(0),
  prerequisites: z.string().max(1000).optional(),
  gfgUrl: z.string().url("Invalid GeeksforGeeks URL").or(z.string().length(0)).optional(),
  officialDocUrl: z.string().url("Invalid official documentation URL").or(z.string().length(0)).optional(),
  additionalResources: z.string().max(2000).optional(),
});

export const CreateStudyLinkSchema = StudyLinkInputSchema.extend({
  subtopicId: z.string().uuid("Invalid subtopic ID"),
});

export const UpdateStudyLinkSchema = StudyLinkInputSchema.partial();

export type CreateStudyLinkInput = z.infer<typeof CreateStudyLinkSchema>;
export type UpdateStudyLinkInput = z.infer<typeof UpdateStudyLinkSchema>;
