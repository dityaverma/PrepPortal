import { apiHandler } from "@/common/errors";
import { workspaceController } from "@/modules/workspace/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return workspaceController.getById(req, context);
});

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return workspaceController.rename(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return workspaceController.delete(req, context);
});
