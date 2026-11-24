"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";

import { createRequest, updateRequest } from "@/actions/requests";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatNumber, parseCurrencyInput } from "@/lib/format";
import {
  requestFormSchema,
  type RequestFormValues,
} from "@/lib/validations/request";
import {
  REQUEST_TYPE_LABELS,
  type Category,
  type ExpenseRequestItem,
  type ExpenseRequestWithRelations,
  type Project,
} from "@/types";

interface RequestFormProps {
  mode: "create" | "edit";
  categories: Category[];
  projects: Project[];
  request?: ExpenseRequestWithRelations;
  items?: ExpenseRequestItem[];
  itemsLocked?: boolean;
}

function emptyItem() {
  return { name: "", category_id: "", amount: 0 };
}

function itemsToForm(items: ExpenseRequestItem[]) {
  return items.map((item) => ({
    name: item.name,
    category_id: item.category_id ?? "",
    amount: Number(item.amount),
  }));
}

export function RequestForm({
  mode,
  categories,
  projects,
  request,
  items,
  itemsLocked = false,
}: RequestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema) as unknown as Resolver<RequestFormValues>,
    defaultValues: {
      type: request?.type ?? "pengajuan",
      title: request?.title ?? "",
      project_id: request?.project_id ?? "",
      submission_date: request?.submission_date ?? "",
      notes: request?.notes ?? "",
      items:
        items && items.length > 0 ? itemsToForm(items) : [emptyItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const type = useWatch({ control: form.control, name: "type" });
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const total = (watchedItems ?? []).reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0,
  );

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

  const onSubmit = form.handleSubmit(async (values, event) => {
    setPending(true);
    setServerError(null);

    const payloadItems =
      itemsLocked && items && items.length > 0
        ? itemsToForm(items)
        : values.items ?? [];

    const formData = new FormData(event?.target as HTMLFormElement);
    if (request?.id) formData.set("id", request.id);
    formData.set("type", values.type);
    formData.set("title", values.title);
    formData.set("project_id", values.project_id);
    formData.set("submission_date", values.submission_date);
    formData.set("notes", values.notes ?? "");
    formData.set(
      "items",
      JSON.stringify(
        payloadItems.map((item) => ({
          name: item.name,
          category_id: item.category_id,
          amount: Number(item.amount),
        })),
      ),
    );

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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Card>
        <CardContent className="space-y-5 p-4 sm:p-6">
          {serverError ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="type">
                Jenis Pengajuan <span className="text-destructive">*</span>
              </Label>
              {mode === "edit" ? (
                <>
                  <input type="hidden" {...form.register("type")} />
                  <div className="flex h-11 items-center rounded-[10px] border border-border bg-secondary/50 px-3 text-sm text-foreground">
                    {REQUEST_TYPE_LABELS[type] ?? REQUEST_TYPE_LABELS.pengajuan}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jenis tidak dapat diubah setelah dibuat.
                  </p>
                </>
              ) : (
                <Select id="type" {...form.register("type")}>
                  <option value="pengajuan">Pengajuan</option>
                  <option value="reimbursement">Reimbursement</option>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project_id">
                Proyek <span className="text-destructive">*</span>
              </Label>
              <Select
                id="project_id"
                {...form.register("project_id")}
                aria-invalid={Boolean(form.formState.errors.project_id)}
              >
                <option value="">Pilih proyek</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                    {!project.is_active ? " (nonaktif)" : ""}
                  </option>
                ))}
              </Select>
              {form.formState.errors.project_id ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.project_id.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">
              Nama Pengajuan <span className="text-destructive">*</span>
            </Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
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
              />
              {form.formState.errors.submission_date ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.submission_date.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label>Total Nominal</Label>
              <div className="flex h-11 items-center rounded-[10px] border border-border bg-secondary/50 px-3 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Informasi tambahan (opsional)"
              {...form.register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-base font-semibold text-foreground">Item</p>
              <p className="text-sm text-muted-foreground">
                Satu pengajuan dapat berisi lebih dari satu item.
              </p>
            </div>
            {!itemsLocked ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyItem())}
              >
                <Plus className="size-4" />
                Tambah Item
              </Button>
            ) : null}
          </div>

          {itemsLocked && items ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-warning-soft px-3 py-2 text-sm text-[#8a5310]">
                Sebagian item sudah diproses, jadi daftar item tidak dapat diubah.
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.category?.name ?? "Tanpa kategori"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(item.amount)}
                    </p>
                    <StatusBadge status={item.status} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {typeof form.formState.errors.items?.message === "string" ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.items.message}
                </p>
              ) : null}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const itemErrors = form.formState.errors.items?.[index];
                  return (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border p-3 sm:p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Item {index + 1}
                        </span>
                        {fields.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="iconSm"
                            className="text-destructive"
                            onClick={() => remove(index)}
                            aria-label="Hapus item"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5 sm:col-span-2">
                          <Label htmlFor={`item-name-${index}`}>Nama Item</Label>
                          <Input
                            id={`item-name-${index}`}
                            {...form.register(`items.${index}.name`)}
                          />
                          {itemErrors?.name ? (
                            <p className="text-xs text-destructive">
                              {itemErrors.name.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`item-cat-${index}`}>Kategori</Label>
                          <Select
                            id={`item-cat-${index}`}
                            {...form.register(`items.${index}.category_id`)}
                          >
                            <option value="">Pilih kategori</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                                {!category.is_active ? " (nonaktif)" : ""}
                              </option>
                            ))}
                          </Select>
                          {itemErrors?.category_id ? (
                            <p className="text-xs text-destructive">
                              {itemErrors.category_id.message}
                            </p>
                          ) : null}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`item-amount-${index}`}>Nominal</Label>
                          <Controller
                            control={form.control}
                            name={`items.${index}.amount`}
                            render={({ field: amountField }) => (
                              <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                  Rp
                                </span>
                                <Input
                                  id={`item-amount-${index}`}
                                  inputMode="numeric"
                                  className="pl-9 text-right tabular-nums"
                                  value={
                                    amountField.value
                                      ? formatNumber(Number(amountField.value))
                                      : ""
                                  }
                                  onChange={(event) =>
                                    amountField.onChange(
                                      parseCurrencyInput(event.target.value),
                                    )
                                  }
                                />
                              </div>
                            )}
                          />
                          {itemErrors?.amount ? (
                            <p className="text-xs text-destructive">
                              {itemErrors.amount.message}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {type === "reimbursement" && mode === "create" ? (
                        <div className="mt-3 space-y-1.5">
                          <Label htmlFor={`item-receipt-${index}`}>
                            Foto Struk / Barang
                          </Label>
                          <Input
                            id={`item-receipt-${index}`}
                            name={`receipt_${index}`}
                            type="file"
                            multiple
                            accept="image/*,application/pdf"
                          />
                          <p className="text-xs text-muted-foreground">
                            Opsional saat menyimpan; bisa ditambah nanti di halaman
                            detail.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          asChild
          className="w-full sm:w-auto"
        >
          <Link href={request ? `/requests/${request.id}` : "/requests"}>
            Batal
          </Link>
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
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
