import { apiHandler } from "@/common/errors";
import { testController } from "@/modules/test/controller";

export const POST = apiHandler(async (req: Request) => {
  return testController.create(req);
});
