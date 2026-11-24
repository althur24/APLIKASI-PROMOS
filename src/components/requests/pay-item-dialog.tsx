"use client";

import { BadgeCheck, Loader2 } from "lucide-react";
import { useState } from "react";

import { payItem } from "@/actions/requests";
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

export function PayItemDialog({
  itemId,
  itemName,
  submissionDate,
  className,
}: {
  itemId: string;
  itemName: string;
  submissionDate: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { submit, pending, state } = useServerAction(payItem, () =>
    setOpen(false),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={className}>
          <BadgeCheck className="size-4" />
          Sudah Cair
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tandai Item Sudah Cair</DialogTitle>
          <DialogDescription>{itemName}</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="item_id" value={itemId} />
          {state?.error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor={`disb_${itemId}`}>
              Tanggal Pencairan <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`disb_${itemId}`}
              name="disbursement_date"
              type="date"
              min={submissionDate || undefined}
              defaultValue={toDateInputValue(new Date())}
              required
              aria-invalid={Boolean(state?.fieldErrors?.disbursement_date)}
            />
            {state?.fieldErrors?.disbursement_date ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.disbursement_date[0]}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`paynotes_${itemId}`}>Catatan (opsional)</Label>
            <Textarea id={`paynotes_${itemId}`} name="notes" rows={2} />
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
