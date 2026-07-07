import { apiHandler } from "@/common/errors";
import { topicController } from "@/modules/topic/controller";

export const GET = apiHandler(async (req: Request) => {
  return topicController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return topicController.create(req);
});
