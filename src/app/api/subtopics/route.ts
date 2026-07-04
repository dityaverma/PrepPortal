import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { subtopicService } from "@/modules/subtopic/service";
import { CreateSubtopicSchema } from "@/modules/subtopic/dto";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

export const GET = apiHandler(async (req: Request) => {
  getUserContext(req);
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId") || undefined;
  
  const query = parseQueryParams(req.url, "name");
  const { items, total } = await subtopicService.list(query, topicId);
  return successResponse(items, "Subtopics retrieved successfully", 200, getPaginationMeta(total, query));
});

export const POST = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = CreateSubtopicSchema.parse(body);
  const subtopic = await subtopicService.create(parsed);
  return successResponse(subtopic, "Subtopic created successfully", 201);
});
