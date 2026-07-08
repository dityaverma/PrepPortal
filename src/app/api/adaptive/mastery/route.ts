import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/adaptive/controller";

// fetch mastery metrics
export const GET = apiHandler(async (req: Request) => {
  return adaptiveController.getMastery(req);
});
