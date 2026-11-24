import { Badge } from "@/components/ui/badge";
import { REQUEST_TYPE_LABELS, type RequestType } from "@/types";
import { cn } from "@/lib/utils";

export function TypeBadge({
  type,
  className,
}: {
  type: RequestType;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        type === "reimbursement"
          ? "border-[#0891b2]/30 bg-[#ecfeff] text-[#0e7490]"
          : "border-border bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {REQUEST_TYPE_LABELS[type]}
    </Badge>
  );
}
