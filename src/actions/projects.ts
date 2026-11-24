"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/types";
import { requireUser } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validations/project";

function revalidateProjects() {
  revalidatePath("/settings/projects");
  revalidatePath("/requests/new");
  revalidatePath("/requests");
}

export async function createProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireUser();

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    is_active: formData.get("is_active") !== "false",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data proyek.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("projects").insert({
    name: parsed.data.name,
    is_active: parsed.data.is_active ?? true,
    created_by: profile.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Nama proyek sudah digunakan." };
    }
    return { error: error.message };
  }

  revalidateProjects();
  return { success: "Proyek berhasil ditambahkan." };
}

export async function updateProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    is_active: formData.get("is_active") !== "false",
  });

  if (!parsed.success || !id) {
    return {
      fieldErrors: parsed.success
        ? undefined
        : parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data proyek.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      is_active: parsed.data.is_active ?? true,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Nama proyek sudah digunakan." };
    }
    return { error: error.message };
  }

  revalidateProjects();
  return { success: "Proyek berhasil diperbarui." };
}

export async function toggleProjectActive(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const nextValue = formData.get("is_active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("projects").update({ is_active: nextValue }).eq("id", id);

  revalidateProjects();
}
