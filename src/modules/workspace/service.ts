/**
 * Workspace Service Layer
 * 
 * Coordinates the business rules for student workspace tenants, including:
 * - CRUD lifecycle operations
 * - Archive/restore features
 * - duplification of workspace curriculums/bookmarks
 * - active workspace container switching
 */

import { WorkspaceRepository, workspaceRepository } from "./repository";
import { CreateWorkspaceInput } from "./dto";
import { NotFoundError } from "@/common/errors";

export class WorkspaceService {
  private repository: WorkspaceRepository;

  constructor(repository: WorkspaceRepository = workspaceRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves workspace by ID, validating that it belongs to the authenticated user.
   */
  async getById(id: string, userId: string) {
    const ws = await this.repository.findById(id, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }
    return ws;
  }

  /**
   * Lists workspaces owned by a user, filtered by archive status.
   */
  async list(userId: string, archived = false) {
    if (archived) {
      return this.repository.findArchived(userId);
    }
    return this.repository.findAll(userId);
  }

  /**
   * Creates a new workspace.
   */
  async create(userId: string, data: CreateWorkspaceInput) {
    return this.repository.create(userId, data);
  }

  /**
   * Renames a workspace.
   */
  async rename(id: string, userId: string, name: string) {
    const ws = await this.getById(id, userId);
    await this.repository.update(id, userId, { name });
    return { ...ws, name };
  }

  /**
   * Archives a workspace by marking archived = true and setting the archive date.
   */
  async archive(id: string, userId: string) {
    await this.getById(id, userId);
    await this.repository.update(id, userId, { archived: true, archivedAt: new Date() });
    return { id, archived: true };
  }

  /**
   * Restores an archived workspace back to active status.
   */
  async restore(id: string, userId: string) {
    await this.getById(id, userId);
    await this.repository.update(id, userId, { archived: false, archivedAt: null });
    return { id, archived: false };
  }

  /**
   * Deletes a workspace.
   */
  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await this.repository.delete(id, userId);
    return { id, deleted: true };
  }

  /**
   * Duplicates an existing workspace structure including roadmaps, sequence order, and bookmarks.
   */
  async duplicate(id: string, userId: string) {
    const ws = await this.getById(id, userId);
    const newName = `${ws.name} (Copy)`;
    return this.repository.duplicate(id, userId, newName);
  }

  /**
   * Switch the active workspace. Returns metadata to update client application state.
   */
  async switchWorkspace(id: string, userId: string) {
    const ws = await this.getById(id, userId);
    // Return metadata confirming this is the current active workspace
    return {
      activeWorkspaceId: ws.id,
      name: ws.name,
      targetRole: ws.targetRole,
    };
  }
}

export const workspaceService = new WorkspaceService();

