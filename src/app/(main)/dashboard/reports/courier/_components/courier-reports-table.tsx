import * as React from "react";
import { PackageX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourierReportItem } from "@/hooks/useCourierAnalytics";

interface CourierReportsTableProps {
  data?: CourierReportItem[];
  isLoading?: boolean;
}

export function CourierReportsTable({ data = [], isLoading }: CourierReportsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="**:data-[slot='table-cell']:px-4.5 **:data-[slot='table-head']:px-4.5 min-w-[1200px]">
        <TableHeader className="border-t **:data-[slot='table-head']:h-11 **:data-[slot='table-head']:font-normal **:data-[slot='table-head']:text-foreground **:data-[slot='table-head']:text-sm bg-muted/30">
          <TableRow>
            <TableHead className="font-semibold w-[200px]">Courier Name</TableHead>
            <TableHead className="text-center font-semibold">Total Parcels</TableHead>
            <TableHead className="text-center text-blue-600 dark:text-blue-400">In-Courier</TableHead>
            <TableHead className="text-center text-green-600 dark:text-green-400">Delivered</TableHead>
            <TableHead className="text-center text-red-600 dark:text-red-400">Returned</TableHead>
            <TableHead className="text-center text-yellow-600 dark:text-yellow-400">Pending</TableHead>
            <TableHead className="text-center">Confirmed</TableHead>
            <TableHead className="text-center">Ready to Ship</TableHead>
            <TableHead className="text-center">Ship Later</TableHead>
            <TableHead className="text-center">Hold</TableHead>
            <TableHead className="text-center text-amber-600 dark:text-amber-400">Pre-Order</TableHead>
            <TableHead className="text-center text-rose-600 dark:text-rose-400">Cancelled</TableHead>
            <TableHead className="text-center text-slate-500">Missing</TableHead>
            <TableHead className="text-center text-slate-500">Lost</TableHead>
            <TableHead className="text-center text-slate-500">Fake</TableHead>
            <TableHead className="text-center text-slate-500">Trash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="**:data-[slot='table-row']:border-border/50 **:data-[slot='table-cell']:py-3 **:data-[slot='table-row']:hover:bg-muted/10">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={16} className="h-48 text-center">
                Loading reports...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={16} className="h-auto p-0">
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <PackageX className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium">No courier reports found</p>
                    <p className="text-xs text-muted-foreground">Adjust filters or check back later.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.sl}>
                <TableCell className="font-semibold whitespace-nowrap bg-muted/10">{row.courier_name}</TableCell>
                <TableCell className="text-center font-bold">{row.all}</TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-blue-600 dark:text-blue-400">{row.in__courier_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.in__courier_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-green-600 dark:text-green-400">{row.delivered_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.delivered_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-red-600 dark:text-red-400">{row.returned_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.returned_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">{row.pending_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.pending_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{row.confirmed_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.confirmed_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{row.ready_to_ship_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.ready_to_ship_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{row.ship_later_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.ship_later_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium">{row.hold_count}</span>
                    {row.all > 0 && <span className="text-[10px] text-muted-foreground">{row.hold_percentage}%</span>}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-amber-600 dark:text-amber-400">{row.pre__order_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.pre__order_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-rose-600 dark:text-rose-400">{row.cancelled_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.cancelled_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-500">{row.missing_count}</span>
                    {row.all > 0 && (
                      <span className="text-[10px] text-muted-foreground">{row.missing_percentage}%</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-500">{row.lost_count}</span>
                    {row.all > 0 && <span className="text-[10px] text-muted-foreground">{row.lost_percentage}%</span>}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-500">{row.fake_count}</span>
                    {row.all > 0 && <span className="text-[10px] text-muted-foreground">{row.fake_percentage}%</span>}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-500">{row.trash_count}</span>
                    {row.all > 0 && <span className="text-[10px] text-muted-foreground">{row.trash_percentage}%</span>}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
