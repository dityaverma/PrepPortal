import { apiHandler } from "@/common/errors";
import { workspaceController } from "@/modules/workspace/controller";

export const POST = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return workspaceController.restore(req, context);
});
