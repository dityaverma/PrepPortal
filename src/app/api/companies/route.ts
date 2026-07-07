import { apiHandler } from "@/common/errors";
import { companyController } from "@/modules/company/controller";

export const GET = apiHandler(async (req: Request) => {
  return companyController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return companyController.create(req);
});
