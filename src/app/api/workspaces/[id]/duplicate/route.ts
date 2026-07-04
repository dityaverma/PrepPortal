import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { workspaceService } from "@/modules/workspace/service";

export const POST = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId } = getUserContext(req);
  const result = await workspaceService.duplicate(id, userId);
  return successResponse(result, "Workspace duplicated successfully", 201);
});
