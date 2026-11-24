"use client";

import { Loader2, Pencil, Plus, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import {
  createCategory,
  toggleCategoryActive,
  updateCategory,
} from "@/actions/categories";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useServerAction } from "@/hooks/use-server-action";
import { formatDate } from "@/lib/format";
import type { Category } from "@/types";

function CreateCategoryDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, pending, state } = useServerAction(createCategory, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kategori</DialogTitle>
          <DialogDescription>
            Kategori baru langsung dapat dipakai pada pengajuan.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Kategori</Label>
            <Input
              id="name"
              name="name"
              required
              aria-invalid={Boolean(state?.fieldErrors?.name)}
            />
            {state?.fieldErrors?.name ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.name[0]}
              </p>
            ) : null}
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

function EditCategoryDialog({ category }: { category: Category }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, pending, state } = useServerAction(updateCategory, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label="Edit kategori">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kategori</DialogTitle>
          <DialogDescription>Ubah nama kategori.</DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="id" value={category.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`name_${uid}`}>Nama Kategori</Label>
            <Input
              id={`name_${uid}`}
              name="name"
              defaultValue={category.name}
              required
            />
            {state?.fieldErrors?.name ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.name[0]}
              </p>
            ) : null}
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

function CategoryActions({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-1">
      <EditCategoryDialog category={category} />
      <form action={toggleCategoryActive}>
        <input type="hidden" name="id" value={category.id} />
        <input
          type="hidden"
          name="is_active"
          value={category.is_active ? "false" : "true"}
        />
        <Button
          type="submit"
          variant="ghost"
          size="iconSm"
          aria-label={category.is_active ? "Nonaktifkan" : "Aktifkan"}
          className={
            category.is_active ? "text-destructive" : "text-success"
          }
        >
          <Power className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function CategoryManagement({ categories }: { categories: Category[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {categories.length} kategori
        </p>
        <CreateCategoryDialog />
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant={category.is_active ? "paid" : "outline"}>
                    {category.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(category.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <CategoryActions category={category} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 break-words text-sm font-medium text-foreground">
                {category.name}
              </p>
              <Badge variant={category.is_active ? "paid" : "outline"}>
                {category.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                Dibuat {formatDate(category.created_at)}
              </p>
              <CategoryActions category={category} />
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Kategori yang sudah dipakai tidak dihapus permanen, cukup dinonaktifkan.
      </p>
    </div>
  );
}
