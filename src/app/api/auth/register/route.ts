import { apiHandler } from "@/common/errors";
import { authController } from "@/modules/auth/controller";

export const POST = apiHandler(async (req: Request) => {
  return authController.register(req);
});
