import { z } from "zod";

export const createUserSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(120, "Maksimal 120 karakter"),
  email: z.email("Format email tidak valid").trim(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(72, "Maksimal 72 karakter"),
  role: z.enum(["admin", "user"]),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  full_name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(120, "Maksimal 120 karakter"),
  role: z.enum(["admin", "user"]),
  is_active: z.boolean(),
});

export const resetUserPasswordSchema = z.object({
  id: z.string().min(1),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(72, "Maksimal 72 karakter"),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
export type ResetUserPasswordValues = z.infer<typeof resetUserPasswordSchema>;
