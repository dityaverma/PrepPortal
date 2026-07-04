import { apiHandler, successResponse, ValidationError } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { roadmapService } from "@/modules/roadmap/service";

/**
 * GET /api/roadmaps
 * 
 * Fetches the learning topic roadmap map for the student workspace.
 * If a roadmap doesn't exist for the workspace, it initiates automated node creations.
 * 
 * Query Params:
 * - workspaceId: UUID of the workspace container (Required)
 */
export const GET = apiHandler(async (req: Request) => {
  const { userId } = getUserContext(req);
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    throw new ValidationError("workspaceId query parameter is required");
  }

  // Load target roadmap nodes (lock status mapped to prerequisites)
  const roadmap = await roadmapService.getOrCreateRoadmap(userId, workspaceId);
  return successResponse(roadmap, "Roadmap loaded successfully");
});

