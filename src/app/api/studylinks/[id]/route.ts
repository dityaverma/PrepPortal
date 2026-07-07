import { apiHandler } from "@/common/errors";
import { studyLinkController } from "@/modules/studylink/controller";

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return studyLinkController.update(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return studyLinkController.delete(req, context);
});
