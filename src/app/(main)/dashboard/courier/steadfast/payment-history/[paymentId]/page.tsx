"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { useSteadfastPayment } from "@/hooks/useSteadfastPayments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentDate, paymentMoney, trackingLink } from "../_components/payment-format";

export default function SteadfastPaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { data: payment, error, isLoading, isValidating, mutate, canView, validId } = useSteadfastPayment(paymentId);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const consignments =
    payment?.consignments.filter((item) =>
      `${item.invoice ?? ""} ${item.tracking_code} ${item.consignment_id} ${item.recipient_name} ${item.recipient_phone}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ) ?? [];
  const pages = Math.max(1, Math.ceil(consignments.length / 25));
  const currentPage = Math.min(page, pages);

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
        <Button variant="outline" disabled={!canView || !validId || isValidating} onClick={() => mutate()}>
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
            <CardHeader>
              <CardTitle>Consignments ({payment.consignments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {["Invoice / Consignment", "Tracking", "Recipient", "COD Amount", "Status", "Details"].map(
                      (label) => (
                        <TableHead key={label} className="whitespace-nowrap">
                          {label}
                        </TableHead>
                      ),
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consignments.length ? (
                    consignments.slice((currentPage - 1) * 25, currentPage * 25).map((item) => {
                      const url = trackingLink(item.tracking_link);
                      return (
                        <TableRow key={item.consignment_id}>
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
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
