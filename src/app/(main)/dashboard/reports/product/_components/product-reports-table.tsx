import * as React from "react";

import Image from "next/image";

import { ChevronDown, ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProductReportItem, ProductReportVariant } from "@/hooks/useProductReports";

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

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/").replace(
  "/api/v1/admin/",
  "/",
);

function getImageUrl(img: string | null | undefined): string {
  if (!img) return "https://placehold.co/48x48/1a1a2e/e0e0e0?text=No+Img";
  if (img.startsWith("http")) return img;
  return `${BASE_URL}${img.startsWith("/") ? img.slice(1) : img}`;
}

function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(value)} ৳`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 3 }).format(value);
}

function formatSoldQuantity(
  units: number,
  baseQuantity: number,
  baseUnit: string | null,
  isBulk: boolean,
  packLabel?: string | null,
): string {
  if (!isBulk) return `${formatNumber(units)} Piece${units === 1 ? "" : "s"}`;

  const normalizedLabel = packLabel?.toLowerCase() ?? "";
  if (baseUnit === "g") {
    const useKilograms = normalizedLabel.includes("kg") || (!packLabel && Math.abs(baseQuantity) >= 1000);
    return useKilograms
      ? `${formatNumber(units)} / ${formatNumber(baseQuantity / 1000)} KG`
      : `${formatNumber(units)} / ${formatNumber(baseQuantity)} g`;
  }
  if (baseUnit === "ml") {
    const useLitres = /(^|\s)l($|\s)/.test(normalizedLabel) || (!packLabel && Math.abs(baseQuantity) >= 1000);
    return useLitres
      ? `${formatNumber(units)} / ${formatNumber(baseQuantity / 1000)} L`
      : `${formatNumber(units)} / ${formatNumber(baseQuantity)} ml`;
  }

  return `${formatNumber(units)} / ${formatNumber(baseQuantity)}`;
}
function Profit({ value }: { value: number }) {
  return (
    <span
      className={
        value > 0
          ? "font-semibold text-green-600 dark:text-green-400"
          : value < 0
            ? "font-semibold text-red-600 dark:text-red-400"
            : "text-muted-foreground"
      }
    >
      {formatCurrency(value)}
    </span>
  );
}

function DetailRow({ detail, isBulk }: { detail: ProductReportVariant; isBulk: boolean }) {
  const label = detail.size_label ?? (isBulk ? "Pack" : "Variant");

  return (
    <TableRow className="bg-muted/25 hover:bg-muted/40">
      <TableCell />
      <TableCell className="pl-14">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <PackageOpen className="size-4" />
          <span>{label}</span>
          <Badge variant="outline" className="font-normal text-[10px]">
            {isBulk ? "Pack" : "Variant"}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="font-mono text-muted-foreground text-xs">{detail.sku || "-"}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{label}</TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
        {isBulk ? "-" : (detail.color_label ?? "-")}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatCurrency(detail.purchase_price)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatCurrency(detail.selling_price)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatCurrency(detail.total_discount_amount)}</TableCell>
      <TableCell className="whitespace-nowrap text-right font-medium">
        {formatSoldQuantity(
          detail.total_sold_unit,
          detail.total_sold_base,
          detail.base_unit_code,
          isBulk,
          detail.size_label,
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatCurrency(detail.total_order_value)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">{formatCurrency(detail.total_purchase_value)}</TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <Profit value={detail.total_profit} />
      </TableCell>
    </TableRow>
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
  const [expandedProducts, setExpandedProducts] = React.useState<Set<number>>(new Set());

  const toggleProduct = (productId: number) => {
    setExpandedProducts((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Report Details</CardTitle>
        {!isLoading && total > 0 && (
          <span className="text-muted-foreground text-sm">
            Showing {from}–{to} of {total} products
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Size / Pack</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Avg Purchase Price</TableHead>
                <TableHead className="text-right">Avg Selling Price</TableHead>
                <TableHead className="text-right">Total Discount</TableHead>
                <TableHead className="text-right">Sold (Unit/Qty)</TableHead>
                <TableHead className="text-right">Order Value</TableHead>
                <TableHead className="text-right">COGS</TableHead>
                <TableHead className="text-right">Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 12 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                    No product report data found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const isBulk = row.inventory_mode === "shared_bulk";
                  const hasDetails = row.variants.some(
                    (variant) => variant.product_variant_id || variant.size_label || variant.color_label,
                  );
                  const expanded = expandedProducts.has(row.product_id);
                  const detailLabel = isBulk
                    ? `${row.variants.length} pack size${row.variants.length === 1 ? "" : "s"}`
                    : hasDetails
                      ? `${row.variants.length} variant${row.variants.length === 1 ? "" : "s"}`
                      : "-";

                  return (
                    <React.Fragment key={row.product_id}>
                      <TableRow className="font-medium">
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {hasDetails ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => toggleProduct(row.product_id)}
                                aria-label={`${expanded ? "Collapse" : "Expand"} ${row.product_name}`}
                              >
                                {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                              </Button>
                            ) : (
                              <span className="inline-block w-7" />
                            )}
                            {row.sl_no}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                              <Image
                                src={getImageUrl(row.img)}
                                alt={row.product_name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="whitespace-nowrap">{row.product_name}</span>
                              {isBulk && (
                                <Badge variant="secondary" className="w-fit text-[10px]">
                                  Shared bulk stock
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground text-xs">{row.sku}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{detailLabel}</TableCell>
                        <TableCell className="text-muted-foreground">-</TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {formatCurrency(row.purchase_price)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {formatCurrency(row.selling_price)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {formatCurrency(row.total_discount_amount)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {formatSoldQuantity(row.total_sold_unit, row.total_sold_base, row.base_unit_code, isBulk)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {formatCurrency(row.total_order_value)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {formatCurrency(row.total_purchase_value)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <Profit value={row.total_profit} />
                        </TableCell>
                      </TableRow>
                      {expanded &&
                        row.variants.map((detail, index) => (
                          <DetailRow
                            key={`${detail.product_variant_id ?? "simple"}-${index}`}
                            detail={detail}
                            isBulk={isBulk}
                          />
                        ))}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {lastPage > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <div className="mx-2 text-muted-foreground text-sm">
              Page {currentPage} of {lastPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= lastPage || isLoading}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
