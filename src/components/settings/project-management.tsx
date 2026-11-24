"use client";

import { Loader2, Pencil, Plus, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import {
  createProject,
  toggleProjectActive,
  updateProject,
} from "@/actions/projects";
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
import type { Project } from "@/types";

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, pending, state } = useServerAction(createProject, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Tambah Proyek
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Proyek</DialogTitle>
          <DialogDescription>
            Proyek dapat dipilih pada pengajuan baru.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Nama Proyek</Label>
            <Input id="project-name" name="name" required />
            {state?.fieldErrors?.name ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.name[0]}
              </p>
            ) : null}
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

function EditProjectDialog({ project }: { project: Project }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { submit, pending, state } = useServerAction(updateProject, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="iconSm" aria-label="Edit proyek">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Proyek</DialogTitle>
        </DialogHeader>
        <form action={submit} className="space-y-4">
          <input type="hidden" name="id" value={project.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`pname_${uid}`}>Nama Proyek</Label>
            <Input
              id={`pname_${uid}`}
              name="name"
              defaultValue={project.name}
              required
            />
            {state?.fieldErrors?.name ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.name[0]}
              </p>
            ) : null}
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

function ProjectActions({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-1">
      <EditProjectDialog project={project} />
      <form action={toggleProjectActive}>
        <input type="hidden" name="id" value={project.id} />
        <input
          type="hidden"
          name="is_active"
          value={project.is_active ? "false" : "true"}
        />
        <Button
          type="submit"
          variant="ghost"
          size="iconSm"
          aria-label={project.is_active ? "Nonaktifkan" : "Aktifkan"}
          className={project.is_active ? "text-destructive" : "text-success"}
        >
          <Power className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function ProjectManagement({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {projects.length} proyek
        </p>
        <CreateProjectDialog />
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Proyek</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge variant={project.is_active ? "paid" : "outline"}>
                    {project.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(project.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <ProjectActions project={project} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 break-words text-sm font-medium text-foreground">
                {project.name}
              </p>
              <Badge variant={project.is_active ? "paid" : "outline"}>
                {project.is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                Dibuat {formatDate(project.created_at)}
              </p>
              <ProjectActions project={project} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
