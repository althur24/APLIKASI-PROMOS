import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Format email tidak valid").trim(),
  password: z.string().min(1, "Password wajib diisi"),
});

export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .max(72, "Maksimal 72 karakter"),
    confirm: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Konfirmasi password tidak sama",
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
