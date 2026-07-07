import { apiHandler } from "@/common/errors";
import { testController } from "@/modules/test/controller";

export const POST = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return testController.submit(req, context);
});
