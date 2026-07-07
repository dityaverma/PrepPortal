import { apiHandler } from "@/common/errors";
import { bookmarkController } from "@/modules/bookmark/controller";

export const GET = apiHandler(async (req: Request) => {
  return bookmarkController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return bookmarkController.add(req);
});
