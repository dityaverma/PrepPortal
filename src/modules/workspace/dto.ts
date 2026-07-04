import { z } from "zod";

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  targetRole: z.string().min(1, "Target role is required"),
  companyIds: z.array(z.string().uuid()).optional().default([]),
});

export const RenameWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceSchema>;
export type RenameWorkspaceInput = z.infer<typeof RenameWorkspaceSchema>;
export const SwitchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID"),
});

export type SwitchWorkspaceInput = z.infer<typeof SwitchWorkspaceSchema>;
