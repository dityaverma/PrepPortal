import { apiHandler } from "@/common/errors";
import { topicController } from "@/modules/topic/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return topicController.getById(req, context);
});

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return topicController.update(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return topicController.delete(req, context);
});
