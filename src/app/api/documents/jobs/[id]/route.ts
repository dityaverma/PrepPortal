import { apiHandler } from "@/common/errors";
import { documentController } from "@/modules/document/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return documentController.getJob(req, context);
});
