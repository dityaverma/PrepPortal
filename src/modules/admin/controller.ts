import { adminService } from "./service";
import { enforceRole } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";

/**
 * Admin Controller Layer
 * 
 * Handles incoming administrative requests.
 */
export class AdminController {
  /**
   * Retrieves system counts and status metadata.
   * Restricts access to ADMIN and SUPER_ADMIN roles.
   */
  async getMetadata(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const metadata = await adminService.getSystemMetadata();
    return successResponse(metadata, "System administrative metadata loaded");
  }
}

export const adminController = new AdminController();
