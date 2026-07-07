import { apiHandler } from "@/common/errors";
import { quizImportController } from "@/modules/quiz-import/controller";

// extract quiz questions route
export const POST = apiHandler(async (req: Request) => {
  return quizImportController.extract(req);
});
