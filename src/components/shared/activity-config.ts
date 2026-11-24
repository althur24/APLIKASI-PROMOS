import {
  Activity,
  FilePlus2,
  Paperclip,
  Pencil,
  RefreshCcw,
  Trash2,
  type LucideIcon,
} from "lucide-react";

export const ACTIVITY_CONFIG: Record<
  string,
  { icon: LucideIcon; tone: string }
> = {
  created: { icon: FilePlus2, tone: "bg-primary/10 text-primary" },
  updated: { icon: Pencil, tone: "bg-secondary text-muted-foreground" },
  status_changed: {
    icon: RefreshCcw,
    tone: "bg-warning-soft text-[#a86414]",
  },
  attachment_added: {
    icon: Paperclip,
    tone: "bg-secondary text-muted-foreground",
  },
  attachment_removed: {
    icon: Paperclip,
    tone: "bg-secondary text-muted-foreground",
  },
  deleted: { icon: Trash2, tone: "bg-destructive/10 text-destructive" },
};

export function getActivityConfig(action: string) {
  return (
    ACTIVITY_CONFIG[action] ?? {
      icon: Activity,
      tone: "bg-secondary text-muted-foreground",
    }
  );
}
