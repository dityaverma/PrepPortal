import { apiHandler } from "@/common/errors";
import { bookmarkController } from "@/modules/bookmark/controller";

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return bookmarkController.remove(req, context);
});
