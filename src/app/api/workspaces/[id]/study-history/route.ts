import { apiHandler } from "@/common/errors";
import { workspaceController } from "@/modules/workspace/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return workspaceController.listStudySessions(req, context);
});

export const POST = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return workspaceController.startStudySession(req, context);
});
