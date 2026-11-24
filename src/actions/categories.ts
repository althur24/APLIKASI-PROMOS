"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/types";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations/category";

function revalidateCategories() {
  revalidatePath("/settings/categories");
  revalidatePath("/requests/new");
  revalidatePath("/requests");
}

export async function createCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireUser();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    is_active: formData.get("is_active") !== "false",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data kategori.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    is_active: parsed.data.is_active ?? true,
    created_by: profile.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Nama kategori sudah digunakan." };
    }
    return { error: error.message };
  }

  revalidateCategories();
  return { success: "Kategori berhasil ditambahkan." };
}

export async function updateCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    is_active: formData.get("is_active") !== "false",
  });

  if (!parsed.success || !id) {
    return {
      fieldErrors: parsed.success ? undefined : parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data kategori.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      is_active: parsed.data.is_active ?? true,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Nama kategori sudah digunakan." };
    }
    return { error: error.message };
  }

  revalidateCategories();
  return { success: "Kategori berhasil diperbarui." };
}

export async function toggleCategoryActive(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const nextValue = formData.get("is_active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase
    .from("categories")
    .update({ is_active: nextValue })
    .eq("id", id);

  revalidateCategories();
}
