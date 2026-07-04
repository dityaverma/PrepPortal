import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { studyHistoryService } from "@/modules/workspace/history-service";

/**
 * POST /api/workspaces/[id]/study-history/[historyId]
 * 
 * Ends an active study session for a topic/subtopic inside a workspace.
 * Logs duration metrics to track active study habits.
 */
export const POST = apiHandler(
  async (req: Request, { params }: { params: Promise<{ id: string; historyId: string }> }) => {
    // Await params as dynamic route variables are async in Next.js 15
    const { id: workspaceId, historyId } = await params;
    const { userId } = getUserContext(req);
    
    // Conclude study session and calculate total study time
    const session = await studyHistoryService.endSession(userId, workspaceId, historyId);
    return successResponse(session, "Study session ended successfully");
  }
);

