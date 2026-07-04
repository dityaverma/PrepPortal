import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleName: z.enum(["STUDENT", "ADMIN", "SUPER_ADMIN"]).default("STUDENT"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
