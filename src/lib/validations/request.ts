import { z } from "zod";

export const requestFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Nama pengajuan wajib diisi")
      .max(200, "Maksimal 200 karakter"),
    category_id: z.string().min(1, "Kategori wajib dipilih"),
    amount: z.coerce
      .number()
      .refine((value) => Number.isFinite(value) && value > 0, {
        message: "Nominal harus lebih dari nol",
      }),
    submission_date: z.string().min(1, "Tanggal pengajuan wajib diisi"),
    status: z.enum(["submitted", "paid"]),
    disbursement_date: z.string().nullable().optional(),
    notes: z
      .string()
      .max(1000, "Maksimal 1000 karakter")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "paid" && !data.disbursement_date) {
      ctx.addIssue({
        code: "custom",
        path: ["disbursement_date"],
        message: "Tanggal pencairan wajib diisi untuk status Sudah Cair",
      });
    }

    if (
      data.status === "paid" &&
      data.disbursement_date &&
      data.submission_date &&
      data.disbursement_date < data.submission_date
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["disbursement_date"],
        message: "Tanggal pencairan tidak boleh sebelum tanggal pengajuan",
      });
    }
  });

export type RequestFormValues = z.infer<typeof requestFormSchema>;

export const statusUpdateSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(["submitted", "paid"]),
    disbursement_date: z.string().nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "paid" && !data.disbursement_date) {
      ctx.addIssue({
        code: "custom",
        path: ["disbursement_date"],
        message: "Tanggal pencairan wajib diisi untuk status Sudah Cair",
      });
    }
  });
