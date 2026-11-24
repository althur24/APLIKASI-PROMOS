import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type RequestStatus } from "@/types";
import { cn } from "@/lib/utils";

const dotColor: Record<RequestStatus, string> = {
  submitted: "bg-warning",
  paid: "bg-success",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  return (
    <Badge variant={status} className={cn("gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full", dotColor[status])} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
