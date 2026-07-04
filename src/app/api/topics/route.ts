import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { topicService } from "@/modules/topic/service";
import { CreateTopicSchema } from "@/modules/topic/dto";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

/**
 * GET /api/topics
 * 
 * Fetches a list of curriculum topics. Supports pagination, text search,
 * and filtering by parent subject.
 */
export const GET = apiHandler(async (req: Request) => {
  getUserContext(req); // Enforce active session
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId") || undefined;
  
  // Parse standardized paginated query options
  const query = parseQueryParams(req.url, "name");
  const { items, total } = await topicService.list(query, subjectId);
  return successResponse(items, "Topics retrieved successfully", 200, getPaginationMeta(total, query));
});

/**
 * POST /api/topics
 * 
 * Creates a new topic inside the master catalog (restricted to ADMIN/SUPER_ADMIN).
 */
export const POST = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = CreateTopicSchema.parse(body);
  const topic = await topicService.create(parsed);
  return successResponse(topic, "Topic created successfully", 201);
});

