"use client";

import { LogOut, Menu, Plus, User as UserIcon } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";
import { ROLE_LABELS, type Profile } from "@/types";

export function AppHeader({
  profile,
  onMenuClick,
}: {
  profile: Pick<Profile, "full_name" | "email" | "role">;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Buka menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden flex-1 sm:block">
        <p className="text-sm text-muted-foreground">
          Selamat datang kembali,{" "}
          <span className="font-medium text-foreground">
            {profile.full_name}
          </span>
        </p>
      </div>
      <div className="flex-1 sm:hidden" />

      <Button asChild size="sm" className="h-9">
        <Link href="/requests/new">
          <Plus className="size-4" />
          <span className="hidden xs:inline sm:inline">Tambah</span>
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-1 transition-colors hover:bg-secondary sm:pr-3"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(profile.full_name)}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground sm:block">
              {profile.full_name}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {profile.full_name}
            </p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {profile.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <UserIcon className="size-4" />
            Role: {ROLE_LABELS[profile.role]}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              void signOut();
            }}
            className="text-destructive focus:bg-destructive/10 [&_svg]:text-destructive"
          >
            <LogOut className="size-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
