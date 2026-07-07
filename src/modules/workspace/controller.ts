import { workspaceService } from "./service";
import { studyHistoryService } from "./history-service";
import { CreateWorkspaceSchema, RenameWorkspaceSchema } from "./dto";
import { getUserContext } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";

/**
 * Workspace Controller Layer
 * 
 * Routes tenant dashboard, archive/restore, duplication, and study history logs.
 */
export class WorkspaceController {
  /**
   * Lists all workspaces for the authenticated user.
   */
  async list(req: Request) {
    const { userId } = getUserContext(req);
    const workspaces = await workspaceService.list(userId);
    return successResponse(workspaces, "Workspaces retrieved successfully");
  }

  /**
   * Creates a new preparation workspace.
   */
  async create(req: Request) {
    const { userId } = getUserContext(req);
    const body = await req.json();
    const parsed = CreateWorkspaceSchema.parse(body);
    const workspace = await workspaceService.create(userId, parsed);
    return successResponse(workspace, "Workspace created successfully", 201);
  }

  /**
   * Gets details for a workspace.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const workspace = await workspaceService.getById(id, userId);
    return successResponse(workspace, "Workspace details retrieved successfully");
  }

  /**
   * Renames a workspace.
   */
  async rename(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const body = await req.json();
    const parsed = RenameWorkspaceSchema.parse(body);
    const workspace = await workspaceService.rename(id, userId, parsed.name);
    return successResponse(workspace, "Workspace renamed successfully");
  }

  /**
   * Deletes a workspace permanently.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const result = await workspaceService.delete(id, userId);
    return successResponse(result, "Workspace deleted successfully");
  }

  /**
   * Archives a workspace.
   */
  async archive(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const workspace = await workspaceService.archive(id, userId);
    return successResponse(workspace, "Workspace archived successfully");
  }

  /**
   * Restores an archived workspace.
   */
  async restore(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const workspace = await workspaceService.restore(id, userId);
    return successResponse(workspace, "Workspace restored successfully");
  }

  /**
   * Duplicates a workspace including target roles and companies.
   */
  async duplicate(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const workspace = await workspaceService.duplicate(id, userId);
    return successResponse(workspace, "Workspace duplicated successfully", 201);
  }

  /**
   * Sets a workspace as the active workspace in user session.
   */
  async switch(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    const result = await workspaceService.switchWorkspace(id, userId);
    return successResponse(result, "Workspace switch initialized");
  }

  /**
   * Lists study history sessions.
   */
  async listStudySessions(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id: workspaceId } = await context.params;
    const { userId } = getUserContext(req);
    const history = await studyHistoryService.listSessions(userId, workspaceId);
    return successResponse(history, "Study history retrieved successfully");
  }

  /**
   * Starts a new study history session.
   */
  async startStudySession(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id: workspaceId } = await context.params;
    const { userId } = getUserContext(req);
    const body = await req.json().catch(() => ({}));
    const session = await studyHistoryService.startSession(userId, workspaceId, body);
    return successResponse(session, "Study session started successfully", 201);
  }

  /**
   * Concludes a study history session and records duration.
   */
  async endStudySession(req: Request, context: { params: Promise<{ id: string; historyId: string }> }) {
    const { id: workspaceId, historyId } = await context.params;
    const { userId } = getUserContext(req);
    const session = await studyHistoryService.endSession(userId, workspaceId, historyId);
    return successResponse(session, "Study session ended successfully");
  }
}

export const workspaceController = new WorkspaceController();
