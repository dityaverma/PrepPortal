import { analyticsService } from "./service";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse, ValidationError } from "@/common/errors";

/**
 * Analytics Controller Layer
 * 
 * Exposes statistical reporting and curriculum analytics endpoints.
 */
export class AnalyticsController {
  /**
   * Retrieves progression and score metrics for a specific student workspace.
   */
  async getStudentMetrics(req: Request) {
    const { userId } = getUserContext(req);
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      throw new ValidationError("workspaceId query parameter is required");
    }

    const metrics = await analyticsService.getStudentAnalytics(userId, workspaceId);
    return successResponse(metrics, "Student analytics retrieved successfully");
  }

  /**
   * Retrieves global stats. ADMIN/SUPER_ADMIN only.
   */
  async getAdminMetrics(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const metrics = await analyticsService.getAdminAnalytics();
    return successResponse(metrics, "Admin metrics dashboard retrieved successfully");
  }
}

export const analyticsController = new AnalyticsController();
