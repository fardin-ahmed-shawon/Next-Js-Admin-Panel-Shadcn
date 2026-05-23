import React from "react";

import { AlertCircle, Package, PackageCheck, Phone, Search, ShieldAlert, TrendingUp, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "Fraud Checker | Dashboard",
  description: "Verify customer delivery history across multiple courier services",
};

export default function FraudCheckerPage() {
  const couriers = [
    { name: "Pathao", total: 0, delivered: 0, cancelled: 0, successRate: "-" },
    { name: "Steadfast", total: 0, delivered: 0, cancelled: 0, successRate: "-" },
    { name: "Redx", total: 0, delivered: 0, cancelled: 0, successRate: "-" },
    { name: "Paperfly", total: 0, delivered: 0, cancelled: 0, successRate: "-" },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 max-w-4xl mx-auto w-full relative">
      {/* Background glow effect for modern feel */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center justify-center space-y-4 text-center mt-6 mb-12">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-2 ring-8 ring-primary/5">
          <ShieldAlert className="size-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Fraud Checker</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-lg">
            Verify customer delivery history across multiple courier services in real-time
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="shadow-lg border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="size-5 text-primary" />
            Lookup Phone Number
          </CardTitle>
          <CardDescription>Enter a customer's phone number to scan their past delivery metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="e.g., 01712345678"
                className="pl-10 h-12 text-base rounded-xl bg-muted/30 focus-visible:ring-primary focus-visible:bg-transparent transition-all"
              />
            </div>
            <Button className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all">
              Scan Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="shadow-md">
        <CardHeader className="pb-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="size-5 text-muted-foreground" />
                Courier-wise Breakdown
              </CardTitle>
              <CardDescription className="mt-1">
                Aggregated delivery metrics for the provided phone number
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-background">
              Status: Waiting
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground h-10 px-6">COURIER SERVICE</TableHead>
                  <TableHead className="text-center font-semibold text-foreground h-10">TOTAL</TableHead>
                  <TableHead className="text-center font-semibold text-foreground h-10">DELIVERED</TableHead>
                  <TableHead className="text-center font-semibold text-foreground h-10">CANCELLED</TableHead>
                  <TableHead className="text-center font-semibold text-foreground h-10 px-6">SUCCESS RATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couriers.map((courier) => (
                  <TableRow key={courier.name} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-medium py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-md bg-muted/50 border flex items-center justify-center shrink-0">
                          <Package className="size-4 text-muted-foreground" />
                        </div>
                        {courier.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-3 font-medium tabular-nums">{courier.total}</TableCell>
                    <TableCell className="text-center py-3 font-medium tabular-nums text-green-600 dark:text-green-500">
                      {courier.delivered}
                    </TableCell>
                    <TableCell className="text-center py-3 font-medium tabular-nums text-red-600 dark:text-red-500">
                      {courier.cancelled}
                    </TableCell>
                    <TableCell className="text-center py-3 px-6">
                      <Badge variant="secondary" className="px-3 py-1 font-semibold tabular-nums text-muted-foreground">
                        {courier.successRate}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-primary/5 border-t-2 border-primary/20">
                <TableRow className="hover:bg-primary/5">
                  <TableCell className="py-3 px-6 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-primary" />
                      AGGREGATE TOTAL
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold text-foreground tabular-nums text-lg">0</TableCell>
                  <TableCell className="text-center py-3 font-bold text-green-600 dark:text-green-500 tabular-nums text-lg">
                    0
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold text-red-600 dark:text-red-500 tabular-nums text-lg">
                    0
                  </TableCell>
                  <TableCell className="text-center py-3 px-6">
                    <Badge className="px-3 py-1 font-bold bg-primary text-primary-foreground hover:bg-primary">-</Badge>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
