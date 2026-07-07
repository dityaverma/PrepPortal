import { apiHandler } from "@/common/errors";
import { questionController } from "@/modules/question/controller";

export const GET = apiHandler(async (req: Request) => {
  return questionController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return questionController.create(req);
});
