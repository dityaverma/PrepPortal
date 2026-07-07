import { apiHandler } from "@/common/errors";
import { subtopicController } from "@/modules/subtopic/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return subtopicController.getById(req, context);
});

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return subtopicController.update(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return subtopicController.delete(req, context);
});
