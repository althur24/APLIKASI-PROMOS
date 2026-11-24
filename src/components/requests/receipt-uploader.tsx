"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { uploadAttachments } from "@/actions/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";

export function ReceiptUploader({
  requestId,
  itemId,
}: {
  requestId: string;
  itemId: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { submit, pending, state } = useServerAction(uploadAttachments, () => {
    formRef.current?.reset();
    router.refresh();
  });

  return (
    <form
      ref={formRef}
      action={submit}
      className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-border bg-secondary/30 p-2.5 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="purpose" value="receipt" />
      <Input
        name="files"
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="h-auto flex-1 cursor-pointer border-0 bg-transparent p-0 text-xs shadow-none file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-primary-foreground"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Upload struk
      </Button>
      {state?.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
