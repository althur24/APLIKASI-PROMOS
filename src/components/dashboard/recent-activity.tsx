import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowRight, History } from "lucide-react";
import Link from "next/link";

import { getActivityConfig } from "@/components/shared/activity-config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityRow } from "@/lib/data/activity";
import { ACTIVITY_ACTION_PHRASES } from "@/types";
import { cn } from "@/lib/utils";

export function RecentActivity({ rows }: { rows: ActivityRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          Aktivitas Terbaru
        </CardTitle>
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Lihat semua
          <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada aktivitas.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((activity) => {
              const config = getActivityConfig(activity.action);
              const Icon = config.icon;
              const phrase =
                ACTIVITY_ACTION_PHRASES[activity.action] ?? "melakukan perubahan";
              return (
                <li
                  key={activity.id}
                  className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                      config.tone,
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-sm leading-5 text-foreground">
                        <span className="font-medium">
                          {activity.actor?.full_name ?? "Sistem"}
                        </span>{" "}
                        <span className="text-muted-foreground">{phrase}</span>
                      </p>
                      <span className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                    </div>
                    {activity.request ? (
                      <Link
                        href={`/requests/${activity.request.id}`}
                        className="mt-0.5 block truncate text-xs text-muted-foreground hover:text-primary"
                      >
                        <span className="font-mono">
                          {activity.request.request_number}
                        </span>{" "}
                        · {activity.request.title}
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
