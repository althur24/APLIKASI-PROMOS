"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { ActionState } from "@/actions/types";

type ServerAction = (
  prev: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function useServerAction(
  action: ServerAction,
  onSuccess?: (state: ActionState) => void,
) {
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<ActionState>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setState(null);
    try {
      const result = await action(null, formData);
      if (result?.error) {
        setState(result);
        toast.error(result.error);
      } else if (result?.success) {
        setState(result);
        toast.success(result.success);
        onSuccess?.(result);
      }
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, state };
}
