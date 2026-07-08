/**
 * Authentication Service Layer
 * 
 * Manages all authentication operations including:
 * - Registering new user accounts with password hashing (bcrypt)
 * - Assigning default roles and seeding initial permissions
 * - Authenticating users and generating stateless JWTs (jose)
 * - Verifying and decoding session tokens
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { AuthRepository, authRepository } from "./repository";
import { RegisterInput, LoginInput } from "./dto";
import { AuthError, ValidationError } from "@/common/errors";

if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL CONFIGURATION ERROR: process.env.JWT_SECRET is not configured.");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository = authRepository) {
    this.repository = repository;
  }

  /**
   * Registers a new user.
   * Checks for email duplication, hashes the password, resolves the role (and seeds standard 
   * role permissions if new), inserts the database record, and issues an initial JWT.
   */
  async register(input: RegisterInput) {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      throw new ValidationError("A user with this email already exists");
    }

    // Hash password with a salt round of 10
    const passwordHash = await bcrypt.hash(input.password, 10);

    // Resolve or create role dynamically
    let role = await this.repository.findRoleByName(input.roleName);
    if (!role) {
      role = await this.repository.createRole(input.roleName);
      // Seed initial mock permission for workspace actions to bootstrap permissions
      const perm = await this.repository.createPermission(`ACCESS_${input.roleName}`);
      await this.repository.assignPermissionToRole(role.id, perm.id);
    }

    // Persist the user record
    const user = await this.repository.createUser({
      email: input.email,
      password: input.password,
      roleName: input.roleName,
      passwordHash,
      roleId: role.id,
    });

    const permissions = await this.repository.getUserPermissions(user.roleId);
    const token = await this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  /**
   * Log in user by matching email and verifying hashed password.
   * Emits a stateless session JWT upon successful authentication.
   */
  async login(input: LoginInput) {
    const user = await this.repository.findByEmail(input.email);
    if (!user) {
      throw new AuthError("Invalid email or password");
    }

    // Compare raw password with stored password hash
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthError("Invalid email or password");
    }

    // Compile active permissions for inclusion in the JWT payload
    const permissions = user.role.permissions.map((rp) => rp.permission.name);
    const token = await this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  /**
   * Generates a signed, stateless JSON Web Token (JWT) with user session details.
   */
  async generateToken(payload: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Token is valid for 24 hours
      .sign(JWT_SECRET);
  }

  /**
   * Verifies the authenticity and signature of a JWT.
   * 
   * @throws {AuthError} If signature is invalid, tampered with, or expired
   */
  async verifyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as {
        userId: string;
        email: string;
        role: string;
        permissions: string[];
      };
    } catch (_err) {
      throw new AuthError("Session expired or invalid token");
    }
  }
}

export const authService = new AuthService();

