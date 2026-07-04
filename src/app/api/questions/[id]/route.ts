import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { questionService } from "@/modules/question/service";
import { UpdateQuestionSchema } from "@/modules/question/dto";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getUserContext(req);
  const question = await questionService.getById(id);
  return successResponse(question, "Question details retrieved successfully");
});

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = UpdateQuestionSchema.parse(body);
  const question = await questionService.update(id, parsed);
  return successResponse(question, "Question updated successfully");
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const result = await questionService.delete(id);
  return successResponse(result, "Question deleted successfully");
});
