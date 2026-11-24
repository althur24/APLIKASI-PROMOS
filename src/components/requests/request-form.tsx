"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";

import { createRequest, updateRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber, parseCurrencyInput } from "@/lib/format";
import { requestFormSchema, type RequestFormValues } from "@/lib/validations/request";
import type { Category, ExpenseRequestWithRelations } from "@/types";

interface RequestFormProps {
  mode: "create" | "edit";
  categories: Category[];
  request?: ExpenseRequestWithRelations;
}

export function RequestForm({ mode, categories, request }: RequestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema) as unknown as Resolver<RequestFormValues>,
    defaultValues: {
      title: request?.title ?? "",
      category_id: request?.category_id ?? "",
      amount: request?.amount ?? 0,
      submission_date: request?.submission_date ?? "",
      status: request?.status ?? "submitted",
      disbursement_date: request?.disbursement_date ?? "",
      notes: request?.notes ?? "",
    },
  });

  const status = useWatch({ control: form.control, name: "status" });
  const { isDirty } = form.formState;

  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    setServerError(null);

    const formData = new FormData();
    if (request?.id) formData.set("id", request.id);
    formData.set("title", values.title);
    formData.set("category_id", values.category_id);
    formData.set("amount", String(values.amount));
    formData.set("submission_date", values.submission_date);
    formData.set("status", values.status);
    formData.set("disbursement_date", values.disbursement_date ?? "");
    formData.set("notes", values.notes ?? "");

    const result =
      mode === "create"
        ? await createRequest(null, formData)
        : await updateRequest(null, formData);

    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      setPending(false);
      return;
    }

    if (result?.success) {
      toast.success(result.success);
    }
  });

  const selectedCategoryInactive =
    request?.category && !categories.some((c) => c.id === request.category_id);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          {serverError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="title">
              Nama Pengajuan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Iklan Instagram November"
              {...form.register("title")}
              aria-invalid={Boolean(form.formState.errors.title)}
            />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category_id">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                id="category_id"
                {...form.register("category_id")}
                aria-invalid={Boolean(form.formState.errors.category_id)}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {!category.is_active ? " (nonaktif)" : ""}
                  </option>
                ))}
              </Select>
              {form.formState.errors.category_id ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.category_id.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="amount">
                Nominal (Rupiah) <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      Rp
                    </span>
                    <Input
                      id="amount"
                      inputMode="numeric"
                      className="pl-9 text-right tabular-nums"
                      value={
                        field.value ? formatNumber(Number(field.value)) : ""
                      }
                      onChange={(event) => {
                        const numeric = parseCurrencyInput(event.target.value);
                        field.onChange(numeric);
                      }}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(form.formState.errors.amount)}
                    />
                  </div>
                )}
              />
              {form.formState.errors.amount ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="submission_date">
                Tanggal Pengajuan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="submission_date"
                type="date"
                {...form.register("submission_date")}
                aria-invalid={Boolean(form.formState.errors.submission_date)}
              />
              {form.formState.errors.submission_date ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.submission_date.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...form.register("status")}>
                <option value="submitted">Sudah Diajukan</option>
                <option value="paid">Sudah Cair</option>
              </Select>
            </div>
          </div>

          {status === "paid" ? (
            <div className="space-y-1.5">
              <Label htmlFor="disbursement_date">
                Tanggal Pencairan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="disbursement_date"
                type="date"
                {...form.register("disbursement_date")}
                aria-invalid={Boolean(
                  form.formState.errors.disbursement_date,
                )}
              />
              {form.formState.errors.disbursement_date ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.disbursement_date.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Informasi tambahan (opsional)"
              {...form.register("notes")}
            />
          </div>

          {selectedCategoryInactive ? (
            <p className="text-xs text-muted-foreground">
              Kategori saat ini sudah nonaktif. Anda tetap dapat menyimpan, atau
              pilih kategori aktif lainnya.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" asChild disabled={pending}>
          <Link
            href={request ? `/requests/${request.id}` : "/requests"}
          >
            Batal
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {pending
            ? "Menyimpan..."
            : mode === "create"
              ? "Simpan Pengajuan"
              : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
