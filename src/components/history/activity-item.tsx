import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";

import { ActivityChanges } from "@/components/history/activity-changes";
import { getActivityConfig } from "@/components/shared/activity-config";
import type { ActivityRow } from "@/lib/data/activity";
import { formatDateLong } from "@/lib/format";
import { ACTIVITY_ACTION_PHRASES } from "@/types";
import { cn } from "@/lib/utils";

function absoluteTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${formatDateLong(date)}, ${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function relativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: localeId });
}

export function ActivityItem({ activity }: { activity: ActivityRow }) {
  const config = getActivityConfig(activity.action);
  const Icon = config.icon;
  const phrase = ACTIVITY_ACTION_PHRASES[activity.action] ?? "melakukan perubahan";

  return (
    <div className="flex items-start gap-3 py-3.5">
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
          config.tone,
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm leading-5 text-foreground">
            <span className="font-medium">
              {activity.actor?.full_name ?? "Sistem"}
            </span>{" "}
            <span className="text-muted-foreground">{phrase}</span>
          </p>
          <time
            className="shrink-0 whitespace-nowrap pt-0.5 text-xs text-muted-foreground"
            title={absoluteTime(activity.created_at)}
          >
            {relativeTime(activity.created_at)}
          </time>
        </div>

        {activity.request ? (
          <Link
            href={`/requests/${activity.request.id}`}
            className="mt-0.5 flex min-w-0 items-baseline gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <span className="shrink-0 font-mono">
              {activity.request.request_number}
            </span>
            <span className="truncate">· {activity.request.title}</span>
          </Link>
        ) : activity.metadata?.request_number ? (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {activity.metadata.request_number}
          </p>
        ) : null}

        <ActivityChanges metadata={activity.metadata} />
      </div>
    </div>
  );
}
