import type { Metadata } from "next";
import { ChevronRight, FolderKanban, Tags, UserCog, Users } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/dal";
import { ROLE_LABELS } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan - Promotion Tracker",
};

export default async function SettingsPage() {
  const profile = await requireUser();

  const items = [
    ...(profile.role === "admin"
      ? [
          {
            href: "/settings/users",
            title: "Pengguna",
            description: "Tambah, edit, reset password, dan nonaktifkan akun.",
            icon: Users,
          },
        ]
      : []),
    {
      href: "/settings/projects",
      title: "Proyek",
      description: "Master data proyek untuk pengajuan dan filter laporan.",
      icon: FolderKanban,
    },
    {
      href: "/settings/categories",
      title: "Kategori",
      description: "Kelola kategori item pengajuan yang dipakai seluruh tim.",
      icon: Tags,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pengaturan"
        description="Kelola akun dan kategori untuk dashboard bersama."
      />

      <Card>
        <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserCog className="size-6" />
          </span>
          <div>
            <p className="font-medium text-foreground">{profile.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
          <Badge className="ml-auto" variant="secondary">
            {ROLE_LABELS[profile.role]}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/40"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-5" />
                </span>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 font-medium text-foreground">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>

      {profile.role !== "admin" ? (
        <p className="text-xs text-muted-foreground">
          Pengelolaan akun pengguna hanya dapat dilakukan oleh Admin.
        </p>
      ) : null}
    </div>
  );
}
