import { apiHandler } from "@/common/errors";
import { subjectController } from "@/modules/subject/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return subjectController.getById(req, context);
});

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return subjectController.update(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return subjectController.delete(req, context);
});
