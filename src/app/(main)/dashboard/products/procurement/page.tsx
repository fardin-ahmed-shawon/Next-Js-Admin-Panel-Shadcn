"use client";

import * as React from "react";
import { Calendar, Layers, Loader2, Package, Tag, User2, MessageSquare, Search, MoreHorizontal, Edit, Trash, ArrowUpDown, Banknote, Boxes, PackageOpen, LayoutList, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ProcurementEditModal } from "./_components/procurement-edit-modal";

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
    product_thumbnail_img?: string | null;
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

const getImageUrl = (path: string | null | undefined) => {
  if (!path) return "https://placehold.co/80x80/1a1a2e/e0e0e0?text=No+Image";
  if (path.startsWith("http")) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";
  return `${baseUrl}${path}`;
};

export default function ProcurementPage() {
  const [lots, setLots] = React.useState<Lot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalRecords, setTotalRecords] = React.useState(0);
  
  // Stats & Filters
  const [stats, setStats] = React.useState({
    total_lots: 0,
    total_procured: 0,
    total_remaining: 0,
    total_invested: 0,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [sortValue, setSortValue] = React.useState("created_at-desc");
  const [timeRange, setTimeRange] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  
  // Modals & Actions State
  const [editingLot, setEditingLot] = React.useState<Lot | null>(null);
  const [viewCommentLot, setViewCommentLot] = React.useState<Lot | null>(null);
  const [lotToDelete, setLotToDelete] = React.useState<Lot | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchLots = React.useCallback(async () => {
    try {
      setLoading(true);
      const [sortBy, sortOrder] = sortValue.split("-");
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: "15",
        search: debouncedSearch,
        sort_by: sortBy,
        sort_order: sortOrder,
        time_range: timeRange,
        status: statusFilter,
      });

      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots?${queryParams.toString()}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setLots(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
        setTotalRecords(data.data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch lots:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortValue, timeRange, statusFilter]);

  React.useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const executeDelete = async (lot: Lot) => {
    try {
      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots/${lot.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Lot deleted successfully.");
        setLotToDelete(null);
        fetchLots();
      } else {
        toast.error(data.message || "Failed to delete lot.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting.");
    }
  };

  const executeBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter(id => rowSelection[id]).map(Number);
    if (selectedIds.length === 0) return;
    
    try {
      const res = await fetchClient(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}inventory/lots/bulk-delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || `${selectedIds.length} lot(s) deleted successfully.`);
        setRowSelection({});
        setBulkDeleteOpen(false);
        fetchLots();
      } else {
        toast.error(data.message || "Failed to delete lots.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting.");
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        time: d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    } catch {
      return { date: dateStr, time: "" };
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
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(val) => { setTimeRange(val); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="last_4_months">Last 4 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <ProcurementModal onSuccess={fetchLots} />
        </div>
      </div>

      {/* Stats Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Procurement Lots</CardTitle>
            <LayoutList className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_lots.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique stock entries</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Invested</CardTitle>
            <Banknote className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">৳{stats.total_invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Sum of all purchase costs</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units Procured</CardTitle>
            <PackageOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_procured.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime acquired quantity</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Units in Stock</CardTitle>
            <Boxes className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{stats.total_remaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current active unconsumed inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card Table */}
      <Card>
        <CardHeader className="pb-4 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="font-normal text-muted-foreground text-sm">All Lots</CardTitle>
            <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
              {totalRecords} lots found
            </CardDescription>
          </div>
          {/* We can add export here in the future if needed */}
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products or SKU..."
                  className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[140px] rounded-[min(var(--radius-md),12px)]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active (In Stock)</SelectItem>
                  <SelectItem value="consumed">Consumed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortValue} onValueChange={(v) => { setSortValue(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[180px] rounded-[min(var(--radius-md),12px)]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="purchase_price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="purchase_price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="remaining_qty-desc">Highest Remaining</SelectItem>
                  <SelectItem value="initial_qty-desc">Largest Lots</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk delete bar */}
          {Object.keys(rowSelection).length > 0 && (
            <div className="mx-4 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2 mb-4">
              <span className="text-sm font-medium">{Object.keys(rowSelection).length} lot(s) selected</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
                  Clear
                </Button>
                <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash className="mr-2 size-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Delete {Object.keys(rowSelection).length} lot(s)?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. The selected procurement lots will be permanently removed from your inventory records.
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={executeBulkDelete}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 pl-4">
                    <Checkbox 
                      aria-label="Select all lots" 
                      checked={lots.length > 0 && Object.keys(rowSelection).length === lots.length && lots.every(lot => rowSelection[lot.id])}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const newSelection = { ...rowSelection };
                          lots.forEach(lot => newSelection[lot.id] = true);
                          setRowSelection(newSelection);
                        } else {
                          setRowSelection({});
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-[100px]">Lot ID</TableHead>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead className="min-w-[200px]">Product / Variant</TableHead>
                  <TableHead className="min-w-[150px]">SKU</TableHead>
                  <TableHead>Source Details</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-center w-[120px]">Stock Status</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead className="w-[200px]">Notes</TableHead>
                  <TableHead className="pr-6 w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-64 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span>Loading lot transaction logs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : lots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                        <Package className="size-10 text-muted-foreground/50 stroke-[1.5]" />
                        <span className="font-medium text-base">No lots found</span>
                        <p className="text-sm max-w-sm text-center">
                          {debouncedSearch 
                            ? "No lots match your current search criteria."
                            : "There are no inventory lot entries recorded. Click the button above to procure your first stock lot."}
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
                        <TableCell className="pl-4">
                          <Checkbox 
                            aria-label={`Select lot ${lot.id}`} 
                            checked={!!rowSelection[lot.id]}
                            onCheckedChange={(checked) => {
                              setRowSelection(prev => {
                                const newSelection = { ...prev };
                                if (checked) {
                                  newSelection[lot.id] = true;
                                } else {
                                  delete newSelection[lot.id];
                                }
                                return newSelection;
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                          #{lot.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <Calendar className="size-3.5 text-muted-foreground" />
                              <span>{formatDateTime(lot.created_at).date}</span>
                            </div>
                            {formatDateTime(lot.created_at).time && (
                              <span className="text-muted-foreground pl-5">
                                {formatDateTime(lot.created_at).time}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className="size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                              <img src={getImageUrl(lot.product?.product_thumbnail_img)} alt={lot.product?.title || "Product"} className="size-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate block" title={lot.product?.title || ""}>
                                {lot.product?.title || "Unknown Product"}
                              </span>
                              {variantLabel ? (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 truncate block" title={variantLabel}>
                                  <Layers className="size-3 shrink-0" /> {variantLabel}
                                </span>
                              ) : null}
                            </div>
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
                            <span>{lot.user?.full_name || "System"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lot.comment ? (
                            <div 
                              className="flex items-start gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors group/note" 
                              onClick={() => setViewCommentLot(lot)}
                            >
                              <MessageSquare className="size-3.5 mt-0.5 shrink-0 group-hover/note:text-primary transition-colors" />
                              <span className="break-words">
                                {lot.comment.length > 15 ? lot.comment.slice(0, 15) + "..." : lot.comment}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs italic">No comments</span>
                          )}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setEditingLot(lot)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Lot</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setLotToDelete(lot)} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/50">
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete Lot</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between gap-4 px-4 py-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select disabled>
                  <SelectTrigger className="h-8 w-16">
                    <SelectValue placeholder="15" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground mr-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPage(1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || loading}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages || loading}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingLot && (
        <ProcurementEditModal
          lot={editingLot}
          open={!!editingLot}
          onOpenChange={(open) => {
            if (!open) setEditingLot(null);
          }}
          onSuccess={() => {
            fetchLots();
          }}
        />
      )}

      {/* View Comment Modal */}
      <Dialog open={!!viewCommentLot} onOpenChange={(open) => !open && setViewCommentLot(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Notes for Lot #{viewCommentLot?.id}</DialogTitle>
          <div className="bg-muted/50 p-4 rounded-md text-sm text-foreground whitespace-pre-wrap mt-2 max-h-[60vh] overflow-y-auto">
            {viewCommentLot?.comment}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Lot Modal */}
      <Dialog open={!!lotToDelete} onOpenChange={(open) => !open && setLotToDelete(null)}>
        <DialogContent>
          <DialogTitle>Delete Lot #{lotToDelete?.id}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This procurement lot will be permanently removed from your inventory records.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => lotToDelete && executeDelete(lotToDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
