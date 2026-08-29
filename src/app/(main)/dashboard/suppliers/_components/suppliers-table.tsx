"use client";

import * as React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Loader2,
  MoreHorizontal,
  Package,
  Search,
  Trash,
  Building2,
  Boxes,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditSupplierDialog } from "./edit-supplier-dialog";

export interface SupplierItem {
  id: number;
  name: string;
  inventory_lots_count?: number;
  total_procured_qty?: number | string | null;
  total_remaining_qty?: number | string | null;
  created_at: string;
  updated_at: string;
}

interface SuppliersTableProps {
  data: SupplierItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (search: string) => void;
  onDeleteSupplier: (id: number) => Promise<void>;
  onUpdateSupplier: (id: number, data: { name: string }) => Promise<boolean>;
}

export function SuppliersTable({
  data,
  loading,
  page,
  totalPages,
  totalRecords,
  onPageChange,
  searchTerm,
  onSearchChange,
  onDeleteSupplier,
  onUpdateSupplier,
}: SuppliersTableProps) {
  const [editingSupplier, setEditingSupplier] = React.useState<SupplierItem | null>(null);
  const [supplierToDelete, setSupplierToDelete] = React.useState<SupplierItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    setDeleting(true);
    try {
      await onDeleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4 flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="font-normal text-muted-foreground text-sm">All Suppliers</CardTitle>
            <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
              {totalRecords} suppliers registered
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 border-b border-border pb-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search suppliers by name..."
                className="h-8 w-64 rounded-[min(var(--radius-md),12px)] pl-8"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px] pl-6">ID</TableHead>
                  <TableHead className="min-w-[220px]">Supplier Name</TableHead>
                  <TableHead className="text-center w-[160px]">Procurement Lots</TableHead>
                  <TableHead className="text-center w-[180px]">Total Units Procured</TableHead>
                  <TableHead className="w-[160px]">Joined Date</TableHead>
                  <TableHead className="pr-6 w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span>Loading suppliers...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
                        <Building2 className="size-10 text-muted-foreground/50 stroke-[1.5]" />
                        <span className="font-medium text-base">No suppliers found</span>
                        <p className="text-sm max-w-sm text-center">
                          {searchTerm
                            ? "No suppliers match your search criteria."
                            : "No suppliers registered yet. Click 'Add Supplier' above to create one."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((supplier) => (
                    <TableRow key={supplier.id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="pl-6 font-mono text-xs font-semibold text-muted-foreground">
                        SUP-{supplier.id.toString().padStart(3, "0")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                            {supplier.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {supplier.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">
                          <Package className="mr-1 size-3 text-muted-foreground" />
                          {supplier.inventory_lots_count ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 font-mono text-xs text-foreground">
                          <Boxes className="size-3.5 text-muted-foreground" />
                          <span>{Number(supplier.total_procured_qty || 0).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>{formatDate(supplier.created_at)}</span>
                        </div>
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
                            <DropdownMenuItem
                              onClick={() => setEditingSupplier(supplier)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setSupplierToDelete(supplier)}
                              className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/50"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-between gap-4 px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {data.length} of {totalRecords} suppliers
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground mr-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onPageChange(1)}
                  disabled={page === 1 || loading}
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onPageChange(Math.max(page - 1, 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages || loading}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => onPageChange(totalPages)}
                  disabled={page === totalPages || loading}
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Supplier Dialog */}
      <EditSupplierDialog
        supplier={editingSupplier}
        open={!!editingSupplier}
        onOpenChange={(open) => !open && setEditingSupplier(null)}
        onUpdateSupplier={onUpdateSupplier}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!supplierToDelete} onOpenChange={(open) => !open && setSupplierToDelete(null)}>
        <DialogContent>
          <DialogTitle>Delete Supplier "{supplierToDelete?.name}"?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this supplier? Any associated inventory lots will remain safe and their supplier reference will be set to No Supplier.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Supplier"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
