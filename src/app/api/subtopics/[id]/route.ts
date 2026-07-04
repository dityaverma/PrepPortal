import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { subtopicService } from "@/modules/subtopic/service";
import { UpdateSubtopicSchema } from "@/modules/subtopic/dto";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getUserContext(req);
  const subtopic = await subtopicService.getById(id);
  return successResponse(subtopic, "Subtopic details retrieved successfully");
});

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = UpdateSubtopicSchema.parse(body);
  const subtopic = await subtopicService.update(id, parsed);
  return successResponse(subtopic, "Subtopic updated successfully");
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const result = await subtopicService.delete(id);
  return successResponse(result, "Subtopic deleted successfully");
});
