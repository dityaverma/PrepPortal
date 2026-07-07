import { apiHandler } from "@/common/errors";
import { quizImportController } from "@/modules/quiz-import/controller";

// upload quiz file route
export const POST = apiHandler(async (req: Request) => {
  return quizImportController.upload(req);
});
