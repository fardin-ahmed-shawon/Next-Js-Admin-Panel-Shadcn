"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchClient } from "@/lib/fetch-client";
import { CapitalItem, CapitalPagination } from "@/hooks/useCapitals";
import { CapitalDialog } from "./capital-dialog";

interface CapitalTableProps {
  capitals: CapitalItem[];
  pagination: CapitalPagination;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (val: string) => void;
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  onRefresh: () => void;
}

export function CapitalTable({
  capitals,
  pagination,
  isLoading,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  page,
  setPage,
  perPage,
  setPerPage,
  onRefresh,
}: CapitalTableProps) {
  const [selectedForEdit, setSelectedForEdit] = React.useState<CapitalItem | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<CapitalItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const res = await fetchClient(`${baseUrl}capitals/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(typeof window !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete record.");
      }

      toast.success("Record deleted successfully.");
      setDeleteTarget(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  const downloadCSV = () => {
    if (!capitals.length) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Date",
      "Type",
      "Trx ID",
      "Person / Party",
      "Purpose / Title",
      "Payment Channel",
      "Amount In (+)",
      "Amount Out (-)",
      "Notes",
      "Created By",
    ];

    const rows = capitals.map((item) => {
      const isOut = item.type === "cash_out" || item.type === "out";
      return [
        item.date || item.created_at,
        isOut ? "Cash Out" : "Cash In",
        item.trx_id || (isOut ? `COUT-${item.id}` : `CIN-${item.id}`),
        item.investor_name || (isOut ? "Drawing / Withdrawal" : "General Capital"),
        item.title || (isOut ? "Cash Outflow" : "Capital Inflow"),
        item.payment_method || "Cash",
        !isOut ? item.amount : "0",
        isOut ? item.amount : "0",
        `"${(item.description || "").replace(/"/g, '""')}"`,
        item.user?.full_name || item.user?.name || "Admin",
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cash_flow_report_${format(new Date(), "yyyy_MM_dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded");
  };

  return (
    <>
      <Card className="border bg-card shadow-sm">
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Cash In & Cash Out History</CardTitle>
              <CardDescription className="text-xs">
                Ledger of equity injections, capital additions, and owner drawings/withdrawals.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRefresh} className="h-8 gap-1.5 text-xs">
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCSV} className="h-8 gap-1.5 text-xs">
                <Download className="size-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by party, title, trx..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              {/* Type Filter Toggle */}
              <ToggleGroup
                type="single"
                size="sm"
                value={typeFilter}
                onValueChange={(val) => {
                  if (val) {
                    setTypeFilter(val);
                    setPage(1);
                  }
                }}
                className="bg-muted p-0.5 rounded-md"
              >
                <ToggleGroupItem value="all" className="text-xs px-2.5 h-7">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="cash_in" className="text-xs px-2.5 h-7 text-emerald-600 dark:text-emerald-400">
                  Cash In
                </ToggleGroupItem>
                <ToggleGroupItem value="cash_out" className="text-xs px-2.5 h-7 text-rose-600 dark:text-rose-400">
                  Cash Out
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={paymentMethodFilter}
                onValueChange={(val) => {
                  setPaymentMethodFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Channels</SelectItem>
                  <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                  <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                  <SelectItem value="bKash" className="text-xs">bKash</SelectItem>
                  <SelectItem value="Nagad" className="text-xs">Nagad</SelectItem>
                  <SelectItem value="Rocket" className="text-xs">Rocket</SelectItem>
                  <SelectItem value="Cheque" className="text-xs">Cheque</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={perPage.toString()}
                onValueChange={(val) => {
                  setPerPage(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10" className="text-xs">10 / page</SelectItem>
                  <SelectItem value="15" className="text-xs">15 / page</SelectItem>
                  <SelectItem value="25" className="text-xs">25 / page</SelectItem>
                  <SelectItem value="50" className="text-xs">50 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto border-t">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[60px] text-center text-xs">#</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Trx ID / Ref</TableHead>
                  <TableHead className="text-xs">Source / Recipient</TableHead>
                  <TableHead className="text-xs">Purpose / Title</TableHead>
                  <TableHead className="text-xs">Channel</TableHead>
                  <TableHead className="text-right text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Recorded By</TableHead>
                  <TableHead className="w-[60px] text-right text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={11} className="py-4">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : capitals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                          <Wallet className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No cash flow records found</p>
                        <p className="text-xs text-muted-foreground">
                          Click "Record Cash In / Out" above to add your first transaction.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  capitals.map((item, idx) => {
                    const rowNumber = (pagination.current_page - 1) * pagination.per_page + idx + 1;
                    const dateDisplay = item.date
                      ? format(new Date(item.date), "dd MMM yyyy")
                      : format(new Date(item.created_at), "dd MMM yyyy");
                    const isOut = item.type === "cash_out" || item.type === "out";

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {rowNumber}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs font-medium whitespace-nowrap">
                          {dateDisplay}
                        </TableCell>

                        {/* Type Badge */}
                        <TableCell className="whitespace-nowrap">
                          {isOut ? (
                            <Badge
                              variant="outline"
                              className="border-rose-500/40 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold text-[11px]"
                            >
                              Cash Out
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold text-[11px]"
                            >
                              Cash In
                            </Badge>
                          )}
                        </TableCell>

                        {/* Trx ID */}
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="outline" className="font-mono text-[11px] font-normal">
                            {item.trx_id || (isOut ? `COUT-${item.id}` : `CIN-${item.id}`)}
                          </Badge>
                        </TableCell>

                        {/* Source / Recipient */}
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <User className="size-3.5 text-muted-foreground" />
                            <span>{item.investor_name || (isOut ? "General Drawing" : "General / Owner")}</span>
                          </div>
                        </TableCell>

                        {/* Title / Purpose */}
                        <TableCell className="text-xs text-muted-foreground">
                          {item.title || (isOut ? "Cash Outflow" : "Capital Inflow")}
                        </TableCell>

                        {/* Channel */}
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 text-[11px]"
                          >
                            {item.payment_method || "Cash"}
                          </Badge>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right whitespace-nowrap">
                          {isOut ? (
                            <div className="inline-flex items-center justify-end gap-1 font-bold text-rose-600 dark:text-rose-400">
                              <ArrowUpRight className="size-3.5" />
                              <span>−৳{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-end gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <ArrowDownRight className="size-3.5" />
                              <span>+৳{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </TableCell>

                        {/* Description */}
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={item.description || ""}>
                          {item.description || "-"}
                        </TableCell>

                        {/* Recorded By */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.user?.full_name || item.user?.name || "Admin"}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-xs"
                                onClick={() => {
                                  setSelectedForEdit(item);
                                  setEditOpen(true);
                                }}
                              >
                                <Edit2 className="size-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="size-3.5" />
                                Delete
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

          {/* Pagination Footer */}
          {pagination.total > 0 && (
            <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between border-t text-xs text-muted-foreground">
              <div>
                Showing {pagination.from || 1} to {pagination.to || pagination.total} of {pagination.total} entries
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                >
                  <ChevronsLeft className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <span className="px-2 font-medium text-foreground">
                  Page {page} of {pagination.last_page || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page >= (pagination.last_page || 1)}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7"
                  disabled={page >= (pagination.last_page || 1)}
                  onClick={() => setPage(pagination.last_page || 1)}
                >
                  <ChevronsRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <CapitalDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={selectedForEdit}
        mode="edit"
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTarget?.type === "cash_out" || deleteTarget?.type === "out" ? "Cash Out" : "Cash In"} Entry?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteTarget?.type === "cash_out" || deleteTarget?.type === "out" ? "cash withdrawal" : "cash injection"} of{" "}
              <strong>৳{Number(deleteTarget?.amount || 0).toLocaleString()}</strong>? This transaction will also be removed
              from your cash flow calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
