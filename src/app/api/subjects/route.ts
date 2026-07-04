import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { subjectService } from "@/modules/subject/service";
import { CreateSubjectSchema } from "@/modules/subject/dto";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

export const GET = apiHandler(async (req: Request) => {
  getUserContext(req);
  const query = parseQueryParams(req.url, "name");
  const { items, total } = await subjectService.list(query);
  return successResponse(items, "Subjects retrieved successfully", 200, getPaginationMeta(total, query));
});

export const POST = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = CreateSubjectSchema.parse(body);
  const subject = await subjectService.create(parsed);
  return successResponse(subject, "Subject created successfully", 201);
});
