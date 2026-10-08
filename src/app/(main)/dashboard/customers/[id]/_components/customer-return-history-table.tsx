"use client";

import { ExcelExportButton } from "@/components/excel-export-button";

import * as React from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  ExternalLink,
  UserCheck,
  FileText,
  AlertCircle,
  Package,
  Calendar,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Tag,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatOrderDateTime, getImageUrl } from "@/lib/utils";
import { OrderStatusBadge } from "./order-status-pills";
import { TablePagination } from "./table-pagination";

export interface ReturnItem {
  id: string | number;
  order_id: number;
  order_no: string;
  order_date?: string;
  order_status: string;
  is_partial: boolean;
  product_id: number;
  product_title: string;
  sku: string;
  option_label?: string;
  product_thumbnail?: string | null;
  qty: number;
  unit_price?: number;
  sale_value: number;
  disposition: string;
  reason: string;
  note: string;
  actor_id?: number;
  actor_name: string;
  created_at: string;
}

interface CustomerReturnHistoryTableProps {
  returns?: ReturnItem[];
  orders?: any[];
  customerId: number | string;
}

export function CustomerReturnHistoryTable({
  returns = [],
  orders = [],
  customerId,
}: CustomerReturnHistoryTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [dispositionFilter, setDispositionFilter] = React.useState("ALL");

  // Resolved return items (using API returns or synthesized from orders)
  const resolvedReturns: ReturnItem[] = React.useMemo(() => {
    if (returns && returns.length > 0) {
      return returns;
    }

    const synthesized: ReturnItem[] = [];
    orders.forEach((ord: any) => {
      const receipts = ord.returnReceipts || ord.return_receipts || [];
      if (receipts.length > 0) {
        receipts.forEach((rcpt: any) => {
          synthesized.push({
            id: rcpt.id,
            order_id: ord.id,
            order_no: ord.order_no,
            order_date: ord.created_at,
            order_status: ord.order_status,
            is_partial: ord.order_status === "Partial" || Boolean(ord.is_partial_return),
            product_id: rcpt.product_id,
            product_title: rcpt.product_title || "Product",
            sku: rcpt.sku || "—",
            option_label: rcpt.option_label || "",
            product_thumbnail: null,
            qty: Number(rcpt.qty || 1),
            unit_price: Number(rcpt.sale_value || 0),
            sale_value: Number(rcpt.sale_value || 0),
            disposition: rcpt.disposition || "restock",
            reason: rcpt.reason || "Return processed",
            note: rcpt.note || "Return goods received",
            actor_name: rcpt.actor_name || "Admin",
            created_at: rcpt.created_at || ord.created_at,
          });
        });
      } else if (["Returned", "Partial", "Pending-Return"].includes(ord.order_status) || ord.is_partial_return) {
        const prods = ord.orderedProducts || ord.ordered_products || [];
        prods.forEach((p: any) => {
          if (ord.order_status === "Returned" || p.return_received_qty > 0 || ord.is_partial_return) {
            const retQty = p.return_received_qty > 0 ? p.return_received_qty : (p.qty || 1);
            synthesized.push({
              id: `syn-${ord.id}-${p.id}`,
              order_id: ord.id,
              order_no: ord.order_no,
              order_date: ord.created_at,
              order_status: ord.order_status,
              is_partial: ord.order_status === "Partial" || Boolean(ord.is_partial_return),
              product_id: p.product_id || p.product?.id || 0,
              product_title: p.product_title_snapshot || p.product?.title || "Product",
              sku: p.sku_snapshot || p.product?.sku || "—",
              option_label: p.option_label_snapshot || "",
              product_thumbnail: p.product?.product_thumbnail_img || null,
              qty: Number(retQty),
              unit_price: Number(p.unit_price || 0),
              sale_value: Number(retQty) * Number(p.unit_price || 0),
              disposition: "restock",
              reason: ord.order_note || "Return processed",
              note: ord.order_note || `Order marked as ${ord.order_status}`,
              actor_name: "Admin",
              created_at: ord.created_at,
            });
          }
        });
      }
    });

    return synthesized;
  }, [returns, orders]);

  // Filtered returns
  const filteredReturns = React.useMemo(() => {
    let result = [...resolvedReturns];

    if (statusFilter !== "ALL") {
      result = result.filter((r) => {
        if (statusFilter === "Partial") {
          return r.is_partial || r.order_status === "Partial";
        }
        return r.order_status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    if (dispositionFilter !== "ALL") {
      result = result.filter(
        (r) => (r.disposition || "").toLowerCase() === dispositionFilter.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.order_no.toLowerCase().includes(q) ||
          r.product_title.toLowerCase().includes(q) ||
          (r.sku && r.sku.toLowerCase().includes(q)) ||
          r.reason.toLowerCase().includes(q) ||
          r.note.toLowerCase().includes(q) ||
          r.actor_name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [resolvedReturns, statusFilter, dispositionFilter, search]);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dispositionFilter]);

  const totalItems = filteredReturns.length;
  const paginatedReturns = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReturns.slice(start, start + pageSize);
  }, [filteredReturns, page, pageSize]);

  // Aggregate stats
  const totalReturnCount = resolvedReturns.length;
  const totalReturnValue = resolvedReturns.reduce((acc, r) => acc + Number(r.sale_value || 0), 0);
  const totalReturnedUnits = resolvedReturns.reduce((acc, r) => acc + Number(r.qty || 0), 0);
  const partialCount = resolvedReturns.filter((r) => r.is_partial || r.order_status === "Partial").length;
  const fullReturnCount = resolvedReturns.filter((r) => !r.is_partial && r.order_status === "Returned").length;

  const getStatusBadge = (status: string, isPartial: boolean) => {
    if (status === "Partial" || isPartial) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold gap-1"
        >
          <RotateCcw className="size-3" />
          <span>Partial</span>
        </Badge>
      );
    }

    if (status === "Returned") {
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-semibold gap-1"
        >
          <RotateCcw className="size-3" />
          <span>Returned</span>
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="gap-1 font-medium">
        {status}
      </Badge>
    );
  };

  const getDispositionBadge = (disposition: string) => {
    switch (disposition?.toLowerCase()) {
      case "restock":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          >
            Restocked
          </Badge>
        );
      case "discard":
        return (
          <Badge
            variant="outline"
            className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
          >
            Discarded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {disposition || "Processed"}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <RotateCcw className="size-4 text-amber-600 dark:text-amber-400" />
              <span>Customer Return History</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {filteredReturns.length} {filteredReturns.length === 1 ? "Record" : "Records"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Comprehensive log of returned items, who processed each return, reasons provided, and internal notes.
            </CardDescription>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs bg-muted/40 border rounded-lg px-3 py-1.5 self-start sm:self-auto flex-wrap">
            <div>
              <span className="text-muted-foreground">Total Returns: </span>
              <strong className="text-foreground">{totalReturnCount}</strong>
            </div>
            <span>·</span>
            <div>
              <span className="text-muted-foreground">Units: </span>
              <strong className="text-foreground">{totalReturnedUnits} pcs</strong>
            </div>
            <span>·</span>
            <div>
              <span className="text-muted-foreground">Partial: </span>
              <strong className="text-amber-600 dark:text-amber-400">{partialCount}</strong>
            </div>
            <span>·</span>
            <div>
              <span className="text-muted-foreground">Full: </span>
              <strong className="text-rose-600 dark:text-rose-400">{fullReturnCount}</strong>
            </div>
            <span>·</span>
            <div>
              <span className="text-muted-foreground">Value: </span>
              <strong className="text-amber-600 dark:text-amber-400">
                ৳{totalReturnValue.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by order no, product, reason, note, or admin name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          {/* Return Status Filter */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-[140px] gap-1.5">
                <Filter className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="Partial" className="text-xs">Partial</SelectItem>
                <SelectItem value="Returned" className="text-xs">Returned</SelectItem>
                <SelectItem value="Pending-Return" className="text-xs">Pending-Return</SelectItem>
              </SelectContent>
            </Select>

            {/* Disposition Filter */}
            <Select value={dispositionFilter} onValueChange={setDispositionFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px] gap-1.5">
                <Tag className="size-3 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Disposition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Dispositions</SelectItem>
                <SelectItem value="restock" className="text-xs">Restock</SelectItem>
                <SelectItem value="discard" className="text-xs">Discard</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "ALL" || dispositionFilter !== "ALL" || search) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => {
                  setStatusFilter("ALL");
                  setDispositionFilter("ALL");
                  setSearch("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      <ExcelExportButton module="crm" title="Customer return-history" />
      </CardHeader>

      <CardContent className="p-0">
        {filteredReturns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center gap-2 text-muted-foreground">
            <CheckCircle2 className="size-10 stroke-1 text-emerald-500/80" />
            <p className="text-sm font-semibold text-foreground">
              {returns.length === 0 ? "No Returns Recorded" : "No Matching Return Records"}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {returns.length === 0
                ? "This customer has no return history on record. All orders have been delivered or are active without return disputes."
                : "No returns match your current filter and search conditions. Try clearing filters to view all records."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[45px] pl-4">#</TableHead>
                  <TableHead className="min-w-[130px]">Order No & Date</TableHead>
                  <TableHead className="min-w-[200px]">Returned Product</TableHead>
                  <TableHead className="min-w-[110px]">Return Status</TableHead>
                  <TableHead className="text-center">Returned Qty</TableHead>
                  <TableHead className="text-right">Value (৳)</TableHead>
                  <TableHead className="min-w-[150px]">Marked As Returned By</TableHead>
                  <TableHead className="min-w-[220px]">Reasons & Note</TableHead>
                  <TableHead className="w-[50px] pr-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReturns.map((item, idx) => {
                  const imageUrl = getImageUrl(item.product_thumbnail);
                  const dt = formatOrderDateTime(item.created_at || item.order_date || "");
                  const globalIdx = (page - 1) * pageSize + idx + 1;

                  return (
                    <TableRow key={item.id || idx} className="hover:bg-muted/30">
                      {/* Index */}
                      <TableCell className="pl-4 text-xs font-mono text-muted-foreground">
                        {globalIdx}
                      </TableCell>

                      {/* Order No & Date */}
                      <TableCell>
                        <Link
                          href={`/dashboard/orders/${item.order_no}`}
                          className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <span>{item.order_no}</span>
                          <ExternalLink className="size-2.5 opacity-60" />
                        </Link>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {dt.date} {dt.time && `· ${dt.time}`}
                        </div>
                      </TableCell>

                      {/* Returned Product */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="size-10 rounded border bg-muted/60 overflow-hidden shrink-0 flex items-center justify-center">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.product_title}
                                className="size-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <Package className="size-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[220px]" title={item.product_title}>
                              {item.product_title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                              <span className="font-mono">{item.sku}</span>
                              {item.option_label && (
                                <>
                                  <span>·</span>
                                  <span className="text-primary font-medium">{item.option_label}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Return Status & Disposition */}
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(item.order_status, item.is_partial)}
                          <div>{getDispositionBadge(item.disposition)}</div>
                        </div>
                      </TableCell>

                      {/* Returned Qty */}
                      <TableCell className="text-center text-xs font-semibold">
                        <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                          {item.qty} pcs
                        </span>
                      </TableCell>

                      {/* Value */}
                      <TableCell className="text-right text-xs font-bold text-foreground">
                        ৳{Number(item.sale_value || 0).toLocaleString()}
                      </TableCell>

                      {/* Who marked as returned */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserCheck className="size-3" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {item.actor_name || "Admin"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {dt.date} {dt.time && `· ${dt.time}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Reasons and Note */}
                      <TableCell>
                        <div className="space-y-1 text-xs max-w-[280px]">
                          <div className="flex items-start gap-1">
                            <span className="font-semibold text-foreground text-[11px] shrink-0">Reason:</span>
                            <span className="text-amber-700 dark:text-amber-400 font-medium text-[11px] break-words">
                              {item.reason || "None specified"}
                            </span>
                          </div>
                          <div className="flex items-start gap-1 bg-muted/40 p-1.5 rounded border text-[11px]">
                            <FileText className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground italic break-words">
                              {item.note || "No administrative note attached"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="pr-4 text-right">
                        <Button variant="ghost" size="icon" className="size-7" asChild>
                          <Link href={`/dashboard/orders/${item.order_no}`} title="View Order Details">
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
