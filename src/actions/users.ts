"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/actions/types";
import { requireAdmin } from "@/lib/dal";
import { createAdminClient, isAdminApiAvailable } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
} from "@/lib/validations/user";

const NO_ADMIN_API =
  "SUPABASE_SERVICE_ROLE_KEY belum diatur. Pengelolaan akun tidak tersedia.";

export async function createUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isAdminApiAvailable()) {
    return { error: NO_ADMIN_API };
  }

  const parsed = createUserSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "user",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pengguna.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      must_change_password: true,
      is_active: true,
    },
  });

  if (error || !data.user) {
    if (/already|registered|exists/i.test(error?.message ?? "")) {
      return { error: "Email sudah terdaftar." };
    }
    return { error: error?.message ?? "Gagal membuat pengguna." };
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: parsed.data.role,
      is_active: true,
      must_change_password: true,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/settings/users");
  return {
    success: `Akun ${parsed.data.email} dibuat. Sampaikan password sementara dan minta pengguna menggantinya saat login pertama.`,
  };
}

export async function updateUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const currentAdmin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    id: formData.get("id"),
    full_name: formData.get("full_name"),
    role: formData.get("role"),
    is_active: formData.get("is_active") === "true",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali data pengguna.",
    };
  }

  const { id, full_name, role, is_active } = parsed.data;

  if (id === currentAdmin.id && role !== currentAdmin.role) {
    return { error: "Anda tidak dapat mengubah role akun sendiri." };
  }

  if (id === currentAdmin.id && !is_active) {
    return { error: "Anda tidak dapat menonaktifkan akun sendiri." };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!target) {
    return { error: "Pengguna tidak ditemukan." };
  }

  const removingAdmin =
    target.role === "admin" && target.is_active && (role !== "admin" || !is_active);

  if (removingAdmin) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_active", true)
      .neq("id", id);

    if ((count ?? 0) === 0) {
      return {
        error:
          "Tidak dapat menonaktifkan atau menurunkan Admin terakhir yang aktif.",
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, role, is_active })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (isAdminApiAvailable() && target.is_active !== is_active) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(id, {
      ban_duration: is_active ? "none" : "876000h",
    });
  }

  revalidatePath("/settings/users");
  return { success: "Data pengguna berhasil diperbarui." };
}

export async function setUserActive(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";

  if (!id) return;
  if (id === currentAdmin.id && !isActive) return;

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", id)
    .maybeSingle();

  if (!target || target.is_active === isActive) return;

  if (target.role === "admin" && !isActive && target.is_active) {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_active", true)
      .neq("id", id);

    if ((count ?? 0) === 0) return;
  }

  await supabase.from("profiles").update({ is_active: isActive }).eq("id", id);

  if (isAdminApiAvailable()) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(id, {
      ban_duration: isActive ? "none" : "876000h",
    });
  }

  revalidatePath("/settings/users");
}

export async function resetUserPassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isAdminApiAvailable()) {
    return { error: NO_ADMIN_API };
  }

  const parsed = resetUserPasswordSchema.safeParse({
    id: formData.get("id"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      error: "Periksa kembali password baru.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(parsed.data.id, {
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  await admin
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", parsed.data.id);

  revalidatePath("/settings/users");
  return {
    success: "Password direset. Pengguna wajib mengganti password saat login.",
  };
}
