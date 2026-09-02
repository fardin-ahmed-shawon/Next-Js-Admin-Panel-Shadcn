"use client";

import * as React from "react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Archive,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Edit,
  MoreHorizontal,
  Search,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { type ExpenseData, ExpenseDialog } from "./expense-dialog";
import useExpenses from "@/hooks/useExpenses";
import useExpenseCategories from "@/hooks/useExpenseCategories";
import { fetchClient } from "@/lib/fetch-client";

/* ---- Types ---- */

export type ExpenseItem = {
  id: number;
  title: string;
  expense_category_id: number;
  amount: number;
  description: string | null;
  expense_date?: string;
  date?: string;
  created_at?: string;
};

/* ---- Columns ---- */

const columns: ColumnDef<ExpenseItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-10">
        <Checkbox
          aria-label="Select all expenses"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-10">
        <Checkbox
          aria-label={`Select expense ${row.original.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.title} ${row.id}`,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: "Expense ID",
    cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.original.id}</span>,
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const dateStr = row.original.expense_date || row.original.date || row.original.created_at;
      return (
        <span className="text-muted-foreground tabular-nums">
          {dateStr ? new Date(dateStr.replace("Z", "")).toLocaleDateString() : "N/A"}
        </span>
      );
    },
  },
  {
    accessorKey: "expense_category_id",
    header: "Category",
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const categories = meta?.categories || [];
      const category = categories.find((c: any) => c.id === row.original.expense_category_id);
      return (
        <span className="font-medium">{category ? category.title : `ID: ${row.original.expense_category_id}`}</span>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title / Description",
    cell: ({ row }) => <span>{row.original.title}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium text-destructive">৳{Number(row.original.amount).toLocaleString()}</span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="flex w-full justify-end">Actions</div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex w-full justify-end">
                <Button aria-label="Open actions" size="icon-sm" variant="ghost">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => meta?.onEdit(row.original)}>
                <Edit className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => meta?.onDelete(row.original.id)}
              >
                <Trash className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
  },
];

/* ---- Main Table Component ---- */

export function ExpensesTable() {
  const { expenses, isLoading, mutate } = useExpenses();
  const { expenseCategories } = useExpenseCategories();

  const [rowSelection, setRowSelection] = React.useState({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [editData, setEditData] = React.useState<ExpenseData | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = React.useState(false);

  const handleEdit = (expense: ExpenseItem) => {
    setEditData({
      id: expense.id,
      title: expense.title,
      expense_category_id: expense.expense_category_id,
      amount: expense.amount,
      description: expense.description || "",
      expense_date: expense.expense_date || expense.date || (expense.created_at ? expense.created_at.split("T")[0].split(" ")[0] : ""),
      created_at: expense.created_at,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const endpoint = process.env.NEXT_PUBLIC_API_EXPENSES_URL || "expenses";
      const res = await fetchClient(`${baseUrl}${endpoint}/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete");
      }
      toast.success(data.message || "Expense deleted successfully");
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleBulkDelete = async () => {
    setIsDeletingBulk(true);
    const selectedRows = table.getSelectedRowModel().rows;
    let deletedCount = 0;

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const endpoint = process.env.NEXT_PUBLIC_API_EXPENSES_URL || "expenses";

      for (const row of selectedRows) {
        const id = row.original.id;
        const res = await fetchClient(`${baseUrl}${endpoint}/${id}`, {
          method: "DELETE",
        });
        if (res.ok) deletedCount++;
      }
      toast.success(`Successfully deleted ${deletedCount} expenses.`);
      setRowSelection({});
      mutate();
    } catch (error: any) {
      toast.error("An error occurred during bulk deletion");
    } finally {
      setIsDeletingBulk(false);
      setBulkDeleteOpen(false);
    }
  };

  const exportToExcel = (data: ExpenseItem[]) => {
    const headers = ["Expense ID", "Date", "Category", "Title", "Amount", "Description"];
    const csvRows = [
      headers.join(","),
      ...data.map((row) => {
        const cat = expenseCategories.find((c: any) => c.id === row.expense_category_id);
        const catName = cat ? cat.title : `ID: ${row.expense_category_id}`;
        return [
          row.id,
          row.created_at ? new Date(row.created_at.replace("Z", "")).toLocaleDateString() : "",
          `"${catName}"`,
          `"${row.title}"`,
          row.amount,
          `"${row.description || ""}"`,
        ].join(",");
      }),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const table = useReactTable({
    data: expenses || [],
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      columnVisibility: { search: false },
      pagination,
    },
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onEdit: handleEdit,
      onDelete: handleDelete,
      categories: expenseCategories,
    },
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const selectedCount = table.getSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  const countDescription = selectedCount > 0 ? `${selectedCount} of ${totalCount} selected` : `${totalCount} records`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">All Expenses</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {countDescription}
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(table.getFilteredRowModel().rows.map((r) => r.original))}
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.getColumn("id")?.toggleSorting(table.getColumn("id")?.getIsSorted() === "asc")}
            >
              <ArrowUpDown className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      className="capitalize"
                      onClick={() => col.toggleVisibility(!col.getIsVisible())}
                    >
                      <Checkbox checked={col.getIsVisible()} className="mr-2" />
                      {col.id}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bulk delete bar */}
        {selectedCount > 0 && (
          <div className="mx-4 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-2">
            <span className="text-sm font-medium">{selectedCount} record(s) selected</span>
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
                  <DialogTitle>Delete {selectedCount} record(s)?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The selected expenses will be permanently removed.
                  </DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isDeletingBulk}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button variant="destructive" disabled={isDeletingBulk} onClick={handleBulkDelete}>
                      {isDeletingBulk ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="bg-muted/50 border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <Archive className="size-6 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">No expenses found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              value={`${pagination.pageSize}`}
              onValueChange={(v) => setPagination((p) => ({ ...p, pageSize: Number(v), pageIndex: 0 }))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground mr-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </p>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editData}
        mode="edit"
        onSuccess={() => mutate()}
      />
    </Card>
  );
}
