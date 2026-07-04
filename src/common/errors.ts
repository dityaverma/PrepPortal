/**
 * Global Error Handling & Unified API Response Wrapper
 * 
 * This module defines custom Application Errors, standardized API Response interfaces,
 * and a higher-order API Handler wrapper.
 * 
 * Advantages:
 * 1. Consistent JSON Contract: Success and error responses follow the same payload schema.
 * 2. Automatic Input Validation Handling: Intercepts and parses ZodError schemas.
 * 3. Graceful Database Errors: Identifies common PrismaClient constraint validation errors (e.g. duplicate keys).
 * 4. Cleaner Endpoint Code: Developers can use `throw new AppError(...)` instead of writing try-catch blocks in route handlers.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Base Application Error
 * All custom operational exceptions should extend this class.
 */
export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    // Captures the call stack trace excluding this constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request: For user validation or malformed client parameters
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

// 401 Unauthorized: Invalid, expired, or missing tokens
export class AuthError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 401, details);
  }
}

// 403 Forbidden: Authenticated user lacks permission/role scope
export class ForbiddenError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 403, details);
  }
}

// 404 Not Found: Entity doesn't exist or user isn't authorized to know it exists
export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 404, details);
  }
}

// 500 Internal Database Error: Query constraint/schema failures
export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, details);
  }
}

// Standardized payload contract for all API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: any;
    code?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Helper to construct standard HTTP 200 Success responses.
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200,
  pagination?: ApiResponse["pagination"]
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination,
    },
    { status: statusCode }
  );
}

/**
 * Global Error Interceptor and Formatter.
 * Maps language exceptions and external DB errors to standard HTTP status codes.
 */
export function errorResponse(error: any): NextResponse<ApiResponse> {
  let statusCode = 500;
  let message = "An internal server error occurred.";
  let details: any = undefined;
  let code = "INTERNAL_SERVER_ERROR";

  // 1. Process custom operational application errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
    code = error.name.replace(/Error$/, "").toUpperCase() + "_ERROR";
  } 
  // 2. Process schema validation failures (Zod)
  else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed.";
    code = "VALIDATION_ERROR";
    // Format error structures into user-friendly field-message arrays
    details = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } 
  // 3. Process unexpected runtime errors & Prisma Client constraints
  else if (error instanceof Error) {
    message = error.message;
    // Intercept Prisma Client unique constraints (P2002), etc.
    if (error.message.includes("PrismaClientKnownRequestError") || (error as any).code) {
      const prismaCode = (error as any).code;
      code = `DATABASE_${prismaCode || "ERROR"}`;
      statusCode = 400; // Database constraints usually indicate validation/conflict anomalies
      message = "Database operation failed constraint checks.";
      details = { code: prismaCode };
    }
  }

  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        message,
        details,
        code,
      },
    },
    { status: statusCode }
  );
}

/**
 * Higher-order utility to wrap Route Handlers.
 * Catches all async errors and routes them to errorResponse formatter.
 */
export function apiHandler(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      console.error(`[API Error in ${request.url}]:`, error);
      return errorResponse(error);
    }
  };
}

