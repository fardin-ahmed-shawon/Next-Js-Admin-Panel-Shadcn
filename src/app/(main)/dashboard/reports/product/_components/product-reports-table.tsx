import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Layers, Pen } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductReportItem } from "@/hooks/useProductReports";

interface ProductReportsTableProps {
  data?: ProductReportItem[];
  currentPage: number;
  lastPage: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(
    "/api/v1/admin/",
    "/"
  );

function getImageUrl(img: string | null | undefined): string {
  if (!img) return "https://placehold.co/48x48/1a1a2e/e0e0e0?text=No+Img";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img.startsWith("/") ? img.slice(1) : img}`;
}

function formatCurrency(value: number): string {
  return (
    new Intl.NumberFormat("en-BD", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value) + " ৳"
  );
}

export function ProductReportsTable({
  data = [],
  currentPage,
  lastPage,
  total,
  from,
  to,
  onPageChange,
  isLoading,
}: ProductReportsTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Report Details</CardTitle>
        {!isLoading && total > 0 && (
          <span className="text-sm text-muted-foreground">
            Showing {from}–{to} of {total} products
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Purchase Price</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Stock Qty</TableHead>
                <TableHead className="text-right">Sold Units</TableHead>
                <TableHead className="text-right">Order Value</TableHead>
                <TableHead className="text-right">Purchase Value</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 11 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                    No product report data found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <React.Fragment key={row.sl_no}>
                    <TableRow className={row.has_variants && expandedRows[row.sl_no] ? "border-b-0 bg-muted/10" : ""}>
                      <TableCell className="text-muted-foreground">
                        {row.sl_no}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {row.has_variants && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 shrink-0"
                              onClick={() => toggleRow(String(row.sl_no))}
                            >
                              {expandedRows[row.sl_no] ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                          {!row.has_variants && <div className="w-6 shrink-0" />}
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <Image
                              src={getImageUrl(row.img)}
                              alt={row.product_name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium whitespace-nowrap">{row.product_name}</span>
                            {row.has_variants && (
                              <Badge variant="outline" className="w-fit text-muted-foreground text-[10px] h-4 px-1.5">
                                <Layers className="size-3 mr-1" /> Variants
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.sku}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {row.has_variant_wise_pricing ? (
                          <span className="text-muted-foreground text-xs">Variant Pricing</span>
                        ) : (
                          formatCurrency(row.purchase_price)
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {row.has_variant_wise_pricing ? (
                          <span className="text-muted-foreground text-xs">Variant Pricing</span>
                        ) : (
                          formatCurrency(row.selling_price)
                        )}
                      </TableCell>
                      <TableCell className="text-right">{row.qty}</TableCell>
                      <TableCell className="text-right font-medium">{row.total_sold_unit}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(row.total_order_value)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {formatCurrency(row.total_purchase_value)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <span
                          className={
                            row.total_profit > 0
                              ? "text-green-600 dark:text-green-400 font-semibold"
                              : row.total_profit < 0
                                ? "text-red-600 dark:text-red-400 font-semibold"
                                : "text-muted-foreground"
                          }
                        >
                          {formatCurrency(row.total_profit)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {row.date}
                      </TableCell>
                    </TableRow>
                    
                    {row.has_variants && expandedRows[row.sl_no] && row.variants && (
                      <>
                        {row.variants.map((v) => (
                          <TableRow key={`var-${v.id}`} className="bg-muted/30 hover:bg-muted/30">
                            <TableCell></TableCell>
                            <TableCell>
                              <div className="flex items-center pl-10 text-sm text-muted-foreground">
                                <Pen className="size-3 mr-1.5 shrink-0" />
                                {v.name}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {v.sku}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap text-muted-foreground text-sm">
                              {v.purchase_price > 0 ? formatCurrency(v.purchase_price) : "-"}
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap text-muted-foreground text-sm">
                              {v.selling_price > 0 ? formatCurrency(v.selling_price) : "-"}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground text-sm">
                              {v.stock}
                            </TableCell>
                            {/* Variants don't have individual report stats in this payload */}
                            <TableCell colSpan={5}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground mx-2">
              Page {currentPage} of {lastPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
