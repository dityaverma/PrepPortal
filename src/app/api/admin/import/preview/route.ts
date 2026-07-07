import { apiHandler } from "@/common/errors";
import { quizImportController } from "@/modules/quiz-import/controller";

// preview quiz questions route
export const POST = apiHandler(async (req: Request) => {
  return quizImportController.preview(req);
});
