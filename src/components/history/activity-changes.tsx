import { cn } from "@/lib/utils";
import type { ActivityMetadata } from "@/types";

export function ActivityChanges({
  metadata,
  className,
}: {
  metadata: ActivityMetadata | null;
  className?: string;
}) {
  if (!metadata) return null;

  const changes = metadata.changes ?? [];
  const snapshot = metadata.snapshot ?? [];
  const files = metadata.files ?? [];

  if (changes.length === 0 && snapshot.length === 0 && files.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-2 space-y-1.5 rounded-lg bg-secondary/50 px-3 py-2",
        className,
      )}
    >
      {changes.length > 0 ? (
        <ul className="space-y-1">
          {changes.map((change) => (
            <li
              key={change.field}
              className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] leading-5"
            >
              <span className="text-muted-foreground">{change.label}</span>
              <span className="break-words text-muted-foreground line-through decoration-destructive/40">
                {change.from ?? "—"}
              </span>
              <span className="text-muted-foreground/70">→</span>
              <span className="break-words font-medium text-foreground">
                {change.to ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {snapshot.length > 0 ? (
        <dl className="grid gap-y-0.5">
          {snapshot.map((item) => (
            <div key={item.label} className="flex gap-1.5 text-[13px] leading-5">
              <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
              <dd className="min-w-0 break-words font-medium text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {files.map((file) => (
            <li
              key={file}
              className="max-w-full truncate rounded-md bg-card px-2 py-0.5 text-xs text-muted-foreground"
            >
              {file}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
