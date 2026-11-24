"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { changePassword } from "@/actions/auth";
import type { ActionState } from "@/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    changePassword,
    null,
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
        Untuk keamanan, ganti password sementara Anda sebelum melanjutkan.
      </div>

      {state?.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="password">Password baru</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          required
          aria-invalid={Boolean(state?.fieldErrors?.password)}
        />
        {state?.fieldErrors?.password ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Konfirmasi password baru</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi password baru"
          required
          aria-invalid={Boolean(state?.fieldErrors?.confirm)}
        />
        {state?.fieldErrors?.confirm ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.confirm[0]}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <KeyRound className="size-4" />
        )}
        {pending ? "Menyimpan..." : "Simpan password"}
      </Button>
    </form>
  );
}
