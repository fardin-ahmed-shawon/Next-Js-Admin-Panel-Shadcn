"use client";

import * as React from "react";
import { Archive, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentReportItem } from "@/hooks/usePaymentReports";

interface PaymentReportsTableProps {
  data: PaymentReportItem[];
  isLoading: boolean;
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;

  // Filters & Sorting passed from parent
  searchVal: string;
  setSearchVal: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  methodFilter: string;
  setMethodFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortDir: string;
  setSortDir: (val: string) => void;

  onFilterSubmit: () => void;
  onReset: () => void;
}

export function PaymentReportsTable({
  data = [],
  isLoading,
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  searchVal,
  setSearchVal,
  statusFilter,
  setStatusFilter,
  methodFilter,
  setMethodFilter,
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  onFilterSubmit,
  onReset,
}: PaymentReportsTableProps) {
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status)
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    switch (status.toLowerCase()) {
      case "full paid":
      case "paid":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "partially paid":
      case "partial paid":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "unpaid":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "refund":
      case "refunded":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">All Transactions</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Table Filters Bar (Without Date range, exactly like payments table otherwise) */}
        <div className="flex flex-wrap items-center gap-3 px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onFilterSubmit();
            }}
            className="flex flex-wrap items-center gap-3 w-full"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-60 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Order ID / TRX / Account..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Full Paid">Full Paid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="h-8 w-[140px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                <SelectItem value="bKash">bKash</SelectItem>
                <SelectItem value="Nagad">Nagad</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" type="submit" className="h-8">
              Filter
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={onReset} className="h-8">
              Reset
            </Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("order_no")}>
                    Order ID
                    <ArrowUpDown className="ml-2 size-4" />
                  </Button>
                </TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account No</TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("id")}>
                    Transaction ID
                    <ArrowUpDown className="ml-2 size-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="p-0 ml-auto hover:bg-transparent"
                    onClick={() => handleSort("paid_amount")}
                  >
                    Paid Amount
                    <ArrowUpDown className="ml-2 size-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("created_at")}>
                    Payment Date
                    <ArrowUpDown className="ml-2 size-4" />
                  </Button>
                </TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Archive className="size-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">No records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => {
                  const paymentIdDisplay = row.transaction_id || "—";
                  const accDisplay = row.acc_number || "—";
                  const dateStr = new Date(row.payment_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const orderStatusDisplay = row.order?.order_status || "—";
                  const paymentStatusDisplay = row.order?.payment_status || "—";
                  const customerName = row.customer?.full_name || "Unknown";
                  const customerPhone = row.customer?.phone || "";

                  return (
                    <TableRow key={row.payment_id}>
                      <TableCell className="font-medium text-muted-foreground">{from + index}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium whitespace-nowrap">{customerName}</span>
                          {customerPhone && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{customerPhone}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{row.order_no}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.payment_method}</TableCell>
                      <TableCell className="whitespace-nowrap">{accDisplay}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                        {paymentIdDisplay}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-500 whitespace-nowrap">
                        ৳{row.paid_amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground tabular-nums whitespace-nowrap">{dateStr}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(orderStatusDisplay)}>
                          {orderStatusDisplay}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(paymentStatusDisplay)}>
                          {paymentStatusDisplay}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between px-4 pb-1">
            <p className="text-muted-foreground text-sm">
              Viewing {from}–{to} of {total} records
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(1)}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {lastPage}
              </span>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => onPageChange(lastPage)}
                disabled={currentPage >= lastPage}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
