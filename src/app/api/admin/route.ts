import { apiHandler } from "@/common/errors";
import { adminController } from "@/modules/admin/controller";

export const GET = apiHandler(async (req: Request) => {
  return adminController.getMetadata(req);
});
