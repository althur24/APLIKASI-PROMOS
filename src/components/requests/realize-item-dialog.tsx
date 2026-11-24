"use client";

import { ImageUp, Loader2 } from "lucide-react";
import { useState } from "react";

import { realizeItem } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import { toDateInputValue } from "@/lib/format";

export function RealizeItemDialog({
  itemId,
  itemName,
  className,
}: {
  itemId: string;
  itemName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { submit, pending, state } = useServerAction(realizeItem, () =>
    setOpen(false),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={className}>
          <ImageUp className="size-4" />
          Realisasi
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Realisasi Item</DialogTitle>
          <DialogDescription>
            Unggah foto realisasi untuk {itemName}.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="item_id" value={itemId} />
          {state?.error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor={`real_${itemId}`}>
              Tanggal Realisasi <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`real_${itemId}`}
              name="realized_date"
              type="date"
              defaultValue={toDateInputValue(new Date())}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`files_${itemId}`}>
              Foto Realisasi <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`files_${itemId}`}
              name="files"
              type="file"
              multiple
              accept="image/*,application/pdf"
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimal 1 foto. Maksimal 8 MB per file.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`realnotes_${itemId}`}>Catatan (opsional)</Label>
            <Textarea id={`realnotes_${itemId}`} name="notes" rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
