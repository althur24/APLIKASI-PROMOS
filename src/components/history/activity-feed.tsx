import { History } from "lucide-react";

import { ActivityItem } from "@/components/history/activity-item";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivityRow } from "@/lib/data/activity";
import { formatDateLong } from "@/lib/format";

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function dayLabel(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86_400_000,
  );

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  return formatDateLong(date);
}

export function ActivityFeed({ rows }: { rows: ActivityRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Belum ada riwayat"
        description="Perubahan pada pengajuan akan tercatat di sini beserta siapa yang melakukannya."
      />
    );
  }

  const groups: { key: string; label: string; items: ActivityRow[] }[] = [];

  for (const row of rows) {
    const key = dayKey(row.created_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(row);
    } else {
      groups.push({ key, label: dayLabel(row.created_at), items: [row] });
    }
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6">
        {groups.map((group) => (
          <section key={group.key}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h3>
            <ul className="divide-y divide-border">
              {group.items.map((activity) => (
                <li key={activity.id}>
                  <ActivityItem activity={activity} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
