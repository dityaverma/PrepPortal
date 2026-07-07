import { apiHandler } from "@/common/errors";
import { workspaceController } from "@/modules/workspace/controller";

export const GET = apiHandler(async (req: Request) => {
  return workspaceController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return workspaceController.create(req);
});
