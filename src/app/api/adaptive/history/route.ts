import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/antigravity/controller";

// fetch recommendation history log
export const GET = apiHandler(async (req: Request) => {
  return adaptiveController.getHistory(req);
});
