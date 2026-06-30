"use client";

import React from "react";
import { AlertCircle, Loader2, Package, Phone, Search, ShieldAlert, TrendingUp, Truck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function FraudCheckerPage() {
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<any | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    // Basic regex validation for Bangladesh phone number pattern
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      toast.error("Please enter a valid Bangladesh phone number.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    const toastId = toast.loading("Scanning customer metrics...");

    try {
      const res = await fetch("/api/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to scan phone number.");
      }

      setResult(resData);
      toast.success("Scan completed successfully.", { id: toastId });
    } catch (err: any) {
      setError(err?.message || "Failed to contact proxy API");
      toast.error(err?.message || "Scan failed.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const getCourierMetrics = (courierName: string) => {
    if (!result || !result.apis) {
      return { name: courierName, total: 0, delivered: 0, cancelled: 0, successRate: "-" };
    }

    // Find key in result.apis case-insensitively, matching "redx" to "redex"
    const searchName = courierName.toLowerCase().replace(" ", "");
    const matchedKey = Object.keys(result.apis).find((k) => {
      const normalizedKey = k.toLowerCase().replace(" ", "");
      if (searchName === "redx" && normalizedKey === "redex") return true;
      if (searchName === "redex" && normalizedKey === "redx") return true;
      return normalizedKey === searchName;
    });

    const raw = matchedKey ? result.apis[matchedKey] : {};

    const total = Number(raw.total_parcels ?? raw.total ?? 0);
    const delivered = Number(raw.total_delivered_parcels ?? raw.success ?? raw.delivered ?? raw.total_delivered ?? 0);
    const cancelled = Number(raw.total_cancelled_parcels ?? raw.cancel ?? raw.cancelled ?? raw.total_cancelled ?? 0);

    let successRate = "-";
    if (total > 0) {
      successRate = `${Math.round((delivered / total) * 100)}%`;
    } else if (raw.success_rate || raw.successRate) {
      successRate = String(raw.success_rate || raw.successRate);
      if (!successRate.endsWith("%")) successRate += "%";
    }

    return { name: courierName, total, delivered, cancelled, successRate };
  };

  const couriers = [
    getCourierMetrics("Pathao"),
    getCourierMetrics("Steadfast"),
    getCourierMetrics("Redx"),
    getCourierMetrics("Paperfly"),
  ];

  const aggregateTotal = couriers.reduce((sum, c) => sum + c.total, 0);
  const aggregateDelivered = couriers.reduce((sum, c) => sum + c.delivered, 0);
  const aggregateCancelled = couriers.reduce((sum, c) => sum + c.cancelled, 0);
  const aggregateSuccessRate =
    aggregateTotal > 0 ? `${Math.round((aggregateDelivered / aggregateTotal) * 100)}%` : "-";

  // Determine dynamic badge status
  let statusText = "Waiting";
  let statusVariant: "outline" | "secondary" | "default" | "destructive" = "outline";
  if (loading) {
    statusText = "Scanning...";
    statusVariant = "secondary";
  } else if (error) {
    statusText = "Error";
    statusVariant = "destructive";
  } else if (result) {
    statusText = "Success";
    statusVariant = "default";
  }

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
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="relative w-full flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="e.g., 01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl bg-muted/30 focus-visible:ring-primary focus-visible:bg-transparent transition-all"
                disabled={loading}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-12 px-8 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Scan Customer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

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
            <Badge variant={statusVariant} className="bg-background">
              Status: {statusText}
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
                  <TableCell className="text-center py-3 font-bold text-foreground tabular-nums text-lg text-primary">
                    {aggregateTotal}
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold text-green-600 dark:text-green-500 tabular-nums text-lg">
                    {aggregateDelivered}
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold text-red-600 dark:text-red-500 tabular-nums text-lg">
                    {aggregateCancelled}
                  </TableCell>
                  <TableCell className="text-center py-3 px-6">
                    <Badge className="px-3 py-1 font-bold bg-primary text-primary-foreground hover:bg-primary">
                      {aggregateSuccessRate}
                    </Badge>
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
