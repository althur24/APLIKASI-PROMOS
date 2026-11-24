"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

import { updateRequestStatus } from "@/actions/requests";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import type { RequestStatus } from "@/types";

export function UpdateStatusDialog({
  requestId,
  status,
  disbursementDate,
  notes,
}: {
  requestId: string;
  status: RequestStatus;
  disbursementDate: string | null;
  notes: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(status);
  const { submit, pending, state } = useServerAction(updateRequestStatus, () =>
    setOpen(false),
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setSelectedStatus(status);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCircle2 className="size-4" />
          Ubah Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Status Pengajuan</DialogTitle>
          <DialogDescription>
            Perubahan status dan tanggal pencairan dicatat di activity log.
          </DialogDescription>
        </DialogHeader>

        <form action={submit} className="space-y-4">
          <input type="hidden" name="id" value={requestId} />

          {state?.error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as RequestStatus)
              }
            >
              <option value="submitted">Sudah Diajukan</option>
              <option value="paid">Sudah Cair</option>
            </Select>
          </div>

          {selectedStatus === "paid" ? (
            <div className="space-y-1.5">
              <Label htmlFor="disbursement_date">
                Tanggal Pencairan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="disbursement_date"
                name="disbursement_date"
                type="date"
                defaultValue={disbursementDate ?? ""}
                aria-invalid={Boolean(state?.fieldErrors?.disbursement_date)}
              />
              {state?.fieldErrors?.disbursement_date ? (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.disbursement_date[0]}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={notes ?? ""}
              placeholder="Catatan tambahan untuk perubahan ini"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
