import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/antigravity/controller";

// reset retry state for topic
export const POST = apiHandler(async (req: Request) => {
  return adaptiveController.resetRetry(req);
});
