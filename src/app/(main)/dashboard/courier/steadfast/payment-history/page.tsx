"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useSteadfastPayments, type SteadfastPayment } from "@/hooks/useSteadfastPayments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { paymentDate, paymentMoney } from "./_components/payment-format";

export default function SteadfastPaymentHistoryPage() {
  const { data, isLoading, isError, mutate, isValidating, canView } = useSteadfastPayments();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const filtered = data
    .filter((payment) => {
      const date = payment.created_at?.slice(0, 10) ?? "";
      return (
        `${payment.payment_id} ${payment.method ?? ""}`.toLowerCase().includes(search.toLowerCase()) &&
        (!status || payment.status_label === status) &&
        (!from || date >= from) &&
        (!to || (!!date && date <= to))
      );
    })
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const pages = Math.max(1, Math.ceil(filtered.length / 25));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * 25, currentPage * 25);
  const sum = (key: "amount" | "charges" | "total") =>
    filtered.reduce(
      (total, payment) => total + (payment[key] == null || payment[key] === "" ? NaN : Number(payment[key])),
      0,
    );
  const statuses = [...new Set(data.map((payment) => payment.status_label).filter(Boolean))];

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/courier/steadfast">
          <ArrowLeft className="mr-2 size-4" />
          Steadfast Courier
        </Link>
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Steadfast Payment History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View courier payments and the consignments included in each payment.
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()} disabled={!canView || isValidating}>
          <RefreshCw className={`mr-2 size-4 ${isValidating ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {!canView ? (
        <p>Payment history requires access to all orders.</p>
      ) : isLoading ? (
        <p role="status">Loading payment history…</p>
      ) : isError ? (
        <div role="alert" className="space-y-3 rounded-lg border p-6">
          <p>{isError.message}</p>
          <Button variant="outline" onClick={() => mutate()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Payments", filtered.length],
              ["Amount", paymentMoney(sum("amount"))],
              ["Charges", paymentMoney(sum("charges"))],
              ["Net total", paymentMoney(sum("total"))],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="pt-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Summary totals follow the filters below. Dates are shown in Bangladesh time.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="payment-search">Search</Label>
              <Input
                id="payment-search"
                placeholder="Payment ID or method"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-status">Status</Label>
              <select
                id="payment-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All statuses</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-from">Created from</Label>
              <Input
                id="payment-from"
                type="date"
                max={to || undefined}
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-to">Created to</Label>
              <Input
                id="payment-to"
                type="date"
                min={from || undefined}
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "Payment ID",
                    "Method",
                    "Amount",
                    "Due bills",
                    "Paid bills",
                    "Charges",
                    "Net total",
                    "Status",
                    "Created",
                    "Ready",
                    "Paid",
                  ].map((label) => (
                    <TableHead key={label} className="whitespace-nowrap">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((payment: SteadfastPayment) => (
                    <TableRow key={payment.payment_id}>
                      <TableCell>
                        <Link
                          className="font-medium text-primary underline underline-offset-4"
                          href={`/dashboard/courier/steadfast/payment-history/${encodeURIComponent(payment.payment_id)}`}
                        >
                          {payment.payment_id}
                        </Link>
                      </TableCell>
                      <TableCell>{payment.method || "—"}</TableCell>
                      {(["amount", "due_bills", "paid_bills", "charges", "total"] as const).map((key) => (
                        <TableCell key={key} className="whitespace-nowrap tabular-nums">
                          {paymentMoney(payment[key])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.status_label || "Unknown"}
                        </Badge>
                      </TableCell>
                      {(["created_at", "ready_at", "paid_at"] as const).map((key) => (
                        <TableCell key={key} className="whitespace-nowrap">
                          {paymentDate(payment[key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="py-12 text-center text-muted-foreground">
                      {data.length ? "No payments match these filters." : "No payments returned by Steadfast."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>
              {filtered.length} payments · Page {currentPage} of {pages}
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
        </>
      )}
    </div>
  );
}
