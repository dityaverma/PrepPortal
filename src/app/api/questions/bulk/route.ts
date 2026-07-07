import { apiHandler } from "@/common/errors";
import { questionController } from "@/modules/question/controller";

export const POST = apiHandler(async (req: Request) => {
  return questionController.bulkImport(req);
});
