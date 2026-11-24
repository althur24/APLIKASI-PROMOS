import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "primary" | "warning" | "success";
}

const toneStyles: Record<
  NonNullable<SummaryCardProps["tone"]>,
  { icon: string; value?: string }
> = {
  default: { icon: "bg-secondary text-muted-foreground" },
  primary: { icon: "bg-primary/10 text-primary" },
  warning: { icon: "bg-warning-soft text-[#a86414]" },
  success: { icon: "bg-success-soft text-[#0d7a4f]" },
};

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: SummaryCardProps) {
  const styles = toneStyles[tone];
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[13px] font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="break-words text-lg font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10",
            styles.icon,
          )}
        >
          <Icon className="size-4 sm:size-5" />
        </span>
      </div>
      {hint ? (
        <p className="mt-2 text-xs text-muted-foreground sm:mt-3">{hint}</p>
      ) : null}
    </Card>
  );
}
