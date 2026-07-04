/**
 * Authentication Repository Layer
 * 
 * Performs direct database access operations using Prisma for authentication,
 * roles, permissions, and user management.
 */

import { prisma } from "@/lib/prisma";
import { RegisterInput } from "./dto";

export class AuthRepository {
  /**
   * Finds a user by email, eager loading the role and its nested permissions.
   * This is critical for compiling permissions into JWTs during login.
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Look up a role record by name.
   */
  async findRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  /**
   * Insert a new role record.
   */
  async createRole(name: string) {
    return prisma.role.create({
      data: { name },
    });
  }

  /**
   * Insert a new permission record.
   */
  async createPermission(name: string) {
    return prisma.permission.create({
      data: { name },
    });
  }

  /**
   * Links a permission to a role in the junction table, bypassing duplicate failures using upsert.
   */
  async assignPermissionToRole(roleId: string, permissionId: string) {
    return prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
      create: { roleId, permissionId },
      update: {},
    });
  }

  /**
   * Persists a new user record in the database.
   */
  async createUser(data: RegisterInput & { passwordHash: string; roleId: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });
  }

  /**
   * Retrieves a list of flat permission names associated with a given role.
   */
  async getUserPermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
    return rolePermissions.map((rp) => rp.permission.name);
  }
}

export const authRepository = new AuthRepository();

