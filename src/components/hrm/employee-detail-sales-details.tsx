"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  ShoppingBag,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  PackageCheck,
  Coins,
  ShoppingBag as OrderIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
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
import { useEmployeeReports, EmployeeReportOrder } from "@/hooks/useEmployeeReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TimeRange = "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily":
      return now.toISOString().slice(0, 10);
    case "weekly":
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    case "monthly":
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 10);
    case "4months":
      d.setMonth(d.getMonth() - 4);
      return d.toISOString().slice(0, 10);
    case "6months":
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0, 10);
    default:
      return "";
  }
}

export default function EmployeeReportDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const employeeId = params.employeeId ? Number(params.employeeId) : null;
  const timeRange = (searchParams.get("timeRange") as TimeRange) || "alltime";
  const customFrom = searchParams.get("from") || "";
  const customTo = searchParams.get("to") || "";

  const startDate = React.useMemo(() => {
    if (timeRange === "custom") return customFrom || undefined;
    if (timeRange === "alltime") return undefined;
    return getDateFrom(timeRange);
  }, [timeRange, customFrom]);

  const endDate = React.useMemo(() => {
    if (timeRange === "custom") return customTo || undefined;
    if (timeRange === "alltime") return undefined;
    return new Date().toISOString().slice(0, 10);
  }, [timeRange, customTo]);

  const { data: rawReports, isLoading } = useEmployeeReports(startDate, endDate);

  const employeeData = React.useMemo(() => {
    if (!rawReports || !employeeId) return null;
    return rawReports.find((r) => r.user_id === employeeId) || null;
  }, [rawReports, employeeId]);

  // Aggregate stats for this employee
  const stats = React.useMemo(() => {
    if (!employeeData) return { totalAssigned: 0, delivered: 0, collectedRevenue: 0, totalDue: 0, itemsHandled: 0 };

    let delivered = 0;
    let collectedRevenue = 0;
    let totalDue = 0;
    let itemsHandled = 0;

    employeeData.orders.forEach((order) => {
      const statusLower = order.order_status?.toLowerCase().replace(/[\s-]/g, "") || "";
      if (statusLower === "delivered") {
        delivered++;
      }

      const paidSum = order.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
      collectedRevenue += paidSum;
      totalDue += Math.max(0, Number(order.grand_total_amount || 0) - paidSum);

      order.ordered_products?.forEach((product) => {
        itemsHandled += product.qty;
      });
    });

    return {
      totalAssigned: employeeData.orders.length,
      delivered,
      collectedRevenue,
      totalDue,
      itemsHandled,
    };
  }, [employeeData]);

  // Expanded rows state
  const [expandedOrders, setExpandedOrders] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (orderNo: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNo]: !prev[orderNo],
    }));
  };

  // Table setup
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase().replace(/[\s-]/g, "") || "";
    if (["delivered", "readytoship", "incourier"].includes(s)) {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {status}
        </Badge>
      );
    }
    if (["cancelled", "fake", "trash", "lost", "returned"].includes(s)) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {status}
        </Badge>
      );
    }
    if (["pending", "hold", "shiplater", "missing"].includes(s)) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("full paid") || s === "paid") {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {status}
        </Badge>
      );
    }
    if (s.includes("partial")) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        {status}
      </Badge>
    );
  };

  const columns = React.useMemo<ColumnDef<EmployeeReportOrder>[]>(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => {
          const isExpanded = !!expandedOrders[row.original.order_no];
          return (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(row.original.order_no);
              }}
            >
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          );
        },
      },
      {
        id: "search",
        accessorFn: (row) => `${row.order_no}`,
        filterFn: "includesString",
        enableHiding: true,
      },
      {
        accessorKey: "order_no",
        header: "Order No",
        cell: ({ row }) => <span className="font-semibold text-primary">{row.original.order_no}</span>,
      },
      {
        accessorKey: "order_status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.original.order_status),
      },
      {
        accessorKey: "payment_status",
        header: "Payment Status",
        cell: ({ row }) => getPaymentStatusBadge(row.original.payment_status),
      },
      {
        accessorKey: "assigned_date",
        header: "Assigned Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">{format(new Date(row.original.assigned_date), "PP p")}</span>
        ),
      },
      {
        accessorKey: "grand_total_amount",
        header: "Grand Total",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">৳{row.original.grand_total_amount.toLocaleString()}</span>
        ),
      },
      {
        id: "collected_revenue",
        header: "Collected Revenue",
        cell: ({ row }) => {
          const paidSum = row.original.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
          return <span className="font-semibold text-emerald-600">৳{paidSum.toLocaleString()}</span>;
        },
      },
      {
        id: "due_amount",
        header: "Due Amount",
        cell: ({ row }) => {
          const paidSum = row.original.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
          const due = Math.max(0, Number(row.original.grand_total_amount || 0) - paidSum);
          return <span className="font-semibold text-red-600">৳{due.toLocaleString()}</span>;
        },
      },
    ],
    [expandedOrders],
  );

  const table = useReactTable({
    data: employeeData?.orders || [],
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit gap-2">
          <ArrowLeft className="size-4" /> Go Back
        </Button>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Employee Not Found</CardTitle>
            <CardDescription>
              We couldn't find details for the requested employee in the specified period.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const initials = employeeData.full_name.substring(0, 2).toUpperCase();

  const summaryStats = [
    {
      title: "Total Assigned",
      value: stats.totalAssigned.toString(),
      icon: OrderIcon,
      subtitle: "Orders delegated to employee",
      color: "text-foreground",
    },
    {
      title: "Successful Deliveries",
      value: stats.delivered.toString(),
      icon: PackageCheck,
      subtitle:
        stats.totalAssigned > 0
          ? `${Math.round((stats.delivered / stats.totalAssigned) * 100)}% delivery rate`
          : "No orders assigned",
      color: "text-emerald-600",
    },
    {
      title: "Collected Revenue",
      value: `৳${stats.collectedRevenue.toLocaleString()}`,
      icon: Coins,
      subtitle: "Accumulated paid amount",
      color: "text-primary",
    },
    {
      title: "Due Amount",
      value: `৳${stats.totalDue.toLocaleString()}`,
      icon: Coins,
      subtitle: "Accumulated due amount",
      color: "text-red-600",
    },
    {
      title: "Items Handled",
      value: stats.itemsHandled.toString(),
      icon: Package,
      subtitle: "Total products quantity handled",
      color: "text-purple-600",
    },
  ];

  const searchQuery = (table.getColumn("search")?.getFilterValue() as string) ?? "";
  const totalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Header and Back Button */}
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="w-fit gap-2">
          <ArrowLeft className="size-4" /> Back to Reports
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.full_name)}&background=random`}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {employeeData.full_name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{employeeData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-muted px-4 py-2.5 rounded-lg border text-sm text-muted-foreground font-medium w-fit">
            <Calendar className="size-4 text-primary" />
            <span>
              Period: {startDate ? format(new Date(startDate), "PP") : "All Time"} to{" "}
              {endDate ? format(new Date(endDate), "PP") : "Today"}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
        {summaryStats.map((stat, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                  <stat.icon className="size-4" />
                </div>
              </CardTitle>
              <CardDescription>{stat.title}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <div className={`font-medium text-3xl tabular-nums leading-none tracking-tight ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Container */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <OrderIcon className="size-5 text-primary" />
            Assigned Orders Breakdown
          </CardTitle>
          <CardDescription>Detailed list of all assigned orders &middot; {totalCount} total orders</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-64 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search orders by No..."
                value={searchQuery}
                onChange={(event) => {
                  table.getColumn("search")?.setFilterValue(event.target.value || undefined);
                  table.setPageIndex(0);
                }}
              />
            </div>

            <Button
              size="icon-sm"
              variant="outline"
              onClick={() =>
                table
                  .getColumn("grand_total_amount")
                  ?.toggleSorting(table.getColumn("grand_total_amount")?.getIsSorted() === "asc")
              }
            >
              <ArrowUpDown className="size-4" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
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
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => {
                    const isExpanded = !!expandedOrders[row.original.order_no];
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleExpand(row.original.order_no)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={columns.length} className="p-4 border-t border-b">
                              <div className="flex flex-col gap-6 pl-10 pr-4 py-2">
                                {/* Products Sub-table */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                                    <Package className="size-3.5" /> Items ({row.original.ordered_products?.length || 0}
                                    )
                                  </h4>
                                  {row.original.ordered_products && row.original.ordered_products.length > 0 ? (
                                    <div className="rounded-md border bg-background overflow-hidden max-w-2xl">
                                      <Table>
                                        <TableHeader className="bg-muted/40">
                                          <TableRow>
                                            <TableHead className="py-2 text-xs font-semibold">Product Name</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[80px]">
                                              Qty
                                            </TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[120px]">
                                              Unit Price
                                            </TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[120px]">
                                              Total
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {row.original.ordered_products.map((p, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="py-2 text-xs font-medium">
                                                {p.product_name || "Unknown Product"}
                                              </TableCell>
                                              <TableCell className="py-2 text-xs text-right font-medium">
                                                {p.qty}
                                              </TableCell>
                                              <TableCell className="py-2 text-xs text-right">
                                                ৳{p.unit_price.toLocaleString()}
                                              </TableCell>
                                              <TableCell className="py-2 text-xs text-right font-semibold">
                                                ৳{(p.qty * p.unit_price).toLocaleString()}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic pl-2">No product list found.</p>
                                  )}
                                </div>

                                {/* Payments history */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                                    <Coins className="size-3.5" /> Payments History
                                  </h4>
                                  {row.original.payments && row.original.payments.length > 0 ? (
                                    <div className="rounded-md border bg-background overflow-hidden max-w-2xl">
                                      <Table>
                                        <TableHeader className="bg-muted/40">
                                          <TableRow>
                                            <TableHead className="py-2 text-xs font-semibold">Method</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold">Transaction ID</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[150px]">
                                              Paid Amount
                                            </TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {row.original.payments.map((p, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="py-2 text-xs font-medium capitalize">
                                                {p.payment_method}
                                              </TableCell>
                                              <TableCell className="py-2 text-xs text-muted-foreground font-mono">
                                                {p.transaction_id || "N/A"}
                                              </TableCell>
                                              <TableCell className="py-2 text-xs text-right font-semibold text-emerald-600">
                                                ৳{p.paid_amount.toLocaleString()}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic pl-2">
                                      No payment transaction records found.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <p className="text-sm font-medium">No orders found</p>
                        <p className="text-xs text-muted-foreground">
                          This employee has no orders assigned in the specified range.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 px-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select
                value={`${pagination.pageSize}`}
                onValueChange={(v) => setPagination((p) => ({ ...p, pageSize: Number(v), pageIndex: 0 }))}
              >
                <SelectTrigger className="h-8 w-16">
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
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </span>
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
        </CardContent>
      </Card>
    </div>
  );
}
