import {
  BadgeCheck,
  Banknote,
  CheckCheck,
  BarChart3,
  Clock,
  FolderKanban,
  History,
  ImageUp,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "MAIN",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { title: "Semua Pengajuan", href: "/requests", icon: ListChecks, exact: true },
      { title: "Tambah Pengajuan", href: "/requests/new", icon: PlusCircle, exact: true },
      { title: "Belum Cair", href: "/submitted", icon: Clock, exact: true },
      { title: "Sudah Cair", href: "/paid", icon: BadgeCheck, exact: true },
      { title: "Sudah Realisasi", href: "/realized", icon: CheckCheck, exact: true },
      { title: "Riwayat Aktivitas", href: "/history", icon: History, exact: true },
    ],
  },
  {
    label: "PROSES",
    items: [
      { title: "Proses Pencairan", href: "/disbursement", icon: Banknote, exact: true },
      { title: "Proses Realisasi", href: "/realization", icon: ImageUp, exact: true },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { title: "Laporan", href: "/reports", icon: BarChart3, exact: true },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Pengaturan", href: "/settings", icon: Settings, exact: true },
      {
        title: "Pengguna",
        href: "/settings/users",
        icon: Users,
        adminOnly: true,
      },
      { title: "Proyek", href: "/settings/projects", icon: FolderKanban },
      { title: "Kategori", href: "/settings/categories", icon: Tags },
    ],
  },
];
