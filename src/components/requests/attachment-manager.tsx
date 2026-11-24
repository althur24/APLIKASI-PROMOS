"use client";

import { Download, FileText, Loader2, Paperclip, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { deleteAttachment, uploadAttachments } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import type { RequestAttachmentWithUrl } from "@/lib/data/requests";

function formatFileSize(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentManager({
  requestId,
  attachments,
}: {
  requestId: string;
  attachments: RequestAttachmentWithUrl[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, state } = useServerAction(uploadAttachments, () => {
    formRef.current?.reset();
    router.refresh();
  });

  return (
    <div className="space-y-3">
      <form ref={formRef} action={submit} className="space-y-3">
        <input type="hidden" name="request_id" value={requestId} />
        <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-3">
          <Input
            name="files"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.doc,.docx"
            className="h-auto cursor-pointer border-0 bg-transparent p-0 shadow-none file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-[#1d4ed8]"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            PDF, gambar, Excel, atau Word. Maksimal 8 MB per file.
          </p>
        </div>
        {state?.error ? (
          <p className="text-xs text-destructive">{state.error}</p>
        ) : null}
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Unggah Lampiran
        </Button>
      </form>

      {attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.file_size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {attachment.signedUrl ? (
                  <Button variant="ghost" size="iconSm" asChild>
                    <a
                      href={attachment.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Unduh lampiran"
                    >
                      <Download className="size-4" />
                    </a>
                  </Button>
                ) : null}
                <form action={deleteAttachment}>
                  <input type="hidden" name="id" value={attachment.id} />
                  <input type="hidden" name="request_id" value={requestId} />
                  <input
                    type="hidden"
                    name="storage_path"
                    value={attachment.storage_path}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="iconSm"
                    className="text-destructive hover:bg-destructive/10"
                    aria-label="Hapus lampiran"
                  >
                    <X className="size-4" />
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Paperclip className="size-4" />
          Belum ada lampiran.
        </p>
      )}
    </div>
  );
}
