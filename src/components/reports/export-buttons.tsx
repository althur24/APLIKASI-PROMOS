"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ReportItemRow } from "@/lib/data/requests";
import { REQUEST_TYPE_LABELS } from "@/types";

const HEADERS = [
  "Nomor",
  "Pengajuan",
  "Jenis",
  "Proyek",
  "Item",
  "Kategori",
  "Pengaju",
  "Tgl Pengajuan",
  "Tgl Cair",
  "Tgl Realisasi",
  "Status",
  "Nominal",
];

function toMatrix(rows: ReportItemRow[]) {
  return rows.map((row) => [
    row.request_number,
    row.request_title,
    REQUEST_TYPE_LABELS[row.type] ?? row.type,
    row.project ?? "-",
    row.item_name,
    row.category ?? "-",
    row.creator ?? "-",
    formatDate(row.submission_date),
    row.disbursement_date ? formatDate(row.disbursement_date) : "-",
    row.realized_date ? formatDate(row.realized_date) : "-",
    row.status_label,
    Number(row.amount),
  ]);
}

export function ExportButtons({ rows }: { rows: ReportItemRow[] }) {
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);

  async function exportExcel() {
    setBusy("excel");
    try {
      const XLSX = await import("xlsx");
      const data = rows.map((row) => ({
        Nomor: row.request_number,
        Pengajuan: row.request_title,
        Jenis: REQUEST_TYPE_LABELS[row.type] ?? row.type,
        Proyek: row.project ?? "-",
        Item: row.item_name,
        Kategori: row.category ?? "-",
        Pengaju: row.creator ?? "-",
        "Tgl Pengajuan": formatDate(row.submission_date),
        "Tgl Cair": row.disbursement_date
          ? formatDate(row.disbursement_date)
          : "-",
        "Tgl Realisasi": row.realized_date
          ? formatDate(row.realized_date)
          : "-",
        Status: row.status_label,
        Nominal: Number(row.amount),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data, { header: HEADERS });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
      XLSX.writeFile(
        workbook,
        `laporan-pengajuan-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } finally {
      setBusy(null);
    }
  }

  async function exportPdf() {
    setBusy("pdf");
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text("Laporan Pengajuan Dana Promosi", 14, 16);
      doc.setFontSize(9);
      doc.text(`Dibuat: ${formatDate(new Date())}`, 14, 22);

      const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);
      doc.text(`Jumlah item: ${rows.length}`, 14, 27);
      doc.text(`Total nominal: ${formatCurrency(total)}`, 14, 32);

      autoTable(doc, {
        startY: 38,
        head: [HEADERS],
        body: toMatrix(rows).map((row) =>
          row.map((cell, index) =>
            index === 11 ? formatCurrency(cell as number) : String(cell),
          ),
        ),
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [37, 99, 235], fontSize: 7 },
        columnStyles: { 11: { halign: "right" } },
      });

      doc.save(`laporan-pengajuan-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportExcel}
        disabled={busy !== null || rows.length === 0}
      >
        <FileSpreadsheet className="size-4" />
        {busy === "excel" ? "Menyiapkan..." : "Export Excel"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportPdf}
        disabled={busy !== null || rows.length === 0}
      >
        <FileText className="size-4" />
        {busy === "pdf" ? "Menyiapkan..." : "Export PDF"}
      </Button>
    </div>
  );
}
