# Promotion Tracker --- Development Plan

**Versi:** 2.0\
**Tanggal:** 24 November 2026\
**Status:** Ready for Development\
**Jenis:** Shared Internal Dashboard

------------------------------------------------------------------------

## 1. Ringkasan Produk

Promotion Tracker adalah dashboard internal bersama untuk mencatat dan
memantau pengajuan dana divisi promosi, mulai dari pengajuan ke Keuangan
sampai dana dicairkan.

Semua pengguna yang sudah memiliki akun dapat mengakses data dan fitur
operasional yang sama. Tidak ada pemisahan data per staff dan tidak ada
approval berjenjang.

Hanya ada satu jenis akun khusus, yaitu **Admin**, yang memiliki
tambahan hak untuk mengelola akun pengguna. Pengguna lainnya menggunakan
role **User**.

### Tujuan

-   Mencatat seluruh pengajuan dana promosi di satu tempat.
-   Memantau pengajuan yang sudah diserahkan ke Keuangan dan yang sudah
    cair.
-   Memudahkan seluruh tim melihat data yang sama.
-   Mengetahui siapa yang membuat atau mengubah suatu pengajuan.
-   Menyediakan dashboard, laporan, dan export data.
-   Menyediakan pengelolaan akun terpusat oleh Admin.

### Prinsip Produk

1.  Satu dashboard bersama untuk seluruh tim.
2.  Semua User dapat melihat dan mengelola seluruh pengajuan.
3.  Tidak ada approval atau verifikasi berjenjang.
4.  Status utama hanya **Sudah Diajukan** dan **Sudah Cair**.
5.  Admin hanya memiliki tambahan hak pengelolaan akun.
6.  Semua aktivitas penting memiliki jejak audit.
7.  UI/UX modern, minimalis, mudah digunakan, dan responsif.

------------------------------------------------------------------------

## 2. Ruang Lingkup MVP

### Termasuk

-   Login sederhana menggunakan email dan password.
-   Satu akun Admin awal.
-   Admin dapat menambah, mengedit, dan menonaktifkan akun User.
-   Semua User dapat melihat seluruh dashboard dan data.
-   Semua User dapat menambah, melihat, mengedit, dan menghapus
    pengajuan.
-   Dua status pengajuan.
-   Tanggal pengajuan dan tanggal pencairan.
-   Catatan dan lampiran opsional.
-   Pencarian, filter, sorting, dan pagination.
-   Dashboard ringkasan dan grafik.
-   Laporan berdasarkan periode, kategori, dan pengaju.
-   Export Excel dan PDF.
-   Pengelolaan kategori yang dapat diakses semua pengguna.
-   Activity log.
-   Realtime update untuk perubahan data penting.
-   Tampilan desktop, tablet, dan mobile.

### Tidak termasuk

-   Approval berjenjang.
-   Pembatasan data berdasarkan staff.
-   Integrasi langsung dengan sistem Keuangan.
-   Transfer atau pembayaran dana dari aplikasi.
-   Pencairan parsial.
-   Manajemen budget/limit anggaran.
-   Notifikasi WhatsApp.
-   Multi-divisi atau multi-perusahaan.

------------------------------------------------------------------------

## 3. Sistem Akun dan Hak Akses

### 3.1 Role

Hanya ada dua role:

  Role    Keterangan
  ------- --------------------------------------------------------------
  Admin   Mengakses semua fitur dan mengelola akun pengguna
  User    Mengakses semua fitur operasional dan seluruh data pengajuan

### 3.2 Matriks Hak Akses

  Fitur                              Admin   User
  --------------------------------- ------- ------
  Login dan logout                     ✓      ✓
  Melihat dashboard bersama            ✓      ✓
  Melihat semua pengajuan              ✓      ✓
  Membuat pengajuan                    ✓      ✓
  Mengedit semua pengajuan             ✓      ✓
  Mengubah status semua pengajuan      ✓      ✓
  Menghapus semua pengajuan            ✓      ✓
  Melihat laporan                      ✓      ✓
  Export Excel/PDF                     ✓      ✓
  Melihat activity log                 ✓      ✓
  Mengelola kategori                   ✓      ✓
  Menambah akun                        ✓      \-
  Mengedit akun pengguna               ✓      \-
  Menonaktifkan akun                   ✓      \-
  Mengubah role pengguna               ✓      \-

### 3.3 Aturan Akun

-   Tidak ada registrasi publik.
-   Aplikasi dimulai dengan satu akun Admin yang dibuat melalui proses
    setup/seed yang aman.
-   Admin membuat akun User dari menu Pengaturan.
-   Setiap orang menggunakan akun individual, bukan satu akun bersama.
-   Akun User yang dinonaktifkan tidak dapat login.
-   Admin tidak boleh menonaktifkan dirinya sendiri jika itu
    satu-satunya Admin aktif.
-   Perubahan role hanya dapat dilakukan Admin.
-   Pembuatan akun harus menggunakan Supabase Auth Admin API melalui
    server yang terlindungi. Service-role key tidak boleh dikirim ke
    browser.
-   Untuk MVP, Admin dapat membuat akun dengan email dan password
    sementara, lalu menyampaikan kredensial awal melalui cara yang aman.
    Jika tersedia, prioritaskan undangan email atau alur set-password.

**Penting:** dashboard dan data pengajuan bersifat bersama, tetapi akun
tetap individual agar identitas pembuat dan pengubah data dapat
diketahui.

------------------------------------------------------------------------

## 4. Struktur Navigasi

### Sidebar

**MAIN** - Dashboard - Semua Pengajuan - Tambah Pengajuan - Sudah
Diajukan - Sudah Cair

**REPORTS** - Laporan

**SYSTEM** - Pengaturan - Pengguna *(Admin saja)* - Kategori *(semua
pengguna)*

Semua pengguna melihat navigasi dan data operasional yang sama. Menu
Pengguna hanya terlihat oleh Admin.

------------------------------------------------------------------------

## 5. Flow Penggunaan Lengkap

### 5.1 Setup Awal

1.  Developer menyiapkan project dan database.
2.  Sistem menjalankan migration dan seed kategori awal.
3.  Satu akun Admin pertama dibuat melalui proses setup aman.
4.  Admin login.
5.  Admin membuka Pengaturan → Pengguna.
6.  Admin menambahkan akun untuk anggota tim.
7.  Anggota tim login menggunakan akun masing-masing.
8.  Semua pengguna masuk ke shared dashboard yang sama.

### 5.2 Login

1.  Pengguna membuka aplikasi.
2.  Sistem menampilkan halaman login.
3.  Pengguna memasukkan email dan password.
4.  Supabase Auth memvalidasi kredensial.
5.  Sistem memeriksa status akun dan role.
6.  Jika akun aktif dan valid, pengguna diarahkan ke Dashboard.
7.  Jika gagal, tampilkan pesan kesalahan yang jelas.

### 5.3 Membuat Pengajuan

1.  Pengguna memilih Tambah Pengajuan.
2.  Pengguna mengisi nama pengajuan, kategori, nominal, dan tanggal
    pengajuan.
3.  Pengguna dapat mengisi catatan dan mengunggah lampiran.
4.  Status awal otomatis **Sudah Diajukan**.
5.  Pengguna menekan Simpan.
6.  Sistem memvalidasi data dan membuat nomor pengajuan unik.
7.  Data tersimpan di database.
8.  Pengajuan langsung tampil di dashboard dan daftar seluruh pengguna.
9.  Pengguna melihat notifikasi sukses.

### 5.4 Mengubah Status Menjadi Sudah Cair

1.  Pengguna membuka detail pengajuan.
2.  Pengguna memilih Ubah Status.
3.  Pengguna memilih Sudah Cair.
4.  Sistem meminta tanggal pencairan.
5.  Pengguna mengisi tanggal pencairan dan catatan opsional.
6.  Sistem memvalidasi dan menyimpan perubahan.
7.  Activity log mencatat pengguna dan waktu perubahan.
8.  Dashboard, daftar Sudah Cair, dan laporan diperbarui.
9.  Perubahan dapat terlihat oleh pengguna lain melalui Supabase
    Realtime atau saat data dimuat ulang.

### 5.5 Mengedit dan Menghapus

Semua User dan Admin dapat mengedit atau menghapus pengajuan mana pun.

-   Edit: buka detail → Edit → ubah data → Simpan.
-   Hapus: pilih Hapus → konfirmasi → sistem melakukan soft delete.
-   Setiap perubahan dan penghapusan dicatat di activity log.
-   Penghapusan permanen hanya dilakukan melalui proses administrasi
    database, bukan tombol aplikasi.

### 5.6 Mengelola Pengguna

Khusus Admin:

1.  Buka Pengaturan → Pengguna.
2.  Pilih Tambah Pengguna.
3.  Isi nama, email, dan metode pemberian akses.
4.  Sistem membuat akun Supabase Auth dan profil role `user`.
5.  Pengguna baru dapat login.
6.  Admin dapat mengedit nama, mengubah role, atau menonaktifkan akun.

------------------------------------------------------------------------

## 6. Status dan Aturan Bisnis

Hanya ada dua status utama:

  -----------------------------------------------------------------------
  Label                   Nilai Database          Arti
  ----------------------- ----------------------- -----------------------
  Sudah Diajukan          `submitted`             Pengajuan telah
                                                  diserahkan ke Keuangan
                                                  dan belum dicatat cair

  Sudah Cair              `paid`                  Dana sudah
                                                  diterima/dicairkan
  -----------------------------------------------------------------------

### Aturan

-   Status default ketika pengajuan dibuat adalah `submitted`.
-   Saat status menjadi `paid`, tanggal pencairan wajib diisi.
-   Jika status dikembalikan ke `submitted`, tanggal pencairan harus
    dikosongkan pada data aktif dan perubahan sebelumnya tetap tersimpan
    di activity log.
-   Nominal wajib lebih besar dari nol.
-   Tanggal pencairan tidak boleh lebih awal dari tanggal pengajuan,
    kecuali koreksi historis yang dilakukan Admin.
-   Semua nominal disimpan sebagai `NUMERIC`, bukan teks berformat.
-   Kategori harus berasal dari kategori aktif.

### Perhitungan Dashboard

-   **Total Pengajuan:** jumlah semua pengajuan aktif.
-   **Total Nominal:** jumlah nominal semua pengajuan aktif.
-   **Belum Cair:** jumlah nominal dengan status `submitted`.
-   **Sudah Cair:** jumlah nominal dengan status `paid`.

Validasi agregat: `Total Nominal = Belum Cair + Sudah Cair`

Jumlah transaksi dan nominal Rupiah harus ditampilkan sebagai metrik
yang berbeda.

------------------------------------------------------------------------

## 7. Struktur Halaman dan UI/UX

### 7.1 Design Direction

Arah visual: **Modern Minimalist Finance Dashboard**.

Karakter: - Bersih, profesional, dan ringan. - Informasi mudah
dipindai. - Banyak whitespace. - Komponen konsisten. - Tidak terasa
seperti template admin panel generik. - Interaksi cepat dan minim
langkah.

### 7.2 Design Tokens

  Elemen              Nilai
  ------------------- ---------------
  Background          `#F8FAFC`
  Surface / Sidebar   `#FFFFFF`
  Primary             `#2563EB`
  Heading             `#172033`
  Secondary Text      `#64748B`
  Border              `#E8EDF3`
  Success             `#16A36A`
  Warning             `#E99A32`
  Font                Inter
  Border radius       12--16px
  Sidebar desktop     sekitar 240px
  Input height        44px
  Button height       40--44px
  Icons               Lucide React

Status: - Sudah Diajukan: badge oranye. - Sudah Cair: badge hijau.

Gunakan warna secara konsisten. Hindari gradient berlebihan, shadow
berat, dan dekorasi yang tidak memiliki fungsi.

### 7.3 App Shell

**Desktop** - Sidebar fixed di kiri, sekitar 240px. - Header di bagian
atas konten. - Konten utama fleksibel dengan batas lebar sekitar
1440px. - Search atau shortcut akses cepat dapat berada di header. -
Profil dan tombol logout berada di kanan atas.

**Mobile** - Sidebar menjadi drawer atau navigasi ringkas. - Dashboard
satu kolom. - Summary card menjadi grid dua kolom jika cukup. - Tabel
berubah menjadi list/card. - Form satu kolom. - Tombol tambah mudah
dijangkau. - Semua dialog dan tabel harus nyaman digunakan dengan layar
sentuh.

### 7.4 Dashboard Bersama

Dashboard yang sama ditampilkan untuk Admin dan User.

Header: - Sapaan menggunakan nama pengguna yang login. - Deskripsi
singkat. - Tombol **+ Tambah Pengajuan**.

Summary cards: 1. Total Pengajuan. 2. Total Nominal. 3. Belum Cair. 4.
Sudah Cair.

Analytics: - Grafik batang nominal pengajuan dan pencairan per bulan. -
Donut chart komposisi status. - Filter periode yang jelas.

Monitoring: - Tabel pengajuan terbaru. - Widget daftar pengajuan yang
belum cair. - Informasi berapa hari sejak tanggal pengajuan.

Semua angka dan daftar dihitung dari keseluruhan data bersama, bukan
hanya data pengguna yang login.

### 7.5 Semua Pengajuan

Toolbar: - Search berdasarkan nomor atau nama pengajuan. - Filter
status. - Filter kategori. - Filter tanggal/periode. - Filter pengaju. -
Reset filter.

Kolom: - Nomor. - Nama Pengajuan. - Kategori. - Pengaju. - Tanggal
Pengajuan. - Nominal. - Status. - Aksi.

UX: - Nominal rata kanan. - Format tanggal Indonesia. - Badge status
konsisten. - Hover state pada row. - Sorting dan pagination. - Mobile
menggunakan kartu ringkas.

### 7.6 Form Tambah/Edit

Gunakan dua kolom pada desktop dan satu kolom pada mobile.

Field: - Nama Pengajuan --- wajib. - Kategori --- wajib. - Nominal ---
wajib. - Tanggal Pengajuan --- wajib. - Status --- default Sudah
Diajukan. - Tanggal Pencairan --- wajib jika Sudah Cair. - Catatan ---
opsional. - Lampiran --- opsional. - Nama pengaju --- otomatis dari akun
login dan tidak dapat dipalsukan melalui input form.

UX: - Nominal otomatis diformat Rupiah. - Validasi dekat field
terkait. - Cegah double submit. - Konfirmasi jika pengguna meninggalkan
form yang belum disimpan. - Toast setelah berhasil. - Form edit
menampilkan nilai sebelumnya.

### 7.7 Detail Pengajuan

Tampilkan: - Nomor pengajuan. - Nama pengajuan. - Badge status. -
Nominal besar dan jelas. - Nama pengaju. - Kategori. - Tanggal
pengajuan. - Tanggal pencairan jika sudah cair. - Catatan. - Lampiran. -
Tombol Edit, Ubah Status, dan Hapus.

Bagian Riwayat Aktivitas: - Pengajuan dibuat. - Data diedit. - Status
berubah. - Tanggal pencairan dicatat. - Pengajuan dihapus/diarsipkan.

### 7.8 Halaman Status

-   Sudah Diajukan: daftar dengan filter status `submitted`.
-   Sudah Cair: daftar dengan filter status `paid`.

Gunakan komponen tabel yang sama agar konsisten dan mudah dirawat.

### 7.9 Laporan

Filter: - Periode tanggal. - Bulan dan tahun. - Kategori. - Status. -
Pengaju.

Ringkasan: - Jumlah pengajuan. - Total nominal. - Total belum cair. -
Total sudah cair.

Rekap: - Per kategori. - Per pengaju. - Per bulan. - Per status.

Export Excel dan PDF harus mengikuti filter aktif dan data yang dapat
diakses oleh pengguna.

### 7.10 Pengaturan

**Pengguna --- Admin saja** - Daftar pengguna. - Tambah pengguna. - Edit
nama dan email sesuai batasan Auth. - Ubah role. - Reset akses/password
melalui alur aman. - Aktif/nonaktif akun.

**Kategori --- semua pengguna** - Lihat kategori. - Tambah kategori. -
Edit kategori. - Nonaktifkan kategori. - Kategori yang sudah digunakan
tidak boleh dihapus permanen; gunakan status nonaktif.

------------------------------------------------------------------------

## 8. Data Model dan Database

Gunakan Supabase PostgreSQL.

### 8.1 `profiles`

  Kolom          Tipe          Keterangan
  -------------- ------------- ---------------------------------------
  `id`           UUID          Primary key, sama dengan Auth user ID
  `full_name`    TEXT          Nama pengguna
  `email`        TEXT          Email pengguna
  `role`         TEXT          `admin` atau `user`
  `is_active`    BOOLEAN       Status akun
  `created_at`   TIMESTAMPTZ   Waktu dibuat
  `updated_at`   TIMESTAMPTZ   Waktu diperbarui

### 8.2 `categories`

  Kolom          Tipe          Keterangan
  -------------- ------------- ------------------
  `id`           UUID          Primary key
  `name`         TEXT          Nama kategori
  `is_active`    BOOLEAN       Kategori aktif
  `created_by`   UUID          Pengguna pembuat
  `created_at`   TIMESTAMPTZ   Waktu dibuat

Kategori awal: - Digital Ads - Event & Sponsorship - Produksi Konten -
Operasional Marketing - Cetak & Merchandise - Transportasi - Lainnya

### 8.3 `expense_requests`

  Kolom                 Tipe            Keterangan
  --------------------- --------------- ------------------------------------
  `id`                  UUID            Primary key
  `request_number`      TEXT            Nomor unik, dibuat server/database
  `title`               TEXT            Nama pengajuan
  `category_id`         UUID            Relasi ke categories
  `amount`              NUMERIC(18,2)   Nominal Rupiah
  `submission_date`     DATE            Tanggal pengajuan
  `disbursement_date`   DATE            Tanggal pencairan, nullable
  `status`              TEXT            `submitted` atau `paid`
  `notes`               TEXT            Catatan opsional
  `created_by`          UUID            Relasi ke profiles
  `created_at`          TIMESTAMPTZ     Waktu dibuat
  `updated_at`          TIMESTAMPTZ     Waktu diperbarui
  `deleted_at`          TIMESTAMPTZ     Soft delete, nullable

### 8.4 `request_attachments`

  Kolom            Tipe          Keterangan
  ---------------- ------------- ----------------------------
  `id`             UUID          Primary key
  `request_id`     UUID          Relasi ke expense_requests
  `file_name`      TEXT          Nama file
  `storage_path`   TEXT          Path Supabase Storage
  `uploaded_by`    UUID          Pengunggah
  `created_at`     TIMESTAMPTZ   Waktu upload

Satu pengajuan dapat memiliki beberapa lampiran.

### 8.5 `activity_logs`

  Kolom           Tipe          Keterangan
  --------------- ------------- --------------------------------------
  `id`            UUID          Primary key
  `request_id`    UUID          Relasi ke expense_requests, nullable
  `actor_id`      UUID          Pengguna yang melakukan aksi
  `action`        TEXT          Jenis aktivitas
  `description`   TEXT          Ringkasan aktivitas
  `metadata`      JSONB         Detail perubahan
  `created_at`    TIMESTAMPTZ   Waktu aktivitas

Activity log bersifat append-only bagi pengguna aplikasi.

### 8.6 Relasi

``` text
auth.users
    |
    └── profiles
          |
          ├── expense_requests
          |      ├── categories
          |      ├── request_attachments
          |      └── activity_logs
          |
          └── activity_logs (actor)
```

### 8.7 Nomor Pengajuan

Format: `PR-YYYY-0001`

Contoh: - `PR-2026-0001` - `PR-2026-0002`

Nomor dibuat secara aman di database/server menggunakan sequence atau
mekanisme transaksional untuk mencegah duplikasi saat beberapa user
menyimpan bersamaan.

------------------------------------------------------------------------

## 9. Keamanan dan Validasi

### Authentication

-   Gunakan Supabase Auth.
-   Registrasi publik dinonaktifkan.
-   Admin pertama dibuat melalui proses setup aman.
-   Pembuatan akun tambahan dilakukan server-side menggunakan Supabase
    Auth Admin API.
-   Service-role key hanya berada di environment server.
-   Akun nonaktif tidak dapat mengakses aplikasi.

### Row Level Security

Karena dashboard bersifat bersama: - Semua pengguna aktif dapat membaca
semua pengajuan aktif. - Semua pengguna aktif dapat membuat pengajuan. -
Semua pengguna aktif dapat mengedit pengajuan mana pun. - Semua pengguna
aktif dapat menghapus secara soft delete. - Semua pengguna aktif dapat
membaca laporan dan activity log. - Semua pengguna aktif dapat mengelola
kategori. - Hanya Admin dapat membaca dan mengelola administrasi akun. -
Pengguna tidak dapat mengubah role dirinya sendiri. - `created_by` harus
diisi dari identitas Auth di server/database, bukan dipercaya dari input
browser. - Lampiran mengikuti akses pengajuan bersama. - Activity log
tidak dapat diedit atau dihapus oleh pengguna biasa.

### Validasi

-   Nama pengajuan wajib.
-   Kategori harus aktif.
-   Nominal lebih besar dari nol.
-   Tanggal pengajuan wajib.
-   Status hanya nilai yang diizinkan.
-   Tanggal pencairan wajib untuk status `paid`.
-   Tanggal pencairan tidak boleh sebelum tanggal pengajuan, kecuali
    koreksi historis oleh Admin.
-   Batasi tipe dan ukuran file.
-   Validasi dilakukan di frontend dan server/database.

------------------------------------------------------------------------

## 10. Realtime dan Konsistensi Data

Gunakan Supabase Realtime untuk memberi tahu pengguna lain ketika: -
Pengajuan baru dibuat. - Pengajuan diedit. - Status berubah. - Pengajuan
dihapus/diarsipkan. - Kategori berubah.

Perilaku: - Data yang berubah diperbarui di tabel dan ringkasan
dashboard. - Hindari mengandalkan angka yang hanya dihitung di
browser. - KPI dan laporan harus dihitung dari query database yang
konsisten. - Jika koneksi realtime terputus, aplikasi tetap harus dapat
memuat ulang data melalui query normal. - Tampilkan indikator
loading/error yang jelas ketika data belum berhasil dimuat.

------------------------------------------------------------------------

## 11. Tech Stack

  Area             Teknologi
  ---------------- -----------------------------------------
  Frontend         Next.js
  Language         TypeScript
  Styling          Tailwind CSS
  UI Components    shadcn/ui
  Icons            Lucide React
  Charts           Recharts
  Backend          Next.js Server Actions / Route Handlers
  Database         Supabase PostgreSQL
  Authentication   Supabase Auth
  Realtime         Supabase Realtime
  File Storage     Supabase Storage
  Validation       Zod
  Forms            React Hook Form
  Export Excel     XLSX library
  Export PDF       PDF library
  Hosting          Vercel

Tidak perlu microservices atau backend terpisah untuk kebutuhan MVP.

------------------------------------------------------------------------

## 12. Struktur Folder yang Disarankan

``` text
promotion-tracker/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── [id]/
│   │   │   ├── submitted/
│   │   │   ├── paid/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │       ├── users/
│   │   │       └── categories/
│   │   ├── api/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── requests/
│   │   ├── reports/
│   │   ├── users/
│   │   └── ui/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── validations/
│   │   ├── permissions/
│   │   └── utils/
│   ├── actions/
│   ├── hooks/
│   ├── types/
│   └── config/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.example
├── package.json
└── README.md
```

------------------------------------------------------------------------

## 13. Komponen UI Reusable

-   `AppSidebar`
-   `AppHeader`
-   `PageHeader`
-   `SummaryCard`
-   `StatusBadge`
-   `RequestTable`
-   `RequestCard`
-   `RequestFilters`
-   `RequestForm`
-   `RequestDetail`
-   `UpdateStatusDialog`
-   `DeleteConfirmDialog`
-   `AttachmentUploader`
-   `ActivityTimeline`
-   `ExpenseOverviewChart`
-   `StatusDonutChart`
-   `UserManagementTable`
-   `CategoryManagement`
-   `EmptyState`
-   `LoadingSkeleton`
-   `ToastProvider`

Gunakan komponen tabel yang sama untuk Semua Pengajuan, Sudah Diajukan,
dan Sudah Cair dengan filter awal berbeda.

------------------------------------------------------------------------

## 14. Tahapan Development

### Phase 1 --- Foundation

-   Setup Next.js dan TypeScript.
-   Setup Tailwind dan shadcn/ui.
-   Setup Supabase.
-   Buat migration database.
-   Implementasi Auth.
-   Buat akun Admin pertama melalui proses aman.
-   Implementasi role Admin/User dan RLS.
-   Buat layout utama dan responsive navigation.

**Output:** aplikasi dapat login dan semua pengguna aktif masuk ke
shared dashboard.

### Phase 2 --- Pengajuan

-   Buat form pengajuan.
-   Buat nomor pengajuan otomatis.
-   Implementasi create, read, update, dan soft delete.
-   Implementasi kategori.
-   Implementasi upload lampiran.
-   Implementasi detail pengajuan.
-   Implementasi activity log.

**Output:** semua pengguna dapat mengelola seluruh pengajuan.

### Phase 3 --- Dashboard dan Monitoring

-   Buat dashboard KPI bersama.
-   Buat grafik bulanan.
-   Buat daftar pengajuan terbaru.
-   Buat widget belum cair.
-   Buat halaman Semua Pengajuan.
-   Buat halaman Sudah Diajukan dan Sudah Cair.
-   Implementasi search, filter, sorting, dan pagination.

**Output:** semua pengguna melihat data dan ringkasan yang sama.

### Phase 4 --- Pencairan dan Realtime

-   Implementasi perubahan status.
-   Form tanggal pencairan.
-   Validasi status dan tanggal.
-   Pencatatan aktivitas.
-   Implementasi Supabase Realtime.
-   Pembaruan tabel dan KPI ketika data berubah.

**Output:** perubahan data dapat dipantau oleh seluruh pengguna.

### Phase 5 --- Laporan dan Pengaturan

-   Buat laporan berdasarkan periode.
-   Buat rekap kategori dan pengaju.
-   Implementasi export Excel dan PDF.
-   Buat halaman manajemen akun Admin.
-   Implementasi tambah, edit, dan nonaktifkan akun.
-   Buat halaman manajemen kategori.

**Output:** aplikasi memiliki laporan dan pengelolaan pengguna.

### Phase 6 --- QA dan Deployment

-   Uji login Admin dan User.
-   Uji hak akses RLS.
-   Uji semua operasi pengajuan dari beberapa akun.
-   Uji realtime pada beberapa browser/perangkat.
-   Uji validasi form.
-   Uji upload dan akses file.
-   Uji filter dan export.
-   Uji mobile dan desktop.
-   Deploy production.
-   Buat akun Admin awal dan panduan penggunaan.

**Output:** aplikasi siap digunakan bersama oleh tim.

------------------------------------------------------------------------

## 15. Acceptance Criteria

### Akun

-   [ ] Admin pertama dapat login.
-   [ ] Registrasi publik tidak tersedia.
-   [ ] Admin dapat membuat akun User.
-   [ ] Admin dapat menonaktifkan akun User.
-   [ ] User tidak dapat mengelola akun.
-   [ ] Semua akun aktif dapat mengakses dashboard bersama.

### Shared Dashboard

-   [ ] Semua akun melihat data pengajuan yang sama.
-   [ ] KPI menghitung keseluruhan data aktif.
-   [ ] Grafik dan tabel menampilkan data bersama.
-   [ ] Perubahan data dari satu akun terlihat oleh akun lain.
-   [ ] Dashboard tetap dapat memuat data jika realtime tidak tersedia.

### Pengajuan

-   [ ] Semua pengguna dapat membuat pengajuan.
-   [ ] Semua pengguna dapat melihat seluruh pengajuan.
-   [ ] Semua pengguna dapat mengedit pengajuan mana pun.
-   [ ] Semua pengguna dapat menghapus secara soft delete.
-   [ ] Nomor pengajuan otomatis dan unik.
-   [ ] Pengaju tercatat otomatis dari akun login.
-   [ ] Lampiran dan catatan bersifat opsional.

### Status dan Pencairan

-   [ ] Status hanya Sudah Diajukan dan Sudah Cair.
-   [ ] Tanggal pencairan wajib untuk status Sudah Cair.
-   [ ] Perubahan status masuk activity log.
-   [ ] KPI dan laporan diperbarui sesuai status.

### Laporan

-   [ ] Filter laporan bekerja.
-   [ ] Rekap membedakan jumlah transaksi dan nominal.
-   [ ] Export Excel dan PDF sesuai filter.
-   [ ] Data export sama dengan data yang ditampilkan.

### UI/UX

-   [ ] Tampilan konsisten di seluruh halaman.
-   [ ] Desktop, tablet, dan mobile dapat digunakan.
-   [ ] Tersedia loading, empty, error, dan success states.
-   [ ] Form memiliki validasi yang jelas.
-   [ ] Tabel nyaman dibaca dan memiliki pagination.
-   [ ] Tidak ada tombol atau menu yang tidak berfungsi.

------------------------------------------------------------------------

## 16. Keputusan Produk Final

1.  Aplikasi adalah shared internal dashboard.
2.  Semua pengguna aktif melihat data yang sama.
3.  Hanya ada dua role: Admin dan User.
4.  Admin pertama dibuat melalui setup awal.
5.  Admin dapat menambah dan menonaktifkan akun.
6.  Semua User dapat membuat, melihat, mengedit, dan menghapus
    pengajuan.
7.  Semua User dapat mengubah status pengajuan.
8.  Tidak ada approval atau verifikasi berjenjang.
9.  Status hanya Sudah Diajukan dan Sudah Cair.
10. Status awal otomatis Sudah Diajukan.
11. Tanggal pencairan wajib jika status Sudah Cair.
12. Nama pengaju diambil otomatis dari akun login.
13. Semua nominal menggunakan Rupiah.
14. Lampiran bersifat opsional.
15. Activity log mencatat siapa melakukan apa dan kapan.
16. Dashboard dan laporan menggunakan seluruh data bersama.
17. Realtime digunakan untuk memperbarui data lintas pengguna.
18. Hanya Admin yang dapat mengelola akun.
19. Kategori dapat dikelola semua pengguna.
20. UI/UX mengutamakan kesederhanaan, kecepatan input, dan monitoring.

------------------------------------------------------------------------

## 17. Definition of Done

MVP dinyatakan selesai jika Admin dapat membuat akun tim, seluruh
pengguna dapat login ke dashboard bersama, dan seluruh tim dapat
menyelesaikan alur:

**Login → Lihat Dashboard Bersama → Tambah Pengajuan → Semua Pengguna
Melihat Data → Ubah Status Menjadi Sudah Cair → Isi Tanggal Pencairan →
Dashboard dan Laporan Terbarui.**

Aplikasi harus sudah ter-deploy, RLS teruji, akun awal tersedia, dan
tampilan desktop maupun mobile berfungsi dengan baik.
