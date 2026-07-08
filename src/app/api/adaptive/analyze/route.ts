import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/adaptive/controller";

// handle assessment analysis requests
export const POST = apiHandler(async (req: Request) => {
  return adaptiveController.analyze(req);
});
