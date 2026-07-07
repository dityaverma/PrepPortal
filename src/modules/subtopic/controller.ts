import { subtopicService } from "./service";
import { CreateSubtopicSchema, UpdateSubtopicSchema } from "./dto";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

/**
 * Subtopic Controller Layer
 * 
 * Exposes endpoints to search, create, modify, and delete curriculum Subtopics.
 */
export class SubtopicController {
  /**
   * Retrieves a paginated list of subtopics.
   */
  async list(req: Request) {
    getUserContext(req);
    const query = parseQueryParams(req.url, "name");
    const { items, total } = await subtopicService.list(query);
    return successResponse(items, "Subtopics retrieved successfully", 200, getPaginationMeta(total, query));
  }

  /**
   * Creates a new subtopic catalog entry. ADMIN/SUPER_ADMIN only.
   */
  async create(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = CreateSubtopicSchema.parse(body);
    const subtopic = await subtopicService.create(parsed);
    return successResponse(subtopic, "Subtopic created successfully", 201);
  }

  /**
   * Retrieves details of a specific subtopic.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    getUserContext(req);
    const subtopic = await subtopicService.getById(id);
    return successResponse(subtopic, "Subtopic details retrieved successfully");
  }

  /**
   * Updates an existing subtopic. ADMIN/SUPER_ADMIN only.
   */
  async update(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = UpdateSubtopicSchema.parse(body);
    const subtopic = await subtopicService.update(id, parsed);
    return successResponse(subtopic, "Subtopic updated successfully");
  }

  /**
   * Deletes a subtopic catalog entry. ADMIN/SUPER_ADMIN only.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const result = await subtopicService.delete(id);
    return successResponse(result, "Subtopic deleted successfully");
  }
}

export const subtopicController = new SubtopicController();
