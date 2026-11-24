"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Profile, Project } from "@/types";

interface RequestFiltersProps {
  projects: Project[];
  profiles: Profile[];
  lockedStatus?: boolean;
  showStatus?: boolean;
  showPengaju?: boolean;
  hidePartial?: boolean;
}

export function RequestFilters({
  projects,
  profiles,
  lockedStatus = false,
  showStatus = true,
  showPengaju = true,
  hidePartial = false,
}: RequestFiltersProps) {
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
    ["q", "type", "project", "pengaju", "from", "to", "status"].includes(key),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
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

        <div className="space-y-1.5">
          <Label htmlFor="type">Jenis</Label>
          <Select
            id="type"
            value={searchParams.get("type") ?? ""}
            onChange={(event) => updateParam("type", event.target.value)}
          >
            <option value="">Semua jenis</option>
            <option value="pengajuan">Pengajuan</option>
            <option value="reimbursement">Reimbursement</option>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="project">Proyek</Label>
          <Select
            id="project"
            value={searchParams.get("project") ?? ""}
            onChange={(event) => updateParam("project", event.target.value)}
          >
            <option value="">Semua proyek</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>

        {showStatus && !lockedStatus ? (
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={searchParams.get("status") ?? ""}
              onChange={(event) => updateParam("status", event.target.value)}
            >
              <option value="">Semua status</option>
              <option value="submitted">Belum Cair</option>
              {!hidePartial ? (
                <option value="partial">Sebagian Cair</option>
              ) : null}
              <option value="paid">Sudah Cair</option>
              <option value="realized">Sudah Realisasi</option>
            </Select>
          </div>
        ) : null}

        {showPengaju ? (
          <div className="space-y-1.5">
            <Label htmlFor="pengaju">Pengaju</Label>
            <Select
              id="pengaju"
              value={searchParams.get("pengaju") ?? ""}
              onChange={(event) => updateParam("pengaju", event.target.value)}
            >
              <option value="">Semua pengaju</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="from">Dari Tanggal</Label>
          <Input
            id="from"
            type="date"
            value={searchParams.get("from") ?? ""}
            onChange={(event) => updateParam("from", event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="to">Sampai Tanggal</Label>
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
