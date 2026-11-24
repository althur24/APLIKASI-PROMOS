import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { createClient } = await import("@supabase/supabase-js");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME || "Administrator";

  if (!url || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env.local",
    );
    process.exit(1);
  }

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL dan ADMIN_PASSWORD wajib diisi di .env.local untuk membuat Admin",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD minimal 8 karakter");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId: string | null = null;

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "admin",
        must_change_password: false,
        is_active: true,
      },
    });

  if (createError) {
    const alreadyExists = /already|registered|exists/i.test(
      createError.message,
    );

    if (!alreadyExists) {
      console.error("Gagal membuat Admin:", createError.message);
      process.exit(1);
    }

    const { data: list, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });

    if (listError) {
      console.error("Gagal mencari user:", listError.message);
      process.exit(1);
    }

    const existing = list.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!existing) {
      console.error("User dengan email tersebut sudah ada tetapi tidak ditemukan.");
      process.exit(1);
    }

    userId = existing.id;

    await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "admin",
        must_change_password: false,
        is_active: true,
      },
    });

    console.log("Akun sudah ada, password dan metadata diperbarui.");
  } else {
    userId = created.user?.id ?? null;
  }

  if (!userId) {
    console.error("Gagal menentukan user id Admin.");
    process.exit(1);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      role: "admin",
      is_active: true,
      must_change_password: false,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Gagal menyimpan profil Admin:", profileError.message);
    process.exit(1);
  }

  console.log("Admin siap digunakan:");
  console.log(`  Email : ${email}`);
  console.log(`  Role  : admin`);
  console.log("Silakan login melalui aplikasi.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
