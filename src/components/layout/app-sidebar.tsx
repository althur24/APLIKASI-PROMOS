"use client";

import { Wallet, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_SECTIONS } from "@/config/nav";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

interface AppSidebarProps {
  role: UserRole;
  onNavigate?: () => void;
  onClose?: () => void;
}

function isItemActive(pathname: string, href: string, exact?: boolean) {
  if (pathname === href) return true;
  if (exact) return false;
  return pathname.startsWith(`${href}/`);
}

export function AppSidebar({ role, onNavigate, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center justify-between px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">
              Promotion
            </span>
            <span className="text-sm font-semibold text-foreground">
              Tracker
            </span>
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter(
            (item) => !item.adminOnly || role === "admin",
          );
          if (items.length === 0) return null;

          return (
            <div key={section.label} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground/70">
                {section.label}
              </p>
              {items.map((item) => {
                const active = isItemActive(
                  pathname,
                  item.href,
                  item.exact,
                );
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-active text-sidebar-active-foreground"
                        : "text-sidebar-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4.5 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Dashboard bersama untuk tim promosi. Semua data tampil untuk seluruh
          pengguna aktif.
        </p>
      </div>
    </div>
  );
}
