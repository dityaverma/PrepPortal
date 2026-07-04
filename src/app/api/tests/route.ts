import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { testService } from "@/modules/test/service";
import { CreateTestSchema } from "@/modules/test/dto";

export const POST = apiHandler(async (req: Request) => {
  const { userId } = getUserContext(req);
  const body = await req.json();
  const parsed = CreateTestSchema.parse(body);
  
  const test = await testService.createTest(userId, parsed);
  return successResponse(test, "Test generated successfully", 201);
});
