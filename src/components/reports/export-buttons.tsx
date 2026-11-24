"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import { STATUS_LABELS, type ExpenseRequestWithRelations } from "@/types";

const HEADERS = [
  "Nomor",
  "Nama Pengajuan",
  "Kategori",
  "Pengaju",
  "Tanggal Pengajuan",
  "Tanggal Pencairan",
  "Status",
  "Nominal",
];

function toMatrix(rows: ExpenseRequestWithRelations[]) {
  return rows.map((row) => [
    row.request_number,
    row.title,
    row.category?.name ?? "-",
    row.creator?.full_name ?? "-",
    formatDate(row.submission_date),
    row.disbursement_date ? formatDate(row.disbursement_date) : "-",
    STATUS_LABELS[row.status],
    Number(row.amount),
  ]);
}

export function ExportButtons({
  rows,
}: {
  rows: ExpenseRequestWithRelations[];
}) {
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);

  async function exportExcel() {
    setBusy("excel");
    try {
      const XLSX = await import("xlsx");
      const data = rows.map((row) => ({
        Nomor: row.request_number,
        "Nama Pengajuan": row.title,
        Kategori: row.category?.name ?? "-",
        Pengaju: row.creator?.full_name ?? "-",
        "Tanggal Pengajuan": formatDate(row.submission_date),
        "Tanggal Pencairan": row.disbursement_date
          ? formatDate(row.disbursement_date)
          : "-",
        Status: STATUS_LABELS[row.status],
        Nominal: Number(row.amount),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data, {
        header: HEADERS.map((header) =>
          header === "Nominal" ? "Nominal" : header,
        ),
      });
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
      doc.text(`Jumlah pengajuan: ${rows.length}`, 14, 27);
      doc.text(`Total nominal: ${formatCurrency(total)}`, 14, 32);

      autoTable(doc, {
        startY: 38,
        head: [HEADERS],
        body: toMatrix(rows).map((row) =>
          row.map((cell, index) =>
            index === 7 ? formatCurrency(cell as number) : String(cell),
          ),
        ),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], fontSize: 8 },
        columnStyles: { 7: { halign: "right" } },
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
