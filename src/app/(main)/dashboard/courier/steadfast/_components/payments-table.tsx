"use client";

import * as React from "react";
import { Loader2, Package, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSteadfastPayments } from "@/hooks/useSteadfastPayments";

export function PaymentsTable() {
  const [searchInput, setSearchInput] = React.useState("");
  const { data: paymentsData, isLoading } = useSteadfastPayments();

  const data = Array.isArray(paymentsData) ? paymentsData : [];

  const filteredData = data.filter((item: any) => {
    if (!searchInput) return true;
    const search = searchInput.toLowerCase();
    return (item.id || "").toString().includes(search) || (item.trx_id || "").toLowerCase().includes(search);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Payments</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : filteredData.length > 0 ? `${filteredData.length} payments` : "No payments"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search TRX ID or ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[600px] px-4.5">
            <TableHeader className="border-t h-11 text-sm text-foreground">
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>TRX ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading payments...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length ? (
                filteredData.map((row: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.id || "N/A"}</TableCell>
                    <TableCell>{row.trx_id || "N/A"}</TableCell>
                    <TableCell className="font-semibold tabular-nums">৳{row.amount ? Number(row.amount).toLocaleString() : "0"}</TableCell>
                    <TableCell className="capitalize">{row.status || "Unknown"}</TableCell>
                    <TableCell>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No payments found</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
