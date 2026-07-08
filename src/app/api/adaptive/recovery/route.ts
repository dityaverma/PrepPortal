import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/adaptive/controller";

// record recovery quiz score
export const POST = apiHandler(async (req: Request) => {
  return adaptiveController.submitRecovery(req);
});
