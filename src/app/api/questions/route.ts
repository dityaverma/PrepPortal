import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { questionService } from "@/modules/question/service";
import { CreateQuestionSchema } from "@/modules/question/dto";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

export const GET = apiHandler(async (req: Request) => {
  getUserContext(req);
  const { searchParams } = new URL(req.url);
  
  const filters = {
    subjectId: searchParams.get("subjectId") || undefined,
    topicId: searchParams.get("topicId") || undefined,
    subtopicId: searchParams.get("subtopicId") || undefined,
    difficulty: searchParams.get("difficulty") || undefined,
    questionType: searchParams.get("questionType") || undefined,
    companyId: searchParams.get("companyId") || undefined,
  };

  const query = parseQueryParams(req.url, "text");
  const { items, total } = await questionService.list(query, filters);
  return successResponse(items, "Questions retrieved successfully", 200, getPaginationMeta(total, query));
});

export const POST = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = CreateQuestionSchema.parse(body);
  const question = await questionService.create(parsed);
  return successResponse(question, "Question created successfully", 201);
});
