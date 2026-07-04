import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { workspaceService } from "@/modules/workspace/service";
import { CreateWorkspaceSchema } from "@/modules/workspace/dto";

export const GET = apiHandler(async (req: Request) => {
  const { userId } = getUserContext(req);
  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived") === "true";
  
  const workspaces = await workspaceService.list(userId, archived);
  return successResponse(workspaces, "Workspaces retrieved successfully");
});

export const POST = apiHandler(async (req: Request) => {
  const { userId } = getUserContext(req);
  const body = await req.json();
  const parsed = CreateWorkspaceSchema.parse(body);
  
  const workspace = await workspaceService.create(userId, parsed);
  return successResponse(workspace, "Workspace created successfully", 201);
});
