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
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MessageSquare, Search, Trash } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Message = {
  id: string;
  name: string;
  subject: string;
  message: string;
  date: string;
};

const initialData: Message[] = [
  {
    id: "MSG-1",
    name: "John Doe",
    subject: "Product Inquiry",
    message: "I would like to know more about your premium features.",
    date: "2026-05-21",
  },
  {
    id: "MSG-2",
    name: "Jane Smith",
    subject: "Support Request",
    message: "I am having trouble logging into my account.",
    date: "2026-05-20",
  },
  {
    id: "MSG-3",
    name: "Acme Corp",
    subject: "Partnership Opportunity",
    message: "We are interested in integrating your API with our platform.",
    date: "2026-05-18",
  },
  {
    id: "MSG-4",
    name: "Alice Johnson",
    subject: "Feedback",
    message: "The new UI looks absolutely fantastic, great job!",
    date: "2026-05-15",
  },
];

export function MessagesTable() {
  const [data, setData] = React.useState<Message[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((msg) => msg.id !== id));
    toast.success("Message deleted successfully.");
  };

  const columns: ColumnDef<Message>[] = [
    {
      id: "slNo",
      header: "SL No",
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium whitespace-nowrap">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => <div className="font-semibold">{row.getValue("subject")}</div>,
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate md:max-w-[450px]" title={row.getValue("message")}>
          {row.getValue("message")}
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("date")}</div>,
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const message = row.original;

        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this message from {message.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleDelete(message.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">All Messages</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount} messages
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => {
                  table.getColumn("name")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
            <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No messages found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search to find what you're looking for.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 pb-1">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {table.getFilteredRowModel().rows.length} message(s).
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="hidden text-sm font-medium sm:block">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
