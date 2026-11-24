# Promotion Tracker

Dashboard internal bersama untuk mencatat dan memantau pengajuan dana divisi promosi — dari pengajuan ke Keuangan sampai dana dicairkan.

Dokumen produk lengkap ada di [`Plan.md`](./Plan.md).

## Fitur

- Login email + password (tanpa registrasi publik), dua role: **Admin** dan **User**.
- Dashboard bersama: KPI, grafik bulanan, donut status, pengajuan terbaru, daftar belum cair.
- Jenis pengajuan: **Pengajuan** dan **Reimbursement**.
- Satu pengajuan berisi **banyak item** (nama, kategori, nominal); total otomatis.
- Master data **Proyek** (wajib dipilih; bisa dibuat cepat dari form, dikelola di Pengaturan).
- Pencairan **per item** dan realisasi **per item** (upload foto realisasi).
- Halaman **Proses Pencairan** & **Proses Realisasi** sebagai antrian item.
- Reimbursement: **wajib** upload foto struk per item, tanpa tahap realisasi.
- CRUD pengajuan (semua user), nomor otomatis `PR-YYYY-0001`, soft delete.
- Status item: Belum Cair → Sudah Cair → Sudah Realisasi; status pengajuan diturunkan otomatis (Belum Cair / Sebagian Cair / Sudah Cair / Sudah Realisasi).
- Lampiran (umum/struk/realisasi) via Supabase Storage, activity log per pengajuan.
- **Riwayat Aktivitas**: halaman audit global (siapa mengubah apa) dengan detail perubahan field-level (nilai lama → baru) + widget di dashboard.
- Pencarian, filter, sorting, pagination.
- Laporan per periode/kategori/pengaju + export Excel & PDF.
- Manajemen pengguna (Admin) dengan password sementara + wajib ganti password.
- Manajemen kategori (semua user).
- Realtime update antar pengguna.
- Responsif desktop, tablet, mobile.

## Tech Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · komponen shadcn-style di atas Radix UI · Supabase (Postgres, Auth, Storage, Realtime) · React Hook Form + Zod · Recharts · XLSX · jsPDF.

> Catatan Next.js 16: `middleware.ts` sudah diganti `proxy.ts` (export `proxy`). Semua `cookies()`, `headers()`, `params`, `searchParams` bersifat async.

## Struktur

```
src/
├── app/
│   ├── (auth)/login, change-password
│   ├── (dashboard)/dashboard, requests, submitted, paid, reports, settings
│   └── layout.tsx, page.tsx
├── actions/        # server actions (auth, requests, users, categories)
├── components/     # layout, dashboard, requests, reports, users, settings, ui
├── config/nav.ts
├── hooks/
├── lib/
│   ├── data/       # query server-side
│   ├── supabase/   # client, server, admin, env, types
│   ├── validations/
│   └── dal.ts, filters.ts, format.ts
└── proxy.ts
supabase/
├── migrations/     # schema, functions/triggers, RLS, storage
└── seed.sql        # 7 kategori awal
scripts/create-admin.ts
```

## Setup Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Buat project Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **Project Settings → API**, salin:
   - Project URL
   - `anon` public key
   - `service_role` secret key
3. Buka **Authentication → Providers → Email** dan **nonaktifkan** "Allow new users to sign up" (tidak ada registrasi publik).

### 3. Isi `.env.local`

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAIL=admin@perusahaan.com
ADMIN_PASSWORD=passwordAwalYangKuat
ADMIN_FULL_NAME=Administrator
```

> `SUPABASE_SERVICE_ROLE_KEY` hanya dipakai di server dan script. Jangan pernah diekspos ke browser atau di-commit.

### 4. Jalankan migration & seed

Opsi A — Supabase CLI (disarankan):

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npm run db:push
```

Lalu jalankan seed (satu kali) melalui **SQL Editor** di dashboard Supabase dengan isi `supabase/seed.sql`.

Opsi B — manual: jalankan file di `supabase/migrations/` berurutan, lalu `supabase/seed.sql`, melalui SQL Editor.

### 5. Buat Admin pertama

```bash
npm run create-admin
```

Script akan membuat user Auth + profil `role=admin` (atau memperbarui bila email sudah ada).

### 6. Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000, login dengan `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run create-admin` | Buat/refresh akun Admin pertama |
| `npm run db:push` | Push migration ke Supabase |
| `npm run db:reset` | Reset database lokal (jika pakai Supabase lokal) |

## Aturan Bisnis

- Status awal pengajuan otomatis `submitted`.
- Status `paid` wajib punya tanggal pencairan.
- Tanggal pencairan tidak boleh sebelum tanggal pengajuan.
- Nominal > 0, disimpan sebagai `NUMERIC(18,2)`.
- Nomor pengajuan dibuat di database via counter transaksional (`PR-YYYY-0001`).
- Pengaju (`created_by`) diambil dari sesi Auth, bukan input form.
- Hapus = soft delete (`deleted_at`); hard delete tidak tersedia di aplikasi.
- Activity log append-only (insert hanya lewat RPC `log_activity`).
- Admin tidak bisa menonaktifkan/menurunkan dirinya atau Admin aktif terakhir.
- Kategori yang dipakai cukup dinonaktifkan, tidak dihapus.

## Hak Akses (RLS)

- Semua user aktif: baca/tulis seluruh pengajuan, kategori, lampiran, activity log.
- Hanya Admin: kelola akun pengguna.
- Profil bisa dibaca semua user aktif (untuk menampilkan nama pengaju); update hanya Admin.
- Tabel counter nomor pengajuan tertutup dari API (tanpa policy).

> Pengaman tambahan: trigger `handle_new_user` membuat profil **nonaktif** kecuali pembuatan akun menyertakan metadata `is_active = true`. Akun yang dibuat lewat menu Admin selalu aktif; signup liar (jika toggle signup belum dimatikan) tidak akan punya akses data karena RLS mensyaratkan `is_active = true`.

## Deploy ke Vercel

1. Import repo ke Vercel.
2. Tambahkan environment variables yang sama seperti `.env.local` (termasuk `SUPABASE_SERVICE_ROLE_KEY` sebagai secret server).
3. Deploy. Migration di Supabase cukup dijalankan sekali dari lokal/CI.
