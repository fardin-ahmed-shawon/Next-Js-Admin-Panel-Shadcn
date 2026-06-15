"use client";

import * as React from "react";
import { format } from "date-fns";
import { Package, ReceiptText, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeReportData } from "@/hooks/useEmployeeReports";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EmployeeReportDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeData: EmployeeReportData | null;
}

export function EmployeeReportDetails({ open, onOpenChange, employeeData }: EmployeeReportDetailsProps) {
  if (!employeeData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details: {employeeData.full_name}</DialogTitle>
          <DialogDescription>
            Detailed list of all {employeeData.orders.length} orders assigned to this employee in the selected period.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {employeeData.orders.map((order, index) => {
            const date = new Date(order.assigned_date);
            return (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">{order.order_no}</span>
                      <Badge variant={order.order_status === "Delivered" ? "default" : "secondary"}>
                        {order.order_status}
                      </Badge>
                      <Badge variant={order.payment_status === "Full Paid" ? "default" : "outline"}>
                        {order.payment_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>Assigned: {format(date, "PPP p")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground block">Grand Total</span>
                    <span className="font-bold text-lg text-primary">৳{order.grand_total_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
                    <Package className="size-4" /> Ordered Products
                  </h4>
                  {order.ordered_products && order.ordered_products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.ordered_products.map((product, pIndex) => (
                          <TableRow key={pIndex}>
                            <TableCell className="font-medium">{product.product_name || "Unknown Product"}</TableCell>
                            <TableCell className="text-right">{product.qty}</TableCell>
                            <TableCell className="text-right">৳{product.unit_price.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-semibold">
                              ৳{(product.qty * product.unit_price).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-sm text-muted-foreground italic px-2">No products found.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
