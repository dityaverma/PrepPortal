import { apiHandler } from "@/common/errors";
import { subtopicController } from "@/modules/subtopic/controller";

export const GET = apiHandler(async (req: Request) => {
  return subtopicController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return subtopicController.create(req);
});
