import { apiHandler } from "@/common/errors";
import { studyLinkController } from "@/modules/studylink/controller";

export const GET = apiHandler(async (req: Request) => {
  return studyLinkController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return studyLinkController.create(req);
});
