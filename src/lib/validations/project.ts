import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama proyek minimal 2 karakter")
    .max(120, "Maksimal 120 karakter"),
  is_active: z.boolean().optional().default(true),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
