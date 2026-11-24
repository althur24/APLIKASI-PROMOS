import { ActivityChanges } from "@/components/history/activity-changes";
import { getActivityConfig } from "@/components/shared/activity-config";
import { formatDateLong } from "@/lib/format";
import type { ActivityLog } from "@/types";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${formatDateLong(date)}, ${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada aktivitas tercatat.
      </p>
    );
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {logs.map((log) => {
        const config = getActivityConfig(log.action);
        const Icon = config.icon;
        return (
          <li key={log.id} className="relative">
            <span
              className={`absolute -left-[34px] flex size-6 items-center justify-center rounded-full ring-4 ring-card ${config.tone}`}
            >
              <Icon className="size-3.5" />
            </span>
            <p className="text-sm font-medium text-foreground">
              {log.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {log.actor?.full_name ?? "Sistem"} ·{" "}
              {formatDateTime(log.created_at)}
            </p>
            <ActivityChanges metadata={log.metadata} className="mt-2" />
          </li>
        );
      })}
    </ol>
  );
}
