import { apiHandler, successResponse } from "@/common/errors";
import { enforceRole } from "@/common/auth-helper";
import { analyticsService } from "@/modules/analytics/service";

export const GET = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const metrics = await analyticsService.getAdminAnalytics();
  return successResponse(metrics, "Admin metrics dashboard retrieved successfully");
});
