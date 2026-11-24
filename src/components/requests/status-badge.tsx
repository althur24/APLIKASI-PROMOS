import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, ITEM_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const dotColor: Record<string, string> = {
  submitted: "bg-warning",
  partial: "bg-primary",
  paid: "bg-success",
  realized: "bg-[#7c3aed]",
};

function labelFor(status: string) {
  return (
    STATUS_LABELS[status as keyof typeof STATUS_LABELS] ??
    ITEM_STATUS_LABELS[status as keyof typeof ITEM_STATUS_LABELS] ??
    status
  );
}

function variantFor(status: string): "submitted" | "partial" | "paid" | "realized" {
  if (status === "partial") return "partial";
  if (status === "paid") return "paid";
  if (status === "realized") return "realized";
  return "submitted";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge variant={variantFor(status)} className={cn("gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full", dotColor[status] ?? "bg-muted-foreground")} />
      {labelFor(status)}
    </Badge>
  );
}
