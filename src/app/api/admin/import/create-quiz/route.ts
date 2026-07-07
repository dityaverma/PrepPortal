import { apiHandler } from "@/common/errors";
import { quizImportController } from "@/modules/quiz-import/controller";

// create quiz and insert questions route
export const POST = apiHandler(async (req: Request) => {
  return quizImportController.createQuiz(req);
});
