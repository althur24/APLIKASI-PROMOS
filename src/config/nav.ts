import {
  BadgeCheck,
  BarChart3,
  Clock,
  History,
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
      { title: "Sudah Diajukan", href: "/submitted", icon: Clock, exact: true },
      { title: "Sudah Cair", href: "/paid", icon: BadgeCheck, exact: true },
      { title: "Riwayat Aktivitas", href: "/history", icon: History, exact: true },
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
      { title: "Kategori", href: "/settings/categories", icon: Tags },
    ],
  },
];
