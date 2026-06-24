import * as React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PackageX } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CourierReportData } from "@/hooks/useCourierReports";

interface ParcelReportsTableProps {
  data?: CourierReportData[];
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ParcelReportsTable({
  data = [],
  currentPage,
  lastPage,
  onPageChange,
  isLoading,
}: ParcelReportsTableProps) {
  
  const getInitials = (name?: string) => {
    if (!name) return "NA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "returned":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "in-courier":
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "unpaid":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "refund":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  return (
    <>
      <div className="overflow-hidden">
        <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5">
          <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Order No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Courier Name</TableHead>
              <TableHead>Tracking Code</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Revenue Collected</TableHead>
              <TableHead>Parcel Status</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-transparent">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-48 text-center">
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-auto p-0">
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                      <PackageX className="size-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium">No parcels found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(row.date), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="font-medium">{row.order_no}</TableCell>
                  <TableCell>
                    {row.customer ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-full border border-border/50">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                            {getInitials(row.customer.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.customer.full_name}</span>
                          <span className="text-xs text-muted-foreground">{row.customer.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{row.courier_name}</TableCell>
                  <TableCell>{row.tracking_code}</TableCell>
                  <TableCell>
                    {row.grand_total_amount !== undefined ? `৳${row.grand_total_amount}` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {row.paid_amount !== undefined ? `৳${row.paid_amount}` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(row.parcel_status)}>
                      {row.parcel_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(row.order_status)}>
                      {row.order_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(row.payment_status)}>
                      {row.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 pb-1">
        <p className="text-muted-foreground text-sm">
          Page {currentPage} of {Math.max(1, lastPage)}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= lastPage || isLoading}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => onPageChange(lastPage)}
            disabled={currentPage >= lastPage || isLoading}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
