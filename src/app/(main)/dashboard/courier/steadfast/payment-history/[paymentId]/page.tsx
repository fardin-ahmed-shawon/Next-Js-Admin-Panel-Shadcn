"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import {
  useSteadfastPayment,
  reconcileSteadfastPayment,
  type SteadfastPaymentComparisonRow,
} from "@/hooks/useSteadfastPayments";
import { comparisonLabels } from "@/hooks/useCodChangeReports";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentDate, paymentMoney, trackingLink } from "../_components/payment-format";

export default function SteadfastPaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const {
    data: payment,
    comparison,
    error,
    isLoading,
    isValidating,
    mutate,
    canView,
    validId,
  } = useSteadfastPayment(paymentId);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const consignments =
    payment?.consignments.filter((item) =>
      `${item.invoice ?? ""} ${item.tracking_code} ${item.consignment_id} ${item.recipient_name} ${item.recipient_phone}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) ?? [];
  const pages = Math.max(1, Math.ceil(consignments.length / 25));
  const currentPage = Math.min(page, pages);
  const visibleConsignments = consignments.slice((currentPage - 1) * 25, currentPage * 25);
  const comparisons = new Map(comparison?.rows.map((row) => [row.consignment_id, row]));
  const canMark = (row: SteadfastPaymentComparisonRow | undefined) =>
    Boolean(comparison?.can_mark && row?.status === "mismatch" && !row.marked);
  const canAdjust = (row: SteadfastPaymentComparisonRow | undefined) =>
    Boolean(comparison?.can_adjust && row && ["matched", "mismatch"].includes(row.status) && !row.adjusted_at);
  const selectable = (row: SteadfastPaymentComparisonRow | undefined) => canMark(row) || canAdjust(row);
  const visibleSelectable = visibleConsignments
    .map((item) => String(item.consignment_id))
    .filter((id) => selectable(comparisons.get(id)));
  const selected = (comparison?.rows ?? []).filter(
    (row) => selectedIds.includes(row.consignment_id) && selectable(row),
  );
  const selectedMarks = selected.filter(canMark);
  const selectedAdjustments = selected.filter(canAdjust);
  const allMarks = (comparison?.rows ?? []).filter(canMark);
  const allAdjustments = (comparison?.rows ?? []).filter(canAdjust);

  async function reconcile(action: "cod-changes" | "accounts-adjustment", rows: SteadfastPaymentComparisonRow[]) {
    if (busy || !rows.length) return;
    setBusy(action === "cod-changes" ? "mark" : rows.length > 1 ? "adjust-all" : rows[0].consignment_id);
    try {
      const response = await reconcileSteadfastPayment(paymentId, action, rows);
      toast.success(response.message);
      setSelectedIds([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save this adjustment.");
    } finally {
      await mutate();
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/courier/steadfast/payment-history">
          <ArrowLeft className="mr-2 size-4" />
          Payment History
        </Link>
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Payment {paymentId}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Steadfast payment breakdown and included consignments.</p>
        </div>
        <Button
          variant="outline"
          disabled={!canView || !validId || isValidating || busy !== null}
          onClick={() => mutate()}
        >
          <RefreshCw className={`mr-2 size-4 ${isValidating ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {!canView ? (
        <p>Payment history requires access to all orders.</p>
      ) : !validId ? (
        <p role="alert">Invalid Steadfast payment ID.</p>
      ) : isLoading ? (
        <p role="status">Loading payment details…</p>
      ) : error ? (
        <div role="alert" className="space-y-3 rounded-lg border p-6">
          <p>{error.message}</p>
          <Button variant="outline" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      ) : payment ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {(
              [
                ["Amount", "amount"],
                ["Due bills", "due_bills"],
                ["Paid bills", "paid_bills"],
                ["Charges", "charges"],
                ["Net total", "total"],
              ] as const
            ).map(([label, key]) => (
              <Card key={key}>
                <CardContent className="pt-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{paymentMoney(payment[key])}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Payment details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div>
                  <dt className="text-sm text-muted-foreground">Method</dt>
                  <dd className="mt-1 font-medium">{payment.method || "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {payment.status_label || "Unknown"}
                    </Badge>
                  </dd>
                </div>
                {(
                  [
                    ["Created", "created_at"],
                    ["Ready", "ready_at"],
                    ["Paid", "paid_at"],
                  ] as const
                ).map(([label, key]) => (
                  <div key={key}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="mt-1">{paymentDate(payment[key])}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Amounts are reported by Steadfast. Dates are shown in Bangladesh time.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
              <CardTitle>Consignments ({payment.consignments.length})</CardTitle>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  disabled={!allAdjustments.length || busy !== null || isValidating}
                  onClick={() => reconcile("accounts-adjustment", allAdjustments)}
                >
                  All Account Adjustment ({allAdjustments.length})
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedAdjustments.length || busy !== null || isValidating}
                  onClick={() => reconcile("accounts-adjustment", selectedAdjustments)}
                >
                  Selected Account Adjustment ({selectedAdjustments.length})
                </Button>
                <Button
                  variant="secondary"
                  disabled={!allMarks.length || busy !== null || isValidating}
                  onClick={() => reconcile("cod-changes", allMarks)}
                >
                  All Marked As COD Change ({allMarks.length})
                </Button>
                <Button
                  variant="outline"
                  disabled={!selectedMarks.length || busy !== null || isValidating}
                  onClick={() => reconcile("cod-changes", selectedMarks)}
                >
                  Mark As COD Change — Selected ({selectedMarks.length})
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                All actions include eligible orders across this entire payment, regardless of search or page. Selected
                actions use the checked orders. Adjustment records COD Amount as paid: matches become Full Paid;
                mismatches become Partially Paid. Already adjusted or marked orders are skipped for that action.
              </p>
              {busy && (
                <p role="status" className="text-sm text-muted-foreground">
                  {busy === "mark" ? "Marking orders…" : "Adjusting accounts…"}
                </p>
              )}
              {selected.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span>{selected.length} orders selected</span>
                  <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => setSelectedIds([])}>
                    Clear selection
                  </Button>
                </div>
              )}
              <Input
                aria-label="Search consignments"
                placeholder="Search invoice, tracking code, recipient or phone"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="max-w-lg"
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Checkbox
                        aria-label="Select eligible orders on this page"
                        checked={
                          visibleSelectable.length > 0 && visibleSelectable.every((id) => selectedIds.includes(id))
                        }
                        disabled={visibleSelectable.length === 0 || busy !== null || isValidating}
                        onCheckedChange={(checked) =>
                          setSelectedIds((ids) =>
                            checked
                              ? [...new Set([...ids, ...visibleSelectable])]
                              : ids.filter((id) => !visibleSelectable.includes(id)),
                          )
                        }
                      />
                    </TableHead>
                    {[
                      "Invoice / Consignment",
                      "Tracking",
                      "Recipient",
                      "COD Amount",
                      "System order total",
                      "COD Change Amount",
                      "Status",
                      "Accounts Adjustment",
                      "Delivery status",
                      "Details",
                    ].map((label) => (
                      <TableHead key={label} className="whitespace-nowrap">
                        {label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consignments.length ? (
                    visibleConsignments.map((item) => {
                      const url = trackingLink(item.tracking_link);
                      const row = comparisons.get(String(item.consignment_id));
                      return (
                        <TableRow key={item.consignment_id}>
                          <TableCell className="align-top">
                            <Checkbox
                              aria-label={`Select order ${item.invoice || item.consignment_id}`}
                              checked={Boolean(
                                row && selected.some((selection) => selection.consignment_id === row.consignment_id),
                              )}
                              disabled={!selectable(row) || busy !== null || isValidating}
                              onCheckedChange={(checked) =>
                                setSelectedIds((ids) =>
                                  checked
                                    ? [...new Set([...ids, String(item.consignment_id)])]
                                    : ids.filter((id) => id !== String(item.consignment_id)),
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            {item.invoice ? (
                              <Link
                                href={`/dashboard/orders/${encodeURIComponent(item.invoice)}`}
                                className="text-primary underline underline-offset-4"
                              >
                                {item.invoice}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">No invoice</span>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">{item.consignment_id}</p>
                          </TableCell>
                          <TableCell className="align-top">
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary underline underline-offset-4"
                              >
                                {item.tracking_code || "Track parcel"}
                                <ExternalLink className="size-3 shrink-0" />
                              </a>
                            ) : (
                              item.tracking_code || "—"
                            )}
                          </TableCell>
                          <TableCell className="min-w-52 max-w-80 whitespace-normal align-top">
                            <p className="font-medium">{item.recipient_name}</p>
                            <p className="mt-1 text-sm">{item.recipient_phone}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.recipient_address}</p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap align-top font-medium tabular-nums">
                            {paymentMoney(item.cod_amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap align-top text-right tabular-nums">
                            {paymentMoney(row?.grand_total_amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap align-top text-right tabular-nums">
                            {paymentMoney(row?.difference)}
                          </TableCell>
                          <TableCell className="align-top min-w-40 whitespace-normal">
                            {row ? (
                              <div className="space-y-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    row.status === "mismatch"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : row.status === "matched"
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : ""
                                  }
                                >
                                  {row.status === "duplicate_csv" ? "Duplicate invoice" : comparisonLabels[row.status]}
                                </Badge>
                                {row.marked && (
                                  <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                    COD Changed
                                  </span>
                                )}
                                {row.adjusted_at && (
                                  <Badge
                                    variant="outline"
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                                  >
                                    Account Adjusted
                                  </Badge>
                                )}
                                {canMark(row) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={busy !== null || isValidating}
                                    onClick={() => reconcile("cod-changes", [row])}
                                  >
                                    Mark As COD Change
                                  </Button>
                                )}
                                {row.message && <p className="text-xs text-muted-foreground">{row.message}</p>}
                              </div>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            {row?.adjusted_at ? (
                              <span className="text-sm font-medium text-emerald-700">Adjusted</span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={
                                  !comparison?.can_adjust ||
                                  !row ||
                                  !["matched", "mismatch"].includes(row.status) ||
                                  busy !== null ||
                                  isValidating
                                }
                                onClick={() => row && reconcile("accounts-adjustment", [row])}
                              >
                                {busy === String(item.consignment_id) ? "Adjusting…" : "Accounts Adjustment"}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <Badge variant="outline" className="capitalize">
                              {item.status?.replaceAll("_", " ") || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="min-w-52 max-w-80 whitespace-normal align-top">
                            <details>
                              <summary className="cursor-pointer text-sm">Parcel details</summary>
                              <dl className="mt-3 space-y-2 text-xs">
                                {[
                                  ["Item", item.item_description],
                                  ["Lots", item.total_lot],
                                  ["Alternative phone", item.alternative_phone],
                                  ["Email", item.recipient_email],
                                  ["Note", item.note],
                                  ["Created", paymentDate(item.created_at)],
                                  ["Updated", paymentDate(item.updated_at)],
                                ].map(([label, value]) => (
                                  <div key={label}>
                                    <dt className="text-muted-foreground">{label}</dt>
                                    <dd className="mt-0.5 break-words">{value ?? "—"}</dd>
                                  </div>
                                ))}
                              </dl>
                            </details>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                        {payment.consignments.length
                          ? "No consignments match your search."
                          : "No consignments included in this payment."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {consignments.length} consignments · Page {currentPage} of {pages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
