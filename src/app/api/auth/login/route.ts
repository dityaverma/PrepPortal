import { apiHandler } from "@/common/errors";
import { authController } from "@/modules/auth/controller";

/**
 * POST /api/auth/login
 * 
 * Authenticates user credentials (email and password),
 * returning a JWT token upon success.
 */
export const POST = apiHandler(async (req: Request) => {
  // Delegate handling of request parsing, verification, and response generation to authController
  return authController.login(req);
});

