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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Monitor, PhoneCall, Trash, Ban, ShieldCheck, RefreshCw, Search, Download, ArrowUpDown } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type BlockEntry = {
  id: string;
  type: "IP" | "Phone";
  value: string;
  reason: string;
  status: "Active" | "Inactive";
  blockedAt: string;
  expires: string;
};

const initialData: BlockEntry[] = [
  {
    id: "1",
    type: "IP",
    value: "::1",
    reason: "-",
    status: "Inactive",
    blockedAt: "23 Apr 2026\n05:23 AM",
    expires: "Permanent",
  },
  {
    id: "2",
    type: "Phone",
    value: "01111111111",
    reason: "-",
    status: "Active",
    blockedAt: "22 Apr 2026\n11:49 AM",
    expires: "Permanent",
  },
  {
    id: "3",
    type: "Phone",
    value: "0888888",
    reason: "fraud",
    status: "Active",
    blockedAt: "22 Apr 2026\n11:47 AM",
    expires: "Permanent",
  },
  {
    id: "4",
    type: "IP",
    value: "114.129.14.97",
    reason: "-",
    status: "Inactive",
    blockedAt: "09 Apr 2026\n11:48 AM",
    expires: "Permanent",
  },
  {
    id: "5",
    type: "Phone",
    value: "01559907883",
    reason: "-",
    status: "Inactive",
    blockedAt: "09 Apr 2026\n11:13 AM",
    expires: "Permanent",
  },
  {
    id: "6",
    type: "Phone",
    value: "01944667441",
    reason: "-",
    status: "Inactive",
    blockedAt: "09 Apr 2026\n11:12 AM",
    expires: "Permanent",
  },
];

function exportToExcel(data: BlockEntry[]) {
  const headers = ["ID", "Type", "Blocked Value", "Reason", "Status", "Blocked At", "Expires"];
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      [row.id, row.type, `"${row.value}"`, `"${row.reason}"`, row.status, `"${row.blockedAt.replace(/\n/g, " ")}"`, row.expires].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "blocklist.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export function BlocklistTable() {
  const [data, setData] = React.useState<BlockEntry[]>(initialData);
  const [activeTypeFilter, setActiveTypeFilter] = React.useState<string>("All Types");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((item) => item.id !== id));
    toast.success("Entry deleted successfully.");
  };

  const toggleStatus = (id: string) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" }
          : item
      )
    );
    toast.success("Status updated.");
  };

  const columns: ColumnDef<BlockEntry>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex items-center gap-1.5 font-medium">
            {type === "IP" ? <Monitor className="size-4" /> : <PhoneCall className="size-4" />}
            <span>{type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Blocked Value",
      cell: ({ row }) => <div className="font-medium">{row.getValue("value")}</div>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => <div className="text-muted-foreground italic">{row.getValue("reason")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "Active" ? "default" : "outline"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "blockedAt",
      header: "Blocked At",
      cell: ({ row }) => (
        <div className="whitespace-pre-line text-sm text-muted-foreground leading-tight">
          {row.getValue("blockedAt")}
        </div>
      ),
    },
    {
      accessorKey: "expires",
      header: "Expires",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("expires")}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="flex w-full justify-end">Actions</div>,
      cell: ({ row }) => {
        const entry = row.original;
        const isActive = entry.status === "Active";

        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleStatus(entry.id)}
            >
              <RefreshCw className="mr-2 size-4" />
              {isActive ? "Unblock" : "Re-block"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 size-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Block Entry</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this block for {entry.value}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
        <CardTitle className="font-normal text-muted-foreground text-sm">All Blocked Entries</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {totalCount > 0 ? `${totalCount} entries` : "No entries"}
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
        {/* Top Filters Block */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search phone or IP..."
                value={(table.getColumn("value")?.getFilterValue() as string) ?? ""}
                onChange={(event) => {
                  table.getColumn("value")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(value) => {
                if (!value) return;
                setActiveTypeFilter(value);
                table.getColumn("type")?.setFilterValue(value === "All Types" ? undefined : value);
                table.setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={activeTypeFilter}
            >
              {["All Types", "IP", "Phone"].map((filter) => (
                <ToggleGroupItem key={filter} value={filter}>
                  {filter}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            
            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) => {
                table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => table.getColumn("id")?.toggleSorting(table.getColumn("id")?.getIsSorted() === "asc")}
            >
              <ArrowUpDown />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Ban className="size-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">No blocked entries found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(v) => table.setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button size="icon-sm" variant="outline" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <ChevronsLeft />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
