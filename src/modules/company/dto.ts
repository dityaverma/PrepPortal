import { z } from "zod";

export const CreateCompanySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  logo: z.string().url("Invalid logo URL").or(z.string().length(0)).optional(),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").or(z.string().length(0)).optional(),
  description: z.string().max(1000).optional(),
  active: z.boolean().optional().default(true),
});

export const UpdateCompanySchema = CreateCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;
