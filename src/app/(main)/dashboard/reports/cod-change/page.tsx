"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HistoryDateFilter } from "@/components/history-date-filter";
import { historyPeriods } from "@/lib/data-history";
import { useAuth } from "@/hooks/useAuth";
import {
  adjustCodAccounts,
  comparisonLabels,
  uploadCodReport,
  useCodImports,
  useCodReport,
} from "@/hooks/useCodChangeReports";

const money = (value: string | number | null | undefined) =>
  value == null
    ? "—"
    : `৳${Number(value).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value: string) =>
  new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`).toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
  });

export default function CodChangeReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilters, setDateFilters] = useState({ from: "", to: "" });
  const [adjustingRow, setAdjustingRow] = useState<number | null>(null);
  const user = useAuth((state) => state.user);
  const allowedPeriods = historyPeriods(user, "orders");
  const history = useCodImports(historyPage);
  const activeId = selectedId ?? history.data?.data.data[0]?.id ?? null;
  const report = useCodReport(activeId, page, status, search, dateFilters);
  const counts = report.data?.summary.counts;
  const reviewCount = ["not_found", "invalid", "duplicate_csv", "ambiguous_order"].reduce(
    (sum, key) => sum + Number(counts?.[key as keyof typeof comparisonLabels] || 0),
    0,
  );

  function selectImport(id: number) {
    setSelectedId(id);
    setDateFilters({ from: "", to: "" });
    setPage(1);
    setStatus("");
    setSearch("");
    setSearchInput("");
  }

  async function adjustAccounts(rowId: number) {
    if (!activeId || adjustingRow !== null) return;
    setAdjustingRow(rowId);
    try {
      const result = await adjustCodAccounts(activeId, rowId);
      toast.success(result.message);
      await report.mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Accounts adjustment failed.");
    } finally {
      setAdjustingRow(null);
    }
  }

  async function upload() {
    if (!file) return;
    setUploadError("");
    if (!file.name.toLowerCase().endsWith(".csv") || file.size > 5 * 1024 * 1024) {
      setUploadError("Choose a CSV file no larger than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadCodReport(file);
      selectImport(result.data.id);
      setHistoryPage(1);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      toast.success(result.message);
      await history.mutate();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed. Please retry.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div>
        <h1 className="text-3xl tracking-tight">COD Change Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare courier collectable amounts with your order totals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            Upload courier CSV
          </CardTitle>
          <CardDescription>
            Required columns: Merchant_Order_ID and Collectable_Amount. UTF-8 CSV, up to 5 MB and 10,000 rows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              aria-label="Courier CSV file"
              disabled={uploading}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setUploadError("");
              }}
              className="max-w-xl"
            />
            <Button onClick={upload} disabled={!file || uploading}>
              {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
              {uploading ? "Importing…" : "Upload & compare"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Each upload saves the source rows and order totals at upload time. Your orders are not modified. Identical
            files reopen their existing report.
          </p>
          {uploadError && (
            <p role="alert" className="text-sm text-destructive">
              {uploadError}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5" />
            Upload history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.error ? (
            <div role="alert" className="flex items-center gap-3 text-destructive">
              {history.error.message}
              <Button variant="outline" onClick={() => history.mutate()}>
                Retry
              </Button>
            </div>
          ) : history.isLoading ? (
            <p role="status">Loading uploads…</p>
          ) : !history.data?.data.total ? (
            <p className="text-sm text-muted-foreground">
              No CSV uploads yet. Upload your first file to see the comparison.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Uploaded (Dhaka)</TableHead>
                    <TableHead>Uploaded by</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>
                      <span className="sr-only">Open report</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.data.data.data.map((item) => (
                    <TableRow key={item.id} data-state={item.id === activeId ? "selected" : undefined}>
                      <TableCell className="max-w-64 truncate font-medium" title={item.filename}>
                        {item.filename}
                      </TableCell>
                      <TableCell>{date(item.created_at)}</TableCell>
                      <TableCell>{item.uploaded_by_name || "—"}</TableCell>
                      <TableCell>{item.row_count}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={item.id === activeId ? "secondary" : "outline"}
                          aria-pressed={item.id === activeId}
                          onClick={() => selectImport(item.id)}
                        >
                          {item.id === activeId ? "Selected" : "View report"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-3 flex items-center justify-end gap-3 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={historyPage === 1}
                  onClick={() => {
                    setSelectedId(activeId);
                    setHistoryPage((value) => value - 1);
                  }}
                >
                  Previous uploads
                </Button>
                <span>
                  {historyPage} / {history.data.data.last_page}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={historyPage >= history.data.data.last_page}
                  onClick={() => {
                    setSelectedId(activeId);
                    setHistoryPage((value) => value + 1);
                  }}
                >
                  Next uploads
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {activeId &&
        (report.error ? (
          <div role="alert" className="flex items-center gap-3 text-destructive">
            {report.error.message}
            <Button variant="outline" onClick={() => report.mutate()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {report.data && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Report rows", report.data.summary.row_count],
                    ["Matched", counts?.matched || 0],
                    ["Amount mismatches", counts?.mismatch || 0],
                    ["Needs review", reviewCount],
                  ].map(([label, value]) => (
                    <Card key={label}>
                      <CardContent className="pt-5">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="mt-1 text-2xl font-semibold">{value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2 rounded-lg border p-4 text-sm">
                  <span>
                    CSV total: <strong>{money(report.data.summary.totals.collectable_total ?? 0)}</strong>
                  </span>
                  <span>
                    System total: <strong>{money(report.data.summary.totals.system_total ?? 0)}</strong>
                  </span>
                  <span>
                    Total COD Change Amount: <strong>{money(report.data.summary.totals.net_difference ?? 0)}</strong>
                  </span>
                  <p className="w-full text-xs text-muted-foreground">
                    Totals include matched and mismatched rows only. Unmatched, invalid and duplicate rows are excluded.
                  </p>
                </div>
              </>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Data comparison{report.data ? ` — ${report.data.import.filename}` : ""}</CardTitle>
                <CardDescription>
                  COD Change Amount = CSV Collectable_Amount − system grand_total_amount. Negative means the courier
                  amount is lower. Summary cards follow the order-date filter.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HistoryDateFilter
                  key={activeId}
                  label="Order Date"
                  periods={allowedPeriods}
                  onChange={(dates) => {
                    setDateFilters(dates);
                    setPage(1);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Dates use the system order creation date, not the CSV upload date. Rows without a matched order date
                  are excluded when a date range is selected.
                </p>
                <p className="text-xs text-muted-foreground">
                  Accounts Adjustment sets the order’s total paid amount to its Collectable Amount, updating existing
                  payments or creating one. Previous payment values are retained in the adjustment history.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <form
                    className="flex flex-1 gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setSearch(searchInput.trim());
                      setPage(1);
                    }}
                  >
                    <Input
                      placeholder="Search merchant order ID"
                      aria-label="Search merchant order ID"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                    />
                    <Button type="submit" variant="outline">
                      <Search className="size-4" />
                      <span className="sr-only">Search</span>
                    </Button>
                  </form>
                  <select
                    aria-label="Comparison status"
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setPage(1);
                    }}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">All statuses</option>
                    {Object.entries(comparisonLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {report.isLoading ? (
                  <p role="status">Loading comparison…</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>CSV row</TableHead>
                          <TableHead>Merchant order ID</TableHead>
                          <TableHead>Order date</TableHead>
                          <TableHead className="text-right">Collectable amount</TableHead>
                          <TableHead className="text-right">System order total</TableHead>
                          <TableHead className="text-right">COD Change Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Source data</TableHead>
                          <TableHead>Accounts Adjustment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.data?.data.data.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.row_number}</TableCell>
                            <TableCell className="font-medium">{row.merchant_order_id || "—"}</TableCell>
                            <TableCell>{row.order_date ? date(row.order_date) : "—"}</TableCell>
                            <TableCell className="text-right tabular-nums">{money(row.collectable_amount)}</TableCell>
                            <TableCell className="text-right tabular-nums">{money(row.grand_total_amount)}</TableCell>
                            <TableCell
                              className={`text-right tabular-nums ${row.status === "mismatch" ? "font-semibold text-destructive" : ""}`}
                            >
                              {money(row.difference)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${row.status === "matched" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : row.status === "mismatch" ? "bg-red-500/10 text-red-700 dark:text-red-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}
                              >
                                {comparisonLabels[row.status]}
                              </span>
                              {row.message && (
                                <p className="mt-1 max-w-60 whitespace-normal text-xs text-muted-foreground">
                                  {row.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <details>
                                <summary className="cursor-pointer text-sm">View CSV row</summary>
                                <dl className="mt-2 max-h-72 w-72 space-y-2 overflow-auto whitespace-normal rounded border p-3">
                                  {Object.entries(row.raw_data).map(([key, value]) => (
                                    <div key={key}>
                                      <dt className="text-xs text-muted-foreground">{key}</dt>
                                      <dd className="break-words text-sm">{String(value ?? "")}</dd>
                                    </div>
                                  ))}
                                </dl>
                              </details>
                            </TableCell>
                            <TableCell>
                              {row.adjusted_at ? (
                                <div className="space-y-1 text-xs">
                                  <p className="font-medium text-emerald-700 dark:text-emerald-400">Adjusted</p>
                                  <p>{date(row.adjusted_at)}</p>
                                  <p>{row.adjusted_by_name}</p>
                                  <p>Payment #{row.payment_id}</p>
                                  <p>
                                    {money(row.previous_paid_amount)} → {money(row.collectable_amount)}
                                  </p>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={
                                    !report.data?.can_adjust ||
                                    adjustingRow !== null ||
                                    !["matched", "mismatch"].includes(row.status)
                                  }
                                  onClick={() => adjustAccounts(row.id)}
                                >
                                  {adjustingRow === row.id ? "Adjusting…" : "Accounts Adjustment"}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {!report.data?.data.total && (
                          <TableRow>
                            <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                              No rows match these filters.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    {report.data && (
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <span>
                          {report.data.data.total} rows · Page {report.data.data.current_page} of{" "}
                          {report.data.data.last_page}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((value) => value - 1)}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= report.data.data.last_page}
                            onClick={() => setPage((value) => value + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        ))}
    </div>
  );
}
