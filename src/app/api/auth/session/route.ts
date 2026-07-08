import { apiHandler } from "@/common/errors";
import { authController } from "@/modules/auth/controller";

export const GET = apiHandler(async (req: Request) => {
  return authController.session(req);
});
