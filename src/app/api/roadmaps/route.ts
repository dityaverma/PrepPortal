import { apiHandler } from "@/common/errors";
import { roadmapController } from "@/modules/roadmap/controller";

export const GET = apiHandler(async (req: Request) => {
  return roadmapController.getRoadmap(req);
});
