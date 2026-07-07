import { apiHandler } from "@/common/errors";
import { companyController } from "@/modules/company/controller";

export const GET = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return companyController.getById(req, context);
});

export const PUT = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return companyController.update(req, context);
});

export const DELETE = apiHandler(async (req: Request, context: { params: Promise<{ id: string }> }) => {
  return companyController.delete(req, context);
});
