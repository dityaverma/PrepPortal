import { apiHandler } from "@/common/errors";
import { quizImportController } from "@/modules/quiz-import/controller";

// get import execution history route
export const GET = apiHandler(async (req: Request) => {
  return quizImportController.getHistory(req);
});
