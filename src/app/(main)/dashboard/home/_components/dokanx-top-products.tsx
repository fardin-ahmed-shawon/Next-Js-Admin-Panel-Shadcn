"use client";

import { Box } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function DokanxTopProducts() {
  const { data, isLoading } = useAdminDashboard();
  const topProducts = data?.top_products || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="leading-none">Top Selling Products</CardTitle>
            <CardDescription>Top products</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-auto px-2 py-1">
            Full Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pb-6">
        <div className="flex-1 flex flex-col justify-start gap-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No top products available.
            </div>
          ) : (
            topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 relative items-center justify-center overflow-hidden rounded-lg bg-muted border">
                    {product.image ? (
                       // Assuming base URL needs to be added, but just using the path from API for now
                      <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || ""}${product.image}`} alt={product.product_title} className="object-cover w-full h-full" />
                    ) : (
                      <Box className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none">{product.product_title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{product.total_units} units sold</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
