import { Wallet } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Wallet className="size-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Promotion Tracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Dashboard internal pengajuan dana promosi
              </p>
            </div>
          </div>

          {!isSupabaseConfigured ? (
            <div className="mb-4 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-[#8a5310]">
              Supabase belum dikonfigurasi. Isi{" "}
              <code className="rounded bg-white/70 px-1 py-0.5 text-xs">
                .env.local
              </code>{" "}
              lalu jalankan migration sebelum login.
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
