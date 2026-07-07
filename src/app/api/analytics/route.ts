import { apiHandler } from "@/common/errors";
import { analyticsController } from "@/modules/analytics/controller";

export const GET = apiHandler(async (req: Request) => {
  return analyticsController.getStudentMetrics(req);
});
