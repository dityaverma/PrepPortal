import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { subjectService } from "@/modules/subject/service";
import { UpdateSubjectSchema } from "@/modules/subject/dto";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getUserContext(req);
  const subject = await subjectService.getById(id);
  return successResponse(subject, "Subject details retrieved successfully");
});

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = UpdateSubjectSchema.parse(body);
  const subject = await subjectService.update(id, parsed);
  return successResponse(subject, "Subject updated successfully");
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const result = await subjectService.delete(id);
  return successResponse(result, "Subject deleted successfully");
});
