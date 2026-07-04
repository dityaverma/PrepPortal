import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { workspaceService } from "@/modules/workspace/service";
import { RenameWorkspaceSchema } from "@/modules/workspace/dto";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId } = getUserContext(req);
  const workspace = await workspaceService.getById(id, userId);
  return successResponse(workspace, "Workspace details retrieved successfully");
});

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId } = getUserContext(req);
  const body = await req.json();
  const parsed = RenameWorkspaceSchema.parse(body);
  
  const workspace = await workspaceService.rename(id, userId, parsed.name);
  return successResponse(workspace, "Workspace renamed successfully");
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId } = getUserContext(req);
  
  const result = await workspaceService.delete(id, userId);
  return successResponse(result, "Workspace deleted successfully");
});
