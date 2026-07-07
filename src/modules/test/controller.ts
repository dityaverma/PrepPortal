import { testService } from "./service";
import { CreateTestSchema, SubmitTestSchema } from "./dto";
import { getUserContext } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";

/**
 * Test Assessment Controller Layer
 * 
 * Handles HTTP requests for assessing topic mastery.
 */
export class TestController {
  /**
   * Generates a new test assessment instance.
   */
  async create(req: Request) {
    const { userId } = getUserContext(req);
    const body = await req.json();
    const parsed = CreateTestSchema.parse(body);
    
    const test = await testService.createTest(userId, parsed);
    return successResponse(test, "Test generated successfully", 201);
  }

  /**
   * Retrieves test details, omitting correct answers for active sessions.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    
    const testDetails = await testService.getTestDetails(userId, id);
    return successResponse(testDetails, "Test details retrieved successfully");
  }

  /**
   * Submits student answers, triggers grading evaluations and unlocks topics.
   */
  async submit(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    const { userId } = getUserContext(req);
    
    const body = await req.json();
    const parsed = SubmitTestSchema.parse(body);

    const evaluation = await testService.submitTest(userId, id, parsed);
    return successResponse(evaluation, "Test submitted and graded successfully");
  }
}

export const testController = new TestController();
