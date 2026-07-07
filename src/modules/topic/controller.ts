import { topicService } from "./service";
import { CreateTopicSchema, UpdateTopicSchema } from "./dto";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

/**
 * Topic Controller Layer
 * 
 * Exposes endpoints to search, create, update, and remove curriculum Topics.
 */
export class TopicController {
  /**
   * Retrieves a paginated list of topics.
   */
  async list(req: Request) {
    getUserContext(req);
    const query = parseQueryParams(req.url, "name");
    const { items, total } = await topicService.list(query);
    return successResponse(items, "Topics retrieved successfully", 200, getPaginationMeta(total, query));
  }

  /**
   * Creates a new topic catalog entry. ADMIN/SUPER_ADMIN only.
   */
  async create(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = CreateTopicSchema.parse(body);
    const topic = await topicService.create(parsed);
    return successResponse(topic, "Topic created successfully", 201);
  }

  /**
   * Retrieves details of a specific topic.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    getUserContext(req);
    const topic = await topicService.getById(id);
    return successResponse(topic, "Topic details retrieved successfully");
  }

  /**
   * Updates an existing topic. ADMIN/SUPER_ADMIN only.
   */
  async update(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = UpdateTopicSchema.parse(body);
    const topic = await topicService.update(id, parsed);
    return successResponse(topic, "Topic updated successfully");
  }

  /**
   * Deletes a topic catalog entry. ADMIN/SUPER_ADMIN only.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const result = await topicService.delete(id);
    return successResponse(result, "Topic deleted successfully");
  }
}

export const topicController = new TopicController();
