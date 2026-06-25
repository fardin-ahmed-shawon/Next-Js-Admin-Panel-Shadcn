"use client";

import * as React from "react";
import { Loader2, Package, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSteadfastReturns } from "@/hooks/useSteadfastReturns";

export function ReturnsTable() {
  const [searchInput, setSearchInput] = React.useState("");
  const { data: returnsData, isLoading } = useSteadfastReturns();

  // Assuming data is an array for now based on typical response
  const data = Array.isArray(returnsData) ? returnsData : [];

  const filteredData = data.filter((item: any) => {
    if (!searchInput) return true;
    const search = searchInput.toLowerCase();
    return (
      (item.consignment?.invoice || "").toLowerCase().includes(search) ||
      (item.consignment?.tracking_code || "").toLowerCase().includes(search)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Return Requests</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : filteredData.length > 0 ? (
            `${filteredData.length} returns`
          ) : (
            "No returns"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search invoice or tracking..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[600px] px-4.5">
            <TableHeader className="border-t h-11 text-sm text-foreground">
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Parcel Status</TableHead>
                <TableHead>Return Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading returns...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length ? (
                filteredData.map((row: any, i: number) => (
                  <TableRow key={row.id || i}>
                    <TableCell className="font-medium">{row.consignment?.invoice || "N/A"}</TableCell>
                    <TableCell>{row.consignment?.tracking_code || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm leading-none">
                          {row.consignment?.recipient_name || "N/A"}
                        </span>
                        <span className="text-muted-foreground text-xs">{row.consignment?.recipient_phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {row.consignment?.status ? row.consignment.status.replace(/_/g, " ") : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "pending" ? "outline" : row.status === "approved" ? "default" : "secondary"
                        }
                        className="capitalize"
                      >
                        {row.status || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={row.reason}>
                      {row.reason || "—"}
                    </TableCell>
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
                        <p className="text-sm font-medium">No return requests found</p>
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
