"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProcessingSearch({
  placeholder = "Cari nomor pengajuan, nama pengajuan, atau item",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("q") ?? "";
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 400);
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          key={searchValue}
          defaultValue={searchValue}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {searchValue ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.replace(pathname)}
        >
          <X className="size-4" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}
