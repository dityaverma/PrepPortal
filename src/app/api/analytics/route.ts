import { apiHandler, successResponse, ValidationError } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { analyticsService } from "@/modules/analytics/service";

/**
 * GET /api/analytics
 * 
 * Fetches dashboard analytics data (such as progress percentages, scores, and target companies) 
 * for a specific student workspace.
 * 
 * Query Params:
 * - workspaceId: UUID of the target workspace (Required)
 */
export const GET = apiHandler(async (req: Request) => {
  // Extract user authorization details from request context headers
  const { userId } = getUserContext(req);
  
  // Parse workspace ID query parameters
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    throw new ValidationError("workspaceId query parameter is required");
  }

  // Fetch compiled analytics metrics
  const metrics = await analyticsService.getStudentAnalytics(userId, workspaceId);
  return successResponse(metrics, "Student analytics retrieved successfully");
});

