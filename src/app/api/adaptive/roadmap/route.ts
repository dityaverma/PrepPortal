import { apiHandler } from "@/common/errors";
import { adaptiveController } from "@/modules/adaptive/controller";

// fetch active roadmap for workspace
export const GET = apiHandler(async (req: Request) => {
  return adaptiveController.getRoadmap(req);
});
