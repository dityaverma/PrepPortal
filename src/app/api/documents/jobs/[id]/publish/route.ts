import { apiHandler } from "@/common/errors";
import { documentController } from "@/modules/document/controller";

export const POST = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return documentController.publish(req, context);
});
