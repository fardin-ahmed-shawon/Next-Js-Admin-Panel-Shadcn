"use client";

import * as React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  ShoppingBag, 
  Package, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  HelpCircle,
  RefreshCw,
  Coins
} from "lucide-react";
import { format } from "date-fns";
import { useEmployeeReports, EmployeeReportOrder } from "@/hooks/useEmployeeReports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TimeRange = "daily" | "weekly" | "monthly" | "4months" | "6months" | "yearly" | "alltime" | "custom";

function getDateFrom(range: TimeRange): string {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case "daily":
      return now.toISOString().slice(0, 10);
    case "weekly":
      d.setDate(d.getDate() - 7);
      return d.toISOString().slice(0, 10);
    case "monthly":
      d.setMonth(d.getMonth() - 1);
      return d.toISOString().slice(0, 10);
    case "4months":
      d.setMonth(d.getMonth() - 4);
      return d.toISOString().slice(0, 10);
    case "6months":
      d.setMonth(d.getMonth() - 6);
      return d.toISOString().slice(0, 10);
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      return d.toISOString().slice(0, 10);
    default:
      return "";
  }
}

export default function EmployeeReportDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const employeeId = params.employeeId ? Number(params.employeeId) : null;
  const timeRange = (searchParams.get("timeRange") as TimeRange) || "alltime";
  const customFrom = searchParams.get("from") || "";
  const customTo = searchParams.get("to") || "";

  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedOrders, setExpandedOrders] = React.useState<Record<string, boolean>>({});

  const startDate = React.useMemo(() => {
    if (timeRange === "custom") return customFrom || undefined;
    if (timeRange === "alltime") return undefined;
    return getDateFrom(timeRange);
  }, [timeRange, customFrom]);

  const endDate = React.useMemo(() => {
    if (timeRange === "custom") return customTo || undefined;
    if (timeRange === "alltime") return undefined;
    return new Date().toISOString().slice(0, 10);
  }, [timeRange, customTo]);

  const { data: rawReports, isLoading } = useEmployeeReports(startDate, endDate);

  const employeeData = React.useMemo(() => {
    if (!rawReports || !employeeId) return null;
    return rawReports.find((r) => r.user_id === employeeId) || null;
  }, [rawReports, employeeId]);

  // Aggregate stats for this employee
  const stats = React.useMemo(() => {
    if (!employeeData) return { totalAssigned: 0, delivered: 0, collectedRevenue: 0, itemsHandled: 0 };

    let delivered = 0;
    let collectedRevenue = 0;
    let itemsHandled = 0;

    employeeData.orders.forEach((order) => {
      const statusLower = order.order_status?.toLowerCase().replace(/[\s-]/g, "") || "";
      if (statusLower === "delivered") {
        delivered++;
      }

      // Collected revenue = sum of paid amounts
      const paidSum = order.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
      collectedRevenue += paidSum;

      order.ordered_products?.forEach((product) => {
        itemsHandled += product.qty;
      });
    });

    return {
      totalAssigned: employeeData.orders.length,
      delivered,
      collectedRevenue,
      itemsHandled,
    };
  }, [employeeData]);

  // Filtered orders
  const filteredOrders = React.useMemo(() => {
    if (!employeeData) return [];
    return employeeData.orders.filter((order) => {
      const query = searchQuery.toLowerCase();
      const orderNoMatches = order.order_no?.toLowerCase().includes(query);
      const productMatches = order.ordered_products?.some((p) =>
        p.product_name?.toLowerCase().includes(query)
      );
      const statusMatches = order.order_status?.toLowerCase().includes(query);
      return orderNoMatches || productMatches || statusMatches;
    });
  }, [employeeData, searchQuery]);

  const toggleExpand = (orderNo: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderNo]: !prev[orderNo],
    }));
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase().replace(/[\s-]/g, "") || "";
    if (["delivered", "readytoship", "incourier"].includes(s)) {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {status}
        </Badge>
      );
    }
    if (["cancelled", "fake", "trash", "lost", "returned", "return"].includes(s)) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {status}
        </Badge>
      );
    }
    if (["pending", "hold", "shiplater", "missing"].includes(s)) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("full paid") || s === "paid") {
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          {status}
        </Badge>
      );
    }
    if (s.includes("partial")) {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground font-medium">Loading report details...</span>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit gap-2">
          <ArrowLeft className="size-4" /> Go Back
        </Button>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Employee Not Found</CardTitle>
            <CardDescription>
              We couldn't find details for the requested employee in the specified period.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const initials = employeeData.full_name.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Header and Back Button */}
      <div className="flex flex-col gap-3">
        <Button variant="outline" onClick={() => router.back()} className="w-fit gap-2">
          <ArrowLeft className="size-4" /> Back to Reports
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employeeData.full_name)}&background=random`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {employeeData.full_name}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{employeeData.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-muted px-4 py-2.5 rounded-lg border text-sm text-muted-foreground font-medium w-fit">
            <Calendar className="size-4 text-primary" />
            <span>
              Period: {startDate ? format(new Date(startDate), "PP") : "All Time"} to {endDate ? format(new Date(endDate), "PP") : "Today"}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
            <ShoppingBag className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalAssigned}</div>
            <p className="text-xs text-muted-foreground mt-1">Orders delegated to employee</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Successful Deliveries</CardTitle>
            <CheckCircle className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalAssigned > 0 
                ? `${Math.round((stats.delivered / stats.totalAssigned) * 100)}% delivery success rate`
                : "No orders assigned"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
            <Coins className="size-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">৳{stats.collectedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Accumulated paid amount</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Items Handled</CardTitle>
            <Package className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.itemsHandled}</div>
            <p className="text-xs text-muted-foreground mt-1">Total items quantity in orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Orders list</CardTitle>
          <CardDescription>
            View detailed transactions, items, and status for all orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Order No or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Order No</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right">Collected Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isExpanded = !!expandedOrders[order.order_no];
                    const paidSum = order.payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
                    return (
                      <React.Fragment key={order.order_no}>
                        <TableRow 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleExpand(order.order_no)}
                        >
                          <TableCell>
                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">{order.order_no}</TableCell>
                          <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {format(new Date(order.assigned_date), "PP p")}
                          </TableCell>
                          <TableCell className="text-right font-medium">৳{order.grand_total_amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">৳{paidSum.toLocaleString()}</TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={7} className="p-4 border-t border-b">
                              <div className="flex flex-col gap-6 pl-4">
                                {/* Products Sub-table */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                                    <Package className="size-3.5" /> Items ({order.ordered_products?.length || 0})
                                  </h4>
                                  {order.ordered_products && order.ordered_products.length > 0 ? (
                                    <div className="rounded-md border bg-background overflow-hidden max-w-2xl">
                                      <Table>
                                        <TableHeader className="bg-muted/40">
                                          <TableRow>
                                            <TableHead className="py-2 text-xs font-semibold">Product Name</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[80px]">Qty</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[120px]">Unit Price</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[120px]">Total</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.ordered_products.map((p, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="py-2 text-xs font-medium">{p.product_name || "Unknown Product"}</TableCell>
                                              <TableCell className="py-2 text-xs text-right font-medium">{p.qty}</TableCell>
                                              <TableCell className="py-2 text-xs text-right">৳{p.unit_price.toLocaleString()}</TableCell>
                                              <TableCell className="py-2 text-xs text-right font-semibold">৳{(p.qty * p.unit_price).toLocaleString()}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic pl-2">No product list found.</p>
                                  )}
                                </div>

                                {/* Payments history */}
                                <div className="space-y-2">
                                  <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1.5">
                                    <Coins className="size-3.5" /> Payments History
                                  </h4>
                                  {order.payments && order.payments.length > 0 ? (
                                    <div className="rounded-md border bg-background overflow-hidden max-w-2xl">
                                      <Table>
                                        <TableHeader className="bg-muted/40">
                                          <TableRow>
                                            <TableHead className="py-2 text-xs font-semibold">Method</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold">Transaction ID</TableHead>
                                            <TableHead className="py-2 text-xs font-semibold text-right w-[150px]">Paid Amount</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {order.payments.map((p, idx) => (
                                            <TableRow key={idx}>
                                              <TableCell className="py-2 text-xs font-medium capitalize">{p.payment_method}</TableCell>
                                              <TableCell className="py-2 text-xs text-muted-foreground font-mono">{p.transaction_id || "N/A"}</TableCell>
                                              <TableCell className="py-2 text-xs text-right font-semibold text-emerald-600">৳{p.paid_amount.toLocaleString()}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic pl-2">No payment transaction records found.</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No matching orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
