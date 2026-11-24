import { z } from "zod";

export const requestItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama item wajib diisi")
    .max(200, "Maksimal 200 karakter"),
  category_id: z.string().min(1, "Kategori item wajib dipilih"),
  amount: z.coerce
    .number()
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: "Nominal item harus lebih dari nol",
    }),
});

export const requestFormSchema = z.object({
  type: z.enum(["pengajuan", "reimbursement"]),
  title: z
    .string()
    .trim()
    .min(1, "Nama pengajuan wajib diisi")
    .max(200, "Maksimal 200 karakter"),
  project_id: z.string().min(1, "Proyek wajib dipilih"),
  submission_date: z.string().min(1, "Tanggal pengajuan wajib diisi"),
  notes: z
    .string()
    .max(1000, "Maksimal 1000 karakter")
    .nullable()
    .optional(),
  items: z.array(requestItemSchema).min(1, "Minimal satu item"),
});

export type RequestItemValues = z.infer<typeof requestItemSchema>;
export type RequestFormValues = z.infer<typeof requestFormSchema>;

export const payItemSchema = z.object({
  item_id: z.string().min(1),
  disbursement_date: z.string().min(1, "Tanggal pencairan wajib diisi"),
  notes: z.string().max(1000).nullable().optional(),
});

export const realizeItemSchema = z.object({
  item_id: z.string().min(1),
  realized_date: z.string().min(1, "Tanggal realisasi wajib diisi"),
  notes: z.string().max(1000).nullable().optional(),
});
