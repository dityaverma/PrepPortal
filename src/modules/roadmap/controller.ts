import { roadmapService } from "./service";
import { getUserContext } from "@/common/auth-helper";
import { successResponse, ValidationError } from "@/common/errors";

/**
 * Roadmap Controller Layer
 * 
 * Handles learning curriculum map requests.
 */
export class RoadmapController {
  /**
   * Retrieves or initializes the topic roadmap for a workspace.
   */
  async getRoadmap(req: Request) {
    const { userId } = getUserContext(req);
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      throw new ValidationError("workspaceId query parameter is required");
    }

    const roadmap = await roadmapService.getOrCreateRoadmap(userId, workspaceId);
    return successResponse(roadmap, "Roadmap loaded successfully");
  }
}

export const roadmapController = new RoadmapController();
