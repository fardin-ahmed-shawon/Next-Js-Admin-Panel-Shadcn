"use client";

import * as React from "react";
import { Loader2, Search, Users } from "lucide-react";
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmployeeReports } from "@/hooks/useEmployeeReports";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface EmployeeReportData {
  userId: number;
  name: string;
  email: string;
  avatar: string;
  totalAssigned: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalCollected: number;
}

export default function EmployeeReportsPage() {
  const { data: rawReports, isLoading } = useEmployeeReports();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const reportData = React.useMemo(() => {
    return rawReports.map((report) => {
      let deliveredOrders = 0;
      let pendingOrders = 0;
      let totalRevenue = 0;
      let totalCollected = 0;

      report.orders.forEach((order) => {
        if (order.order_status === "Delivered") deliveredOrders++;
        if (order.order_status === "Pending") pendingOrders++;
        
        totalRevenue += order.grand_total_amount;
        
        order.payments.forEach((payment) => {
          totalCollected += payment.paid_amount;
        });
      });

      return {
        userId: report.user_id,
        name: report.full_name,
        email: report.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(report.full_name || "U")}&background=random`,
        totalAssigned: report.assigned_orders_count,
        deliveredOrders,
        pendingOrders,
        totalRevenue,
        totalCollected,
      };
    }).sort((a, b) => b.totalAssigned - a.totalAssigned);
  }, [rawReports]);

  const columns: ColumnDef<EmployeeReportData>[] = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const initials = name.substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{name}</span>
              <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "totalAssigned",
      header: "Total Assigned",
      cell: ({ row }) => <span className="font-medium text-primary">{row.getValue("totalAssigned")}</span>,
    },
    {
      accessorKey: "deliveredOrders",
      header: "Delivered",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {row.getValue("deliveredOrders")}
        </Badge>
      ),
    },
    {
      accessorKey: "pendingOrders",
      header: "Pending",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {row.getValue("pendingOrders")}
        </Badge>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: "Total Revenue",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalRevenue"));
        return <span className="font-semibold text-primary">৳{amount.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "totalCollected",
      header: "Payments Collected",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalCollected"));
        return <span className="font-medium text-muted-foreground">৳{amount.toLocaleString()}</span>;
      },
    },
  ];

  const table = useReactTable({
    data: reportData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl tracking-tight flex items-center gap-2">
            Employee Reports
            {isLoading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
          </h1>
          <p className="text-muted-foreground text-sm">
            Performance metrics and assignment totals for each employee.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aggregated Data</CardTitle>
          <CardDescription>View how many orders each employee has been assigned.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Employee..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="h-8 w-64 pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="size-6 text-muted-foreground" />
                        <span className="text-sm">No employee data found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
