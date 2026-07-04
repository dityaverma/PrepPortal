import { z } from "zod";

export const CreateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").max(100),
  description: z.string().max(1000).optional(),
});

export const UpdateSubjectSchema = CreateSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof CreateSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectSchema>;
