"use client";

import { KeyRound, Loader2, Pencil, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createUser,
  resetUserPassword,
  setUserActive,
  updateUser,
} from "@/actions/users";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useServerAction } from "@/hooks/use-server-action";
import { formatDate, initials } from "@/lib/format";
import { ROLE_LABELS, type Profile } from "@/types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, pending, state } = useServerAction(createUser, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Tambah Pengguna
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna</DialogTitle>
          <DialogDescription>
            Buat akun dengan password sementara. Pengguna akan diminta mengganti
            password saat login pertama.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nama Lengkap</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              aria-invalid={Boolean(state?.fieldErrors?.full_name)}
            />
            <FieldError message={state?.fieldErrors?.full_name?.[0]} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              aria-invalid={Boolean(state?.fieldErrors?.email)}
            />
            <FieldError message={state?.fieldErrors?.email?.[0]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password Sementara</Label>
              <Input
                id="password"
                name="password"
                type="text"
                required
                placeholder="Minimal 6 karakter"
                aria-invalid={Boolean(state?.fieldErrors?.password)}
              />
              <FieldError message={state?.fieldErrors?.password?.[0]} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" defaultValue="user">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
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
              Buat Akun
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(profile.is_active);
  const router = useRouter();
  const { submit, pending } = useServerAction(updateUser, () => {
    setOpen(false);
    router.refresh();
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setIsActive(profile.is_active);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label="Edit pengguna">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>{profile.email}</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="id" value={profile.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`full_name_${profile.id}`}>Nama Lengkap</Label>
            <Input
              id={`full_name_${profile.id}`}
              name="full_name"
              defaultValue={profile.full_name}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`role_${profile.id}`}>Role</Label>
              <Select
                id={`role_${profile.id}`}
                name="role"
                defaultValue={profile.role}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status Akun</Label>
              <div className="flex h-11 items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-muted-foreground">
                  {isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <input
                type="hidden"
                name="is_active"
                value={isActive ? "true" : "false"}
              />
            </div>
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
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResetPasswordDialog({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, pending, state } = useServerAction(resetUserPassword, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label="Reset password">
          <KeyRound className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Password baru untuk {profile.full_name}. Pengguna wajib menggantinya
            saat login.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="id" value={profile.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`password_${profile.id}`}>Password Baru</Label>
            <Input
              id={`password_${profile.id}`}
              name="password"
              type="text"
              required
              placeholder="Minimal 6 karakter"
            />
            <FieldError message={state?.fieldErrors?.password?.[0]} />
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
              Reset Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActiveToggle({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState(profile.is_active);

  function handleChange(next: boolean) {
    setChecked(next);
    const formData = new FormData();
    formData.set("id", profile.id);
    formData.set("is_active", String(next));
    startTransition(async () => {
      await setUserActive(formData);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isPending}
      />
      <span className="text-xs text-muted-foreground">
        {checked ? "Aktif" : "Nonaktif"}
      </span>
    </div>
  );
}

export function UserManagementTable({
  profiles,
  currentAdminId,
}: {
  profiles: Profile[];
  currentAdminId: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {profiles.length} pengguna terdaftar
        </p>
        <CreateUserDialog />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Pengguna</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {initials(profile.full_name)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {profile.full_name}
                        {profile.id === currentAdminId ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Anda)
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={profile.role === "admin" ? "default" : "secondary"}
                  >
                    {ROLE_LABELS[profile.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ActiveToggle profile={profile} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(profile.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditUserDialog profile={profile} />
                    <ResetPasswordDialog profile={profile} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
