"use client";

import { ExcelExportButton } from "@/components/excel-export-button";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  ExternalLink,
  Copy,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  RotateCcw,
  Banknote,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatOrderDateTime } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-pills";
import { TablePagination } from "./table-pagination";

interface CustomerPaymentsTableProps {
  payments: any[];
  customerId: number | string;
}

export function CustomerPaymentsTable({ payments = [], customerId }: CustomerPaymentsTableProps) {
  const [search, setSearch] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const filteredPayments = React.useMemo(() => {
    return payments.filter((pmt) => {
      const matchesSearch =
        !search.trim() ||
        pmt.order_no?.toLowerCase().includes(search.toLowerCase()) ||
        pmt.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
        pmt.acc_number?.toLowerCase().includes(search.toLowerCase()) ||
        pmt.payment_method?.toLowerCase().includes(search.toLowerCase());

      const matchesMethod =
        methodFilter === "ALL" ||
        pmt.payment_method?.toLowerCase() === methodFilter.toLowerCase();

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, methodFilter]);

  const totalItems = filteredPayments.length;
  const paginatedPayments = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, page, pageSize]);

  const totalPaidSum = React.useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0);
  }, [payments]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  const getMethodBadge = (method: string) => {
    const m = (method || "COD").toLowerCase();
    if (m.includes("bkash")) {
      return (
        <Badge className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30 gap-1 font-semibold">
          bKash
        </Badge>
      );
    }
    if (m.includes("nagad")) {
      return (
        <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 gap-1 font-semibold">
          Nagad
        </Badge>
      );
    }
    if (m.includes("rocket")) {
      return (
        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1 font-semibold">
          Rocket
        </Badge>
      );
    }
    if (m.includes("bank") || m.includes("card")) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-semibold">
          <CreditCard className="size-3" /> Card / Bank
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 font-medium">
        <Banknote className="size-3" /> {method || "Cash on Delivery"}
      </Badge>
    );
  };

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="size-4 text-primary" /> Complete Payment History
          </CardTitle>
          <CardDescription>
            All payment transactions, deposits, and settlement records across customer orders.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order, TrxID, phone..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Methods</SelectItem>
              <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
              <SelectItem value="bKash">bKash</SelectItem>
              <SelectItem value="Nagad">Nagad</SelectItem>
              <SelectItem value="Rocket">Rocket</SelectItem>
              <SelectItem value="Bank">Bank / Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      <ExcelExportButton module="crm" title="Customer payments" />
      </CardHeader>

      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <CreditCard className="size-12 stroke-1 mb-3 text-muted-foreground/50" />
            <h3 className="text-sm font-semibold text-foreground">No payments recorded</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              No recorded payment transactions for this customer yet. Payments will be listed automatically when recorded on orders.
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No payments match your search filter.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="pl-6 w-[160px]">Order No</TableHead>
                  <TableHead className="w-[130px]">Date & Time</TableHead>
                  <TableHead className="w-[150px]">Payment Method</TableHead>
                  <TableHead className="min-w-[160px]">Transaction ID / Account</TableHead>
                  <TableHead className="w-[120px]">Order Status</TableHead>
                  <TableHead className="text-right w-[130px]">Paid Amount</TableHead>
                  <TableHead className="pr-6 text-right w-[80px]">Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((pmt, idx) => {
                  const formatted = formatOrderDateTime(pmt.created_at);

                  return (
                    <TableRow key={pmt.id || idx} className="hover:bg-muted/30">
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/dashboard/orders/${pmt.order_no}`}
                          className="font-mono text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          {pmt.order_no}
                        </Link>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-medium text-foreground">{formatted.date}</div>
                        <div className="text-[11px] text-muted-foreground">{formatted.time}</div>
                      </TableCell>

                      <TableCell>{getMethodBadge(pmt.payment_method)}</TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {pmt.transaction_id ? (
                            <div className="flex items-center gap-1 font-mono text-xs text-foreground font-medium">
                              <span>{pmt.transaction_id}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 text-muted-foreground hover:text-foreground"
                                onClick={() => copyToClipboard(pmt.transaction_id, "Transaction ID")}
                              >
                                <Copy className="size-2.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No TrxID</span>
                          )}

                          {pmt.acc_number && (
                            <div className="text-[11px] text-muted-foreground">
                              Acc: {pmt.acc_number}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <OrderStatusBadge status={pmt.order_status || "Pending"} />
                      </TableCell>

                      <TableCell className="text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                        ৳{Number(pmt.paid_amount || 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                          <Link href={`/dashboard/orders/${pmt.order_no}`}>
                            <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        </>
        )}
      </CardContent>
    </Card>
  );
}
