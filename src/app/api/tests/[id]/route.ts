import { apiHandler } from "@/common/errors";
import { testController } from "@/modules/test/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return testController.getById(req, context);
});
