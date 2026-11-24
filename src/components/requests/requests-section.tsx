import { Inbox } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/requests/pagination";
import { RequestFilters } from "@/components/requests/request-filters";
import { RequestTable } from "@/components/requests/request-table";
import { Button } from "@/components/ui/button";
import type { PagedRequests } from "@/lib/data/requests";
import type { Profile, Project } from "@/types";

export function RequestsSection({
  data,
  projects,
  profiles,
  showStatus = true,
  emptyHint,
}: {
  data: PagedRequests;
  projects: Project[];
  profiles: Profile[];
  showStatus?: boolean;
  emptyHint?: string;
}) {
  return (
    <div className="space-y-4">
      <RequestFilters
        projects={projects}
        profiles={profiles}
        showStatus={showStatus}
        lockedStatus={!showStatus}
      />

      {data.rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada pengajuan"
          description={
            emptyHint ??
            "Pengajuan yang dibuat akan muncul di sini. Coba ubah filter atau buat pengajuan baru."
          }
          action={
            <Button asChild>
              <Link href="/requests/new">Tambah Pengajuan</Link>
            </Button>
          }
        />
      ) : (
        <>
          <RequestTable rows={data.rows} />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.count}
            pageSize={data.pageSize}
          />
        </>
      )}
    </div>
  );
}
