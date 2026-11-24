import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(80, "Maksimal 80 karakter"),
  is_active: z.boolean().optional().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
