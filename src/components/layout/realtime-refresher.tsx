"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function RealtimeRefresher() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();

    function scheduleRefresh() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.refresh();
      }, 600);
    }

    const channel = supabase
      .channel("promotion-tracker-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense_requests" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_logs" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense_request_items" },
        scheduleRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        scheduleRefresh,
      )
      .subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
