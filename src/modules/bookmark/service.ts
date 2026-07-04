/**
 * Bookmark Service Layer
 * 
 * Implements business logic and security policies for workspace bookmarks.
 * Ensures users can only access bookmarks in workspaces they own.
 */

import { BookmarkRepository, bookmarkRepository } from "./repository";
import { CreateBookmarkInput } from "./dto";
import { workspaceRepository } from "../workspace/repository";
import { NotFoundError, ValidationError } from "@/common/errors";

export class BookmarkService {
  private repository: BookmarkRepository;

  constructor(repository: BookmarkRepository = bookmarkRepository) {
    this.repository = repository;
  }

  /**
   * Adds a new bookmark to the workspace.
   * Asserts workspace ownership, prevents duplicate bookmarks, and creates the record.
   */
  async add(userId: string, data: CreateBookmarkInput) {
    // Enforce workspace ownership to prevent cross-tenant bookmarking
    const ws = await workspaceRepository.findById(data.workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    // Check for duplicate bookmarks
    const existing = await this.repository.findDuplicate(data.workspaceId, data.questionId, data.subtopicId);
    if (existing) {
      throw new ValidationError("Item is already bookmarked in this workspace");
    }

    return this.repository.create(data);
  }

  /**
   * Removes a bookmark by its ID.
   * Asserts that the bookmark exists and belongs to a workspace owned by the user.
   */
  async remove(userId: string, id: string) {
    const bookmark = await this.repository.findById(id);
    if (!bookmark) {
      throw new NotFoundError("Bookmark not found");
    }

    // Verify workspace ownership before deletion
    const ws = await workspaceRepository.findById(bookmark.workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    await this.repository.delete(id);
    return { id, deleted: true };
  }

  /**
   * Lists all bookmarks within a workspace.
   * Asserts workspace ownership before returning data.
   */
  async list(userId: string, workspaceId: string) {
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }
    return this.repository.list(workspaceId);
  }
}

export const bookmarkService = new BookmarkService();

