import { apiHandler, successResponse } from "@/common/errors";
import { enforceRole } from "@/common/auth-helper";
import { questionService } from "@/modules/question/service";
import { BulkImportSchema } from "@/modules/question/dto";

export const POST = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = BulkImportSchema.parse(body);
  const result = await questionService.bulkImport(parsed);
  return successResponse(result, `Successfully imported ${result.length} questions`, 201);
});
