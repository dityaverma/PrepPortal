import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { studyHistoryService } from "@/modules/workspace/history-service";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: workspaceId } = await params;
  const { userId } = getUserContext(req);
  const history = await studyHistoryService.listSessions(userId, workspaceId);
  return successResponse(history, "Study history retrieved successfully");
});

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: workspaceId } = await params;
  const { userId } = getUserContext(req);
  const body = await req.json().catch(() => ({}));
  const session = await studyHistoryService.startSession(userId, workspaceId, body);
  return successResponse(session, "Study session started successfully", 201);
});
