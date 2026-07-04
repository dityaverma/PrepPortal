import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { topicService } from "@/modules/topic/service";
import { UpdateTopicSchema } from "@/modules/topic/dto";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getUserContext(req);
  const topic = await topicService.getById(id);
  return successResponse(topic, "Topic details retrieved successfully");
});

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = UpdateTopicSchema.parse(body);
  const topic = await topicService.update(id, parsed);
  return successResponse(topic, "Topic updated successfully");
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const result = await topicService.delete(id);
  return successResponse(result, "Topic deleted successfully");
});
