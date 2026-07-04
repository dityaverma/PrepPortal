/**
 * Bookmark Data Transfer Objects (DTO)
 * 
 * Defines schemas for validating bookmark creation payloads.
 */

import { z } from "zod";

/**
 * Zod validation schema for bookmark creation.
 * Ensures the target workspace is provided and that either a questionId or subtopicId
 * (or both) is set, but not neither.
 */
export const CreateBookmarkSchema = z.object({
  workspaceId: z.string().uuid("Invalid workspace ID"),
  questionId: z.string().uuid().optional(),
  subtopicId: z.string().uuid().optional(),
}).refine(data => data.questionId || data.subtopicId, {
  message: "Either questionId or subtopicId must be provided",
  path: ["questionId"]
});

export type CreateBookmarkInput = z.infer<typeof CreateBookmarkSchema>;

