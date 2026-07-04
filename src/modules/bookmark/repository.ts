/**
 * Bookmark Repository Layer
 * 
 * Performs workspace-scoped database operations on bookmark entries.
 */

import { prisma } from "@/lib/prisma";
import { CreateBookmarkInput } from "./dto";

export class BookmarkRepository {
  /**
   * Finds a specific bookmark by ID.
   */
  async findById(id: string) {
    return prisma.bookmark.findUnique({
      where: { id },
    });
  }

  /**
   * Checks if an exact duplicate bookmark exists (same workspace, question, and subtopic).
   */
  async findDuplicate(workspaceId: string, questionId?: string, subtopicId?: string) {
    return prisma.bookmark.findFirst({
      where: {
        workspaceId,
        questionId: questionId || null,
        subtopicId: subtopicId || null,
      },
    });
  }

  /**
   * Persists a new bookmark record to the database.
   */
  async create(data: CreateBookmarkInput) {
    return prisma.bookmark.create({
      data: {
        workspaceId: data.workspaceId,
        questionId: data.questionId || null,
        subtopicId: data.subtopicId || null,
      },
      include: {
        question: true,
      },
    });
  }

  /**
   * Deletes a bookmark record by its ID.
   */
  async delete(id: string) {
    return prisma.bookmark.delete({
      where: { id },
    });
  }

  /**
   * Lists all bookmarks under a workspace, eager loading questions and their options.
   */
  async list(workspaceId: string) {
    return prisma.bookmark.findMany({
      where: { workspaceId },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const bookmarkRepository = new BookmarkRepository();

