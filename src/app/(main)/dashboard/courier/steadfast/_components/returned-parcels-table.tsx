"use client";

import * as React from "react";
import { Loader2, Package, Search, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSteadfastReturnedParcels } from "@/hooks/useSteadfastReturnedParcels";
import { fetchClient } from "@/lib/fetch-client";

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";

export function ReturnedParcelsTable() {
  const [searchInput, setSearchInput] = React.useState("");
  
  const { data: apiData, isLoading, mutate } = useSteadfastReturnedParcels({
    page: 1,
    per_page: 100, // fetching larger amount or we can add pagination later
    search: searchInput || undefined,
  });

  const filteredData = Array.isArray(apiData?.data?.data) ? apiData.data.data : (Array.isArray(apiData?.data) ? apiData.data : []);

  const handleReturnRequest = async (order_no: string) => {
    if (!confirm("Are you sure you want to create a return request for this parcel?")) return;
    const toastId = toast.loading(`Creating return request for order ${order_no}...`);
    try {
      const res = await fetchClient(`${getApiBaseUrl()}steadfast-parcels/${order_no}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Requested from Admin Panel" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.raw_response?.error || errorData?.message || "Failed to create return request";
        throw new Error(errorMessage);
      }
      
      toast.success(`Return request for ${order_no} created successfully!`, { id: toastId });
      mutate(); // Refresh the parcels table
    } catch (e: any) {
      toast.error(e.message || "An error occurred.", { id: toastId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground text-sm">Returned Parcels</CardTitle>
        <CardDescription className="text-foreground text-xl tabular-nums leading-none tracking-tight">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : filteredData.length > 0 ? `${filteredData.length} returned parcels` : "No returned parcels"}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
              placeholder="Search order no..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-[800px] px-4.5">
            <TableHeader className="border-t h-11 text-sm text-foreground">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Parcel Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="size-8 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length ? (
                filteredData.map((row: any) => {
                  const oStatus = row.order?.order_status || "Unknown";
                  const pStatus = row.order?.payment_status || "Unknown";
                  const parcelStatus = row.parcel_status || row.status || "Unknown";
                  
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.order_no}</TableCell>
                      <TableCell>{row.tracking_code}</TableCell>
                      <TableCell>৳{Number(row.order?.grand_total_amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={oStatus === "Returned" ? "border-red-500 text-red-600" : ""}>{oStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pStatus === "Refund" || pStatus === "Unpaid" ? "secondary" : "default"}>{pStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-orange-500 text-orange-600 capitalize">
                          {parcelStatus.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1.5"
                          onClick={() => handleReturnRequest(row.order_no)}
                        >
                          <Undo2 className="size-3.5" />
                          Send Return Request
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-auto p-0">
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-sm font-medium">No returned parcels found</p>
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
