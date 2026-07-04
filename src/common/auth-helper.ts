/**
 * Authentication and RBAC Downstream Helpers
 * 
 * These helper utilities are executed inside individual Next.js route handlers.
 * Since the JWT is decoded and verified globally at the Edge Middleware boundary,
 * we avoid duplicate decoding tasks by pulling verified credentials directly from
 * headers injected by the middleware.
 */

import { AuthError, ForbiddenError } from "@/common/errors";

// Structure representing the authenticated user's session context
export interface UserContext {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

/**
 * Extracts and parses user identity details from HTTP headers.
 * 
 * @throws {AuthError} If required authentication context headers are missing (unauthenticated)
 */
export function getUserContext(req: Request): UserContext {
  const userId = req.headers.get("x-user-id");
  const email = req.headers.get("x-user-email");
  const role = req.headers.get("x-user-role");
  const permissionsHeader = req.headers.get("x-user-permissions");

  // Validate headers to guarantee the request went through the auth middleware
  if (!userId || !email || !role) {
    throw new AuthError("Unauthorized: User session context missing in headers");
  }

  // Parse permissions array safely
  let permissions: string[] = [];
  try {
    permissions = permissionsHeader ? JSON.parse(permissionsHeader) : [];
  } catch (_err) {
    permissions = [];
  }

  return {
    userId,
    email,
    role,
    permissions,
  };
}

/**
 * Asserts that the authenticated user possesses an allowed role.
 * 
 * @param allowedRoles Array of acceptable roles (e.g. ['ADMIN', 'SUPER_ADMIN'])
 * @throws {ForbiddenError} If user's role is not included in the allowed list
 */
export function enforceRole(req: Request, allowedRoles: string[]): UserContext {
  const user = getUserContext(req);
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Forbidden: Access restricted. Requires one of: ${allowedRoles.join(", ")}`);
  }
  return user;
}

