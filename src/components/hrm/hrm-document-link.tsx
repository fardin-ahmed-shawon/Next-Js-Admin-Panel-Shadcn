"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchClient } from "@/lib/fetch-client";

export function HrmDocumentLink({ document }: { document: { id: number; title: string; file_type?: string | null } }) {
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(/\/$/, "");
      const response = await fetchClient(base + "/hrm/documents/" + document.id + "/download");
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to download this document.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = window.document.createElement("a");
      const extension = (document.file_type || "").replace(/[^a-zA-Z0-9]/g, "");
      link.href = url;
      link.download = (document.title.replace(/[<>:"/\\|?*]/g, "_") || "document") + (extension ? "." + extension : "");
      window.document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to download this document."); }
    finally { setBusy(false); }
  }
  return <button type="button" disabled={busy} onClick={download} className="ml-2 inline-flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50" aria-label={"Download " + document.title}>
    {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}{busy ? "Downloading…" : "Download"}
  </button>;
}
