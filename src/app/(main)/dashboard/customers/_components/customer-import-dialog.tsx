"use client";

import { useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { importCustomers } from "@/hooks/useCustomers";

export function CustomerImportDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const template = () => {
    const headers = [
      "full_name",
      "phone",
      "email",
      "gender",
      "address",
      "city",
      "district",
      "division",
      "customer_type",
      "tags",
      "admin_notes",
      "last_contacted_at",
      "status",
    ];
    const sample = [
      "Example Customer",
      "01700000000",
      "",
      "unknown",
      "House 12, Road 5",
      "Inside Dhaka",
      "Dhaka",
      "Dhaka",
      "Retail",
      JSON.stringify(["new", "retail"]),
      "Imported customer",
      "2026-10-12 10:30:00",
      "active",
    ];
    const csv =
      headers.join(",") + "\r\n" + sample.map((value) => '"' + value.replaceAll('"', '""') + '"').join(",") + "\r\n";
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "customers-template.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const submit = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await importCustomers(file);
      toast.success(result.message);
      setFile(null);
      onOpenChange(false);
      onImported();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          onOpenChange(value);
          if (!value) {
            setFile(null);
            setError("");
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import customers from CSV</DialogTitle>
          <DialogDescription>Add up to 1,000 customers per upload. Maximum file size: 2 MB.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <Button variant="outline" onClick={template}>
            <Download className="size-4" />
            Download CSV template
          </Button>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-muted-foreground">
            <p>
              Use the template headers. Full name and phone are required. Replace the example row with your customers.
            </p>
            <p>
              Keep phone numbers as text to preserve leading zeros. Tags use a JSON array, for example{" "}
              <code className="text-xs">["VIP","repeat"]</code>.
            </p>
            <p>
              Last contacted format: <code className="text-xs">YYYY-MM-DD HH:mm:ss</code> (Dhaka time). Status: active
              or inactive.
            </p>
            <p>
              Existing phone numbers or emails are rejected. If any row is invalid, nothing is imported; correct the
              listed rows and retry.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-csv">CSV file</Label>
            <Input
              id="customer-csv"
              type="file"
              accept=".csv,text/csv"
              disabled={busy}
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setError("");
              }}
            />
          </div>
          {error && (
            <div
              role="alert"
              className="max-h-48 overflow-y-auto whitespace-pre-line rounded-md bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              setFile(null);
              setError("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy || !file}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Import customers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
