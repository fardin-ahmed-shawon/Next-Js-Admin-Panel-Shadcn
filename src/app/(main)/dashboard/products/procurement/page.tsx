"use client";

import * as React from "react";
import { Calendar, Layers, Loader2, Package, Tag, User2, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchClient } from "@/lib/fetch-client";
import { ProcurementModal } from "./_components/procurement-modal";

interface Lot {
  id: number;
  product_id: number;
  product_variant_id: number | null;
  purchase_price: number;
  initial_qty: number;
  remaining_qty: number;
  source_type: string;
  source_name: string | null;
  comment: string | null;
  created_at: string;
  product?: {
    id: number;
    title: string;
  } | null;
  variant?: {
    id: number;
    sku: string;
    size?: { id: number; label: string } | null;
    color?: { id: number; label: string } | null;
  } | null;
  user?: {
    id: number;
    full_name: string;
  } | null;
}

export default function ProcurementPage() {
  const [lots, setLots] = React.useState<Lot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalRecords, setTotalRecords] = React.useState(0);

  const fetchLots = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots?page=${page}&per_page=15`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setLots(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
        setTotalRecords(data.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch lots:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getSourceBadge = (type: string) => {
    switch (type) {
      case "vendor":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none font-medium">Vendor / Purchase</Badge>;
      case "return":
        return <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border-none font-medium">Customer Return</Badge>;
      case "adjustment":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-none font-medium">Stock Adjustment</Badge>;
      default:
        return <Badge variant="secondary" className="font-medium">{type}</Badge>;
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-3xl tracking-tight">Purchase & Procurement</h1>
          <p className="text-muted-foreground text-sm">
            Track stock lot acquisitions, vendor deliveries, returns, and inventory adjustments.
          </p>
        </div>
        <div>
          <ProcurementModal onSuccess={fetchLots} />
        </div>
      </div>

      {/* Main Card Table */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Procured Lots History</CardTitle>
            <CardDescription>
              A historical log of all inventory lots created and their remaining balance.
            </CardDescription>
          </div>
          <div className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground text-xs">
            {totalRecords} Lots Total
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] pl-6">Lot ID</TableHead>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead className="min-w-[200px]">Product / Variant</TableHead>
                  <TableHead className="min-w-[150px]">SKU</TableHead>
                  <TableHead>Source Details</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-center w-[120px]">Stock Status</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead className="pr-6 w-[200px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span>Loading lot transaction logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : lots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                        <Package className="size-10 text-muted-foreground/50 stroke-[1.5]" />
                        <span className="font-medium text-base">No lots found</span>
                        <p className="text-sm max-w-sm text-center">
                          There are no inventory lot entries recorded. Click the button above to procure your first stock lot.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  lots.map((lot) => {
                    const variantLabel = lot.variant
                      ? [
                          lot.variant.size?.label && `Size: ${lot.variant.size.label}`,
                          lot.variant.color?.label && `Color: ${lot.variant.color.label}`,
                        ]
                          .filter(Boolean)
                          .join(" / ")
                      : "";

                    return (
                      <TableRow key={lot.id} className="group transition-colors hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground pl-6">
                          #{lot.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <Calendar className="size-3.5" />
                            <span>{formatDate(lot.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                              {lot.product?.title || "Unknown Product"}
                            </span>
                            {variantLabel ? (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Layers className="size-3" /> {variantLabel}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {lot.variant?.sku || lot.product?.id ? lot.variant?.sku || "Base Product" : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {getSourceBadge(lot.source_type)}
                            {lot.source_name ? (
                              <span className="text-xs text-muted-foreground pl-1">
                                Via: {lot.source_name}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground text-sm">
                          ৳{Number(lot.purchase_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-0.5 items-center justify-center">
                            <div className="flex items-center gap-1 font-mono text-xs">
                              <span className="font-semibold text-primary">{lot.remaining_qty}</span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-muted-foreground/70">{lot.initial_qty}</span>
                            </div>
                            {lot.remaining_qty === 0 ? (
                              <span className="text-[10px] text-red-500 font-medium">Consumed</span>
                            ) : lot.remaining_qty < lot.initial_qty ? (
                              <span className="text-[10px] text-amber-500 font-medium">Partially Used</span>
                            ) : (
                              <span className="text-[10px] text-emerald-500 font-medium">Unused</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User2 className="size-3.5" />
                            <span>{lot.user?.full_name || "System Seeder"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-6">
                          {lot.comment ? (
                            <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[200px] break-words">
                              <MessageSquare className="size-3.5 mt-0.5 shrink-0" />
                              <span>{lot.comment}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs italic">No comments</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <p className="text-muted-foreground text-xs">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
