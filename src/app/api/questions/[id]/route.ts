import { apiHandler } from "@/common/errors";
import { questionController } from "@/modules/question/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return questionController.getById(req, context);
});

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return questionController.update(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return questionController.delete(req, context);
});
