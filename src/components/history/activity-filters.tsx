"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ACTIVITY_ACTION_LABELS, type Profile } from "@/types";

const ACTION_OPTIONS = Object.entries(ACTIVITY_ACTION_LABELS);

export function ActivityFilters({
  profiles,
}: {
  profiles: Pick<Profile, "id" | "full_name">[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("q") ?? "";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") params.delete(key);
    else params.set(key, value);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam("q", value);
    }, 400);
  }

  const hasFilters = Array.from(searchParams.keys()).some((key) =>
    ["q", "actor", "action", "from", "to"].includes(key),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="q">Cari</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              key={searchValue}
              defaultValue={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Nomor atau nama pengajuan"
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5 lg:col-span-3">
          <Label htmlFor="actor">Pengguna</Label>
          <Select
            id="actor"
            value={searchParams.get("actor") ?? ""}
            onChange={(event) => updateParam("actor", event.target.value)}
          >
            <option value="">Semua pengguna</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="action">Jenis</Label>
          <Select
            id="action"
            value={searchParams.get("action") ?? ""}
            onChange={(event) => updateParam("action", event.target.value)}
          >
            <option value="">Semua jenis</option>
            {ACTION_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="from">Dari</Label>
          <Input
            id="from"
            type="date"
            value={searchParams.get("from") ?? ""}
            onChange={(event) => updateParam("from", event.target.value)}
          />
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="to">Sampai</Label>
          <Input
            id="to"
            type="date"
            value={searchParams.get("to") ?? ""}
            onChange={(event) => updateParam("to", event.target.value)}
          />
        </div>
      </div>

      {hasFilters ? (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.replace(pathname)}
          >
            <X className="size-4" />
            Reset filter
          </Button>
        </div>
      ) : null}
    </div>
  );
}
