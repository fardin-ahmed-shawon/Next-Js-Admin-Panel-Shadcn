"use client";

import { ExcelExportButton } from "@/components/excel-export-button";

import * as React from "react";
import Link from "next/link";
import {
  Package,
  Search,
  ExternalLink,
  Layers,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Truck,
  AlertTriangle,
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
import { OrderStatusPills, OrderStatusBadge, VALID_ORDER_STATUSES } from "./order-status-pills";
import { TablePagination } from "./table-pagination";

interface CustomerProductOrdersTableProps {
  orders: any[];
  customerId: number | string;
}

export interface FlattenedProductOrder {
  key: string;
  order_id: number;
  order_no: string;
  order_date: string;
  order_status: string;
  is_partial_return: boolean;
  product_id: number;
  product_title: string;
  sku: string;
  option_label: string;
  thumbnail: string | null;
  unit_price: number;
  qty: number;
  total_price: number;
  return_received_qty: number;
}

export function CustomerProductOrdersTable({
  orders = [],
  customerId,
}: CustomerProductOrdersTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [sortBy, setSortBy] = React.useState<"date-desc" | "date-asc" | "price-desc" | "price-asc" | "qty-desc">("date-desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // Flatten all products ordered by this customer
  const allProductItems: FlattenedProductOrder[] = React.useMemo(() => {
    const list: FlattenedProductOrder[] = [];

    orders.forEach((order) => {
      const items = order.orderedProducts || order.ordered_products || [];
      const orderDate = order.created_at || "";
      const orderNo = order.order_no || `ORD-${order.id}`;
      const orderStatus = order.order_status || "Pending";
      const isPartial = Boolean(order.is_partial_return || orderStatus === "Partial");

      items.forEach((item: any, idx: number) => {
        const prod = item.product || {};
        const title = item.product_title_snapshot || prod.title || "Product";
        const sku = item.sku_snapshot || prod.sku || item.sku || "—";
        const optionLabel = item.option_label_snapshot || [item.size_label, item.color_label].filter(Boolean).join(" / ");
        const thumb = prod.product_thumbnail_img || item.product_thumbnail || null;
        const unitPrice = Number(item.unit_price || item.purchase_price || 0);
        const qty = Number(item.qty || 1);
        const returnQty = Number(item.return_received_qty || 0);

        list.push({
          key: `${order.id}-${item.id || idx}-${sku}`,
          order_id: order.id,
          order_no: orderNo,
          order_date: orderDate,
          order_status: orderStatus,
          is_partial_return: isPartial,
          product_id: item.product_id || prod.id || 0,
          product_title: title,
          sku,
          option_label: optionLabel,
          thumbnail: thumb,
          unit_price: unitPrice,
          qty,
          total_price: unitPrice * qty,
          return_received_qty: returnQty,
        });
      });
    });

    return list;
  }, [orders]);

  // Status counts for pills
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: allProductItems.length };
    allProductItems.forEach((item) => {
      const s = item.order_status;
      if (s) {
        counts[s] = (counts[s] || 0) + 1;
      }
      if ((item.is_partial_return || item.return_received_qty > 0) && s !== "Partial") {
        counts["Partial"] = (counts["Partial"] || 0) + 1;
      }
    });
    return counts;
  }, [allProductItems]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy]);

  // Filtered and sorted products
  const filteredProducts = React.useMemo(() => {
    let result = [...allProductItems];

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter((item) => {
        if (statusFilter === "Partial") {
          return item.order_status === "Partial" || item.is_partial_return || item.return_received_qty > 0;
        }
        return item.order_status?.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.product_title.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.order_no.toLowerCase().includes(q) ||
          item.option_label.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
        case "price-desc":
          return b.total_price - a.total_price;
        case "price-asc":
          return a.total_price - b.total_price;
        case "qty-desc":
          return b.qty - a.qty;
        case "date-desc":
        default:
          return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      }
    });

    return result;
  }, [allProductItems, statusFilter, search, sortBy]);

  const totalItems = filteredProducts.length;
  const paginatedProducts = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // Aggregate metrics
  const totalQtyOrdered = allProductItems.reduce((acc, p) => acc + p.qty, 0);
  const totalValueOrdered = allProductItems.reduce((acc, p) => acc + p.total_price, 0);
  const deliveredQty = allProductItems.filter((p) => p.order_status === "Delivered").reduce((acc, p) => acc + p.qty, 0);
  const returnedQty = allProductItems.reduce((acc, p) => acc + p.return_received_qty, 0);


  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span>Product-wise Purchased Items</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Breakdown of every individual product purchased across all customer orders, filtered by delivery status.
            </CardDescription>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs bg-muted/40 border rounded-lg px-3 py-1.5 self-start sm:self-auto">
            <div>
              <span className="text-muted-foreground">Total Units: </span>
              <strong className="text-foreground">{totalQtyOrdered}</strong>
            </div>
            <span>·</span>
            <div>
              <span className="text-muted-foreground">Delivered: </span>
              <strong className="text-emerald-600 dark:text-emerald-400">{deliveredQty}</strong>
            </div>
            {returnedQty > 0 && (
              <>
                <span>·</span>
                <div>
                  <span className="text-muted-foreground">Returned: </span>
                  <strong className="text-amber-600 dark:text-amber-400">{returnedQty}</strong>
                </div>
              </>
            )}
            <span>·</span>
            <div>
              <span className="text-muted-foreground">Total: </span>
              <strong className="text-primary">৳{totalValueOrdered.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Status Filter Horizontal Pills (Exact Valid Order Statuses) */}
        <div className="pt-2 border-t">
          <OrderStatusPills
            selectedStatus={statusFilter}
            onSelectStatus={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
            statusCounts={statusCounts}
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search product title, SKU, order no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Order */}
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="h-8 text-xs w-[140px] gap-1.5">
                <ArrowUpDown className="size-3 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc" className="text-xs">Newest Date</SelectItem>
                <SelectItem value="date-asc" className="text-xs">Oldest Date</SelectItem>
                <SelectItem value="price-desc" className="text-xs">Highest Value</SelectItem>
                <SelectItem value="price-asc" className="text-xs">Lowest Value</SelectItem>
                <SelectItem value="qty-desc" className="text-xs">Highest Qty</SelectItem>
              </SelectContent>
            </Select>

            {(statusFilter !== "ALL" || search) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2"
                onClick={() => {
                  setStatusFilter("ALL");
                  setSearch("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      <ExcelExportButton module="crm" title="Customer product-orders" />
      </CardHeader>

      <CardContent className="p-0">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center gap-2 text-muted-foreground">
            <Package className="size-8 stroke-1 text-muted-foreground/60" />
            <p className="text-sm font-medium">No products match the selected criteria.</p>
            <p className="text-xs text-muted-foreground">
              Try switching the delivery status filter or clearing your search term.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[45px] pl-4">#</TableHead>
                    <TableHead className="min-w-[220px]">Product Details</TableHead>
                    <TableHead className="min-w-[140px]">Order Info</TableHead>
                    <TableHead className="min-w-[120px]">Delivery Status</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                    <TableHead className="w-[50px] pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((item, idx) => {
                    const imageUrl = getImageUrl(item.thumbnail);
                    const dt = formatOrderDateTime(item.order_date);
                    const globalIdx = (page - 1) * pageSize + idx + 1;

                    return (
                      <TableRow key={item.key} className="hover:bg-muted/30">
                        {/* Index */}
                        <TableCell className="pl-4 text-xs font-mono text-muted-foreground">
                          {globalIdx}
                        </TableCell>

                        {/* Product Details */}
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
                              <p className="text-xs font-semibold text-foreground truncate max-w-[260px]" title={item.product_title}>
                                {item.product_title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
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

                        {/* Order Info */}
                        <TableCell>
                          <Link
                            href={`/dashboard/orders/${item.order_no}`}
                            className="font-mono text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <span>{item.order_no}</span>
                            <ExternalLink className="size-2.5 opacity-60" />
                          </Link>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {dt.date} {dt.time && `· ${dt.time}`}
                          </div>
                        </TableCell>

                        {/* Delivery Status */}
                        <TableCell>
                          <div className="space-y-1">
                            <OrderStatusBadge
                              status={item.order_status}
                              isPartial={item.is_partial_return || item.return_received_qty > 0}
                            />
                            {item.return_received_qty > 0 && (
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                                <span>({item.return_received_qty} returned)</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Unit Price */}
                        <TableCell className="text-right text-xs font-medium text-foreground">
                          ৳{item.unit_price.toLocaleString()}
                        </TableCell>

                        {/* Qty */}
                        <TableCell className="text-center text-xs font-semibold">
                          <span className="bg-muted px-2 py-0.5 rounded border">
                            {item.qty} pcs
                          </span>
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right text-xs font-bold text-foreground">
                          ৳{item.total_price.toLocaleString()}
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
