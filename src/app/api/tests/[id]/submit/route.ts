import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { testService } from "@/modules/test/service";
import { SubmitTestSchema } from "@/modules/test/dto";

/**
 * POST /api/tests/[id]/submit
 * 
 * Submits an active test, grades the selected choices, logs attempt history,
 * and updates curriculum roadmap unlock statuses.
 */
export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  // Await dynamic route params for Next.js 15 compatibility
  const { id } = await params;
  const { userId } = getUserContext(req);
  
  // Parse and validate test answers payload
  const body = await req.json();
  const parsed = SubmitTestSchema.parse(body);

  // Invoke evaluation engine to grade the answers
  const evaluation = await testService.submitTest(userId, id, parsed);
  return successResponse(evaluation, "Test submitted and graded successfully");
});

