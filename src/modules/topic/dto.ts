import { z } from "zod";

export const CreateTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(100),
  description: z.string().max(1000).optional(),
  subjectId: z.string().uuid("Invalid subject ID"),
  prerequisiteIds: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateTopicSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  subjectId: z.string().uuid().optional(),
  prerequisiteIds: z.array(z.string().uuid()).optional(),
});

export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicSchema>;
