"use client";

import { useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { hasExcelExportAccess } from "@/hooks/useRoles";
import { fetchClient } from "@/lib/fetch-client";

export type ExcelData = { headers: string[]; rows: (string | number | boolean | null | undefined)[][] };

export function ExcelExportButton({ module, title, getData, label, tableIndex = 0 }: {
  module: "orders" | "crm";
  title: string;
  getData?: () => ExcelData;
  label?: string;
  tableIndex?: number;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  if (!hasExcelExportAccess(user, module)) return null;

  const exportExcel = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let data: ExcelData;
      if (getData) {
        data = getData();
      } else {
        const container = button.current?.closest('[data-slot="card"]') || button.current?.parentElement?.parentElement;
        const table = container?.querySelectorAll("table")[tableIndex];
        if (!table) throw new Error("Table is not available to export.");
        const headers = Array.from(table.querySelectorAll("thead th"));
        const indices = headers.map((cell, index) => ({ text: cell.textContent?.trim() || "", index }))
          .filter(({ text }) => text && !/^(actions?|select)$/i.test(text));
        data = {
          headers: indices.map(({ text }) => text),
          rows: Array.from(table.querySelectorAll("tbody tr"))
            .filter(row => row.querySelectorAll("td").length === headers.length)
            .map(row => indices.map(({ index }) => {
              const cell = row.querySelectorAll("td")[index].cloneNode(true) as HTMLElement;
              cell.querySelectorAll("svg, .sr-only, [aria-hidden=true]").forEach(node => node.remove());
              return cell.textContent?.replace(/\s+/g, " ").trim() || "";
            })),
        };
      }
      if (!data.rows.length) throw new Error("No records to export.");
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const response = await fetchClient(`${base}exports/${module}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, ...data }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(Object.values(error.errors || {}).flat().join(" ") || error.message || "Excel export failed.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Exported ${data.rows.length} records to Excel.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Excel export failed.");
    } finally {
      setBusy(false);
    }
  };
  return <Button ref={button} variant="outline" size="sm" onClick={exportExcel} disabled={busy}>
    {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
    {label || (getData ? "Export Excel" : "Export Excel (page)")}
  </Button>;
}
