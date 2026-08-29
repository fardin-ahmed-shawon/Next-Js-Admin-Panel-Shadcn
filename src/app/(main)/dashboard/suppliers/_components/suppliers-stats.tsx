"use client";

import * as React from "react";
import { Building2, Package, Boxes, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuppliersStatsProps {
  totalSuppliers: number;
  totalLotsSupplied: number;
  totalUnitsSupplied: number;
  activeLotsCount: number;
}

export function SuppliersStats({
  totalSuppliers,
  totalLotsSupplied,
  totalUnitsSupplied,
  activeLotsCount,
}: SuppliersStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          <Building2 className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSuppliers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Registered vendor partners</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Procurement Lots</CardTitle>
          <Package className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalLotsSupplied.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Lifetime stock batches</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Units Supplied</CardTitle>
          <Boxes className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">{totalUnitsSupplied.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Total quantity received</p>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sky-500">{activeLotsCount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Lots with remaining stock</p>
        </CardContent>
      </Card>
    </div>
  );
}
