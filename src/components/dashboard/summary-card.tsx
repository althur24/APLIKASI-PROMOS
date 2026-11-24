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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            styles.icon,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {hint ? (
        <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}
