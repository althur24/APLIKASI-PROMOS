"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { softDeleteRequest } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteRequestButton({
  id,
  requestNumber,
  label = "Hapus",
  variant = "destructive",
  size = "sm",
  className,
}: {
  id: string;
  requestNumber: string;
  label?: string;
  variant?: "destructive" | "outline" | "ghost";
  size?: "sm" | "default";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Trash2 className="size-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arsipkan pengajuan?</DialogTitle>
          <DialogDescription>
            Pengajuan {requestNumber} akan dihapus dari daftar aktif (soft
            delete). Tindakan ini tercatat di activity log.
          </DialogDescription>
        </DialogHeader>
        <form action={softDeleteRequest}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              <Trash2 className="size-4" />
              Arsipkan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
