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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  MapPin,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type OrderRow = {
  id: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  district: string;
};

type DistrictSummaryRow = {
  districtName: string;
  ordersCount: number;
  revenue: number;
  uniqueCustomersCount: number;
  itemsSold: number;
  avgOrderValue: number;
  percentageOfTotalSales: number;
};

const columns: ColumnDef<DistrictSummaryRow>[] = [
  {
    id: "search",
    accessorFn: (row) => row.districtName,
    filterFn: "includesString",
    enableHiding: true,
  },
  {
    accessorKey: "districtName",
    header: "DISTRICT",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="size-4 shrink-0 text-muted-foreground" />
        <span className="block font-medium text-sm leading-none">{row.original.districtName}</span>
      </div>
    ),
  },
  {
    accessorKey: "revenue",
    header: "SALES / REVENUE",
    cell: ({ row }) => (
      <div className="flex min-w-[120px] flex-col gap-1">
        <div className="font-semibold text-sm tabular-nums">৳{Math.round(row.original.revenue).toLocaleString()}</div>
        <div className="max-w-[140px] space-y-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(100, row.original.percentageOfTotalSales)}%` }}
            />
          </div>
          <p className="font-medium text-[10px] text-muted-foreground">
            {row.original.percentageOfTotalSales.toFixed(1)}% of total
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "ordersCount",
    header: "ORDERS",
    cell: ({ row }) => (
      <div className="font-semibold text-sm tabular-nums">{row.original.ordersCount.toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "uniqueCustomersCount",
    header: "BUYERS / CUSTOMERS",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground text-sm tabular-nums">
        {row.original.uniqueCustomersCount.toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "itemsSold",
    header: "PRODUCTS SOLD",
    cell: ({ row }) => (
      <div className="font-medium text-muted-foreground text-sm tabular-nums">
        {row.original.itemsSold.toLocaleString()} units
      </div>
    ),
  },
  {
    accessorKey: "avgOrderValue",
    header: "AVG. ORDER VALUE",
    cell: ({ row }) => (
      <div className="font-semibold text-sm tabular-nums">
        ৳{Math.round(row.original.avgOrderValue).toLocaleString()}
      </div>
    ),
  },
];

export function SalesReportsDistrictAnalysis({ data }: { data: OrderRow[] }) {
  // Aggregate sales data by district
  const districtSales = React.useMemo(() => {
    const totalCompanyRevenue = data.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
    const groups: Record<
      string,
      {
        ordersCount: number;
        revenue: number;
        customers: Set<string>;
        itemsSold: number;
      }
    > = {};

    for (const order of data) {
      const dist = order.district || "Unassigned";
      if (!groups[dist]) {
        groups[dist] = {
          ordersCount: 0,
          revenue: 0,
          customers: new Set(),
          itemsSold: 0,
        };
      }
      groups[dist].ordersCount += 1;
      groups[dist].revenue += Number(order.total ?? 0);
      if (order.phone) {
        groups[dist].customers.add(order.phone);
      } else if (order.customer) {
        groups[dist].customers.add(order.customer);
      }
      groups[dist].itemsSold += Number(order.items ?? 0);
    }

    return Object.entries(groups).map(([districtName, info]) => {
      const avg = info.ordersCount > 0 ? info.revenue / info.ordersCount : 0;
      const pct = totalCompanyRevenue > 0 ? (info.revenue / totalCompanyRevenue) * 100 : 0;
      return {
        districtName,
        ordersCount: info.ordersCount,
        revenue: info.revenue,
        uniqueCustomersCount: info.customers.size,
        itemsSold: info.itemsSold,
        avgOrderValue: avg,
        percentageOfTotalSales: pct,
      };
    });
  }, [data]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "revenue", desc: true }]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data: districtSales,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility: { search: false },
      pagination,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const sortValue = React.useMemo(() => {
    const currentSort = sorting[0];
    if (!currentSort) return "highest_revenue";
    if (currentSort.id === "revenue" && currentSort.desc) return "highest_revenue";
    if (currentSort.id === "revenue" && !currentSort.desc) return "lowest_revenue";
    if (currentSort.id === "ordersCount" && currentSort.desc) return "highest_orders";
    return "highest_revenue";
  }, [sorting]);

  // Export district data to CSV
  const handleExportCSV = () => {
    const headers = [
      "District",
      "Orders Count",
      "Revenue (BDT)",
      "Unique Buyers",
      "Units Sold",
      "Average Order Value",
      "Percentage of Total Sales",
    ];
    const rows = districtSales.map((r) => [
      r.districtName,
      r.ordersCount,
      r.revenue.toFixed(0),
      r.uniqueCustomersCount,
      r.itemsSold,
      r.avgOrderValue.toFixed(0),
      `${r.percentageOfTotalSales.toFixed(2)}%`,
    ]);
    const csvContent = `data:text/csv;charset=utf-8,${[headers.join(","), ...rows.map((e) => e.join(","))].join("\n")}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `district_sales_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center justify-between leading-none">
          <span>District Sales Analysis</span>
        </CardTitle>
        <CardDescription>Sales, customers, and product metrics grouped by shipping district</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 rounded-lg pl-8"
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 size-4" />
                  Sort By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={sortValue}
                  onValueChange={(value) => {
                    let nextSorting: SortingState = [];
                    if (value === "highest_revenue") {
                      nextSorting = [{ id: "revenue", desc: true }];
                    } else if (value === "lowest_revenue") {
                      nextSorting = [{ id: "revenue", desc: false }];
                    } else if (value === "highest_orders") {
                      nextSorting = [{ id: "ordersCount", desc: true }];
                    }
                    table.setSorting(nextSorting);
                    table.setPageIndex(0);
                  }}
                >
                  <DropdownMenuRadioItem value="highest_revenue">Highest Revenue</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lowest_revenue">Lowest Revenue</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="highest_orders">Highest Order Volume</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader className="bg-muted/15">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan} className="h-11 p-3 font-medium">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <MapPin className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="font-medium text-sm">No districts found</p>
                        <p className="text-muted-foreground text-xs">
                          {searchQuery
                            ? "Try adjusting your search query."
                            : "There are no district records in this period."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-2">
          <div className="font-medium text-muted-foreground text-sm">Total {districtSales.length} district(s).</div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
