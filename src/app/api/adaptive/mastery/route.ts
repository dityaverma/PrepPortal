import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/antigravity/controller";

// fetch mastery metrics
export const GET = apiHandler(async (req: Request) => {
  return adaptiveController.getMastery(req);
});
