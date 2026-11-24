"use client";

import { useState } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RealtimeRefresher } from "@/components/layout/realtime-refresher";
import type { Profile } from "@/types";

export function DashboardShell({
  profile,
  children,
}: {
  profile: Pick<Profile, "full_name" | "email" | "role">;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <RealtimeRefresher />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-sidebar lg:block">
        <AppSidebar role={profile.role} />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-[#0b1220]/40 backdrop-blur-[1px]"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-border bg-sidebar shadow-xl">
            <AppSidebar
              role={profile.role}
              onNavigate={() => setDrawerOpen(false)}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col lg:pl-60">
        <AppHeader
          profile={profile}
          onMenuClick={() => setDrawerOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
