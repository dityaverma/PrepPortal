/**
 * Authentication Controller Layer
 * 
 * Handles incoming HTTP requests for registration and login operations.
 * Responsible for:
 * 1. Extracting request bodies
 * 2. Validating payloads using Zod DTO schemas
 * 3. Routing validated input to the AuthService
 * 4. Structuring unified API response objects
 */

import { RegisterSchema, LoginSchema } from "./dto";
import { authService } from "./service";
import { successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";

export class AuthController {
  /**
   * Registers a new user in the platform.
   * Parses the JSON request body, validates it against RegisterSchema,
   * invokes AuthService.register, and returns a 201 status with the new user info.
   */
  async register(req: Request) {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);
    const result = await authService.register(parsed);
    return successResponse(result, "Registration successful", 201);
  }

  /**
   * Authenticates an existing user in the platform.
   * Parses the JSON request body, validates it against LoginSchema,
   * invokes AuthService.login, and returns a JWT along with user details.
   */
  async login(req: Request) {
    const body = await req.json();
    const parsed = LoginSchema.parse(body);
    const result = await authService.login(parsed);
    return successResponse(result, "Login successful");
  }

  /**
   * Returns current session parameters parsed from middleware authorization headers.
   */
  async session(req: Request) {
    const userContext = getUserContext(req);
    return successResponse({ user: userContext }, "Session active");
  }

  /**
   * Clears the user's session context cookie by emitting a deletion header.
   */
  async logout(req: Request) {
    getUserContext(req);
    const res = successResponse({ success: true }, "Logout successful");
    res.cookies.set("auth-token", "", { expires: new Date(0), path: "/" });
    return res;
  }
}

export const authController = new AuthController();

