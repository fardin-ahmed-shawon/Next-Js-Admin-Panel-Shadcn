"use client";

import * as React from "react";

import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Copy,
  DollarSign,
  Eye,
  Fingerprint,
  Globe,
  Heart,
  Info,
  Monitor,
  MousePointerClick,
  Search,
  ShoppingCart,
  Smartphone,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserBehaviourLogs } from "@/hooks/useUserBehaviourLogs";

export interface UserBehaviourLog {
  id: number;
  user_id: number | null;
  session_id: string;
  product_id: number | null;
  variant_id: number | null;
  main_category_id: number | null;
  sub_category_id: number | null;
  event_type: string;
  search_query: string | null;
  device: string | null;
  source: string | null;
  ip_address: string | null;
  created_at: string;
  user: {
    id: number;
    full_name: string;
    phone: string | null;
    email: string | null;
    status: string;
  } | null;
  product: {
    id: number;
    title: string;
    sku: string;
    regular_price: number;
    selling_price: number;
    product_thumbnail_img: string | null;
    status: string;
    product_slug: string;
  } | null;
  main_category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  sub_category: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface StatCount {
  count: number;
  percentage?: number;
}

export interface UserBehaviourStats {
  total_streamed_events: StatCount;
  total_unique_session: StatCount;
  total_unique_ip: StatCount;
  total_view: StatCount;
  total_clicked: StatCount;
  total_wishlisted: StatCount;
  total_add_to_cart: StatCount;
  total_searched: StatCount;
  total_purchased: StatCount;
}

// Parse User Agent string to simplified device details
const getDeviceDetails = (uaString: string | null) => {
  if (!uaString) {
    return {
      icon: <Monitor className="size-4" />,
      name: "Unknown Desktop",
    };
  }
  const ua = uaString.toLowerCase();
  if (ua.includes("mobi") || ua.includes("iphone") || ua.includes("android")) {
    return {
      icon: <Smartphone className="size-4" />,
      name: uaString.split(" ")[0] || "Mobile Browser",
    };
  }
  if (ua.includes("ipad") || ua.includes("tablet")) {
    return {
      icon: <Tablet className="size-4" />,
      name: uaString.split(" ")[0] || "Tablet Browser",
    };
  }
  return {
    icon: <Monitor className="size-4" />,
    name: uaString.split(" ")[0] || "Desktop Browser",
  };
};

const FunnelCard = ({
  title,
  count,
  percentage,
  icon,
  colorClass,
}: {
  title: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  colorClass: string;
}) => (
  <Card className="border-muted shadow-sm transition-all hover:shadow-md">
    <CardContent className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">{title}</span>
        <div className={`rounded-lg p-1.5 ${colorClass}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-bold text-xl tabular-nums">{count}</span>
        <span className="text-muted-foreground text-xs">({percentage}%)</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: colorClass.includes("text-emerald-500")
              ? "#10b981"
              : colorClass.includes("text-blue-500")
                ? "#3b82f6"
                : colorClass.includes("text-purple-500")
                  ? "#8b5cf6"
                  : colorClass.includes("text-amber-500")
                    ? "#f59e0b"
                    : colorClass.includes("text-rose-500")
                      ? "#f43f5e"
                      : "#6b7280",
          }}
        />
      </div>
    </CardContent>
  </Card>
);

export default function UserBehaviourLogsPage() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [eventType, setEventType] = React.useState("All");

  // State for raw JSON payload modal
  const [selectedLog, setSelectedLog] = React.useState<UserBehaviourLog | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch logs using SWR
  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useUserBehaviourLogs({
    page,
    per_page: perPage,
    search: debouncedSearch,
    event_type: eventType,
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1/admin/", "/") || "http://127.0.0.1:8000/";

  const getProductImageUrl = (path: string | null) => {
    if (!path) return "https://placehold.co/40x40/1a1a2e/e0e0e0?text=No+Img";
    if (path.startsWith("http")) return path;
    return `${baseUrl}${path.startsWith("/") ? path.slice(1) : path}`;
  };

  const handleCopySession = (sessionId: string) => {
    navigator.clipboard.writeText(sessionId);
    toast.success("Session ID copied to clipboard");
  };

  // Helper to get styling for event badge
  const getEventBadge = (type: string) => {
    const normalized = type.toLowerCase();
    switch (normalized) {
      case "purchase":
        return (
          <Badge className="bg-emerald-500 font-semibold text-[10px] text-white hover:bg-emerald-500">Purchase</Badge>
        );
      case "cart":
      case "add_to_cart":
        return (
          <Badge className="bg-blue-500 font-semibold text-[10px] text-white hover:bg-blue-500">Cart Update</Badge>
        );
      case "search":
        return <Badge className="bg-purple-500 font-semibold text-[10px] text-white hover:bg-purple-500">Search</Badge>;
      case "view":
        return <Badge className="bg-amber-500 font-semibold text-[10px] text-white hover:bg-amber-500">View</Badge>;
      case "click":
      case "clicked":
        return <Badge className="bg-indigo-500 font-semibold text-[10px] text-white hover:bg-indigo-500">Click</Badge>;
      case "wishlist":
      case "wishlisted":
        return <Badge className="bg-rose-500 font-semibold text-[10px] text-white hover:bg-rose-500">Wishlist</Badge>;
      default:
        return (
          <Badge variant="secondary" className="font-semibold text-[10px] capitalize">
            {type}
          </Badge>
        );
    }
  };

  const logs = (apiResponse?.data?.data || []) as UserBehaviourLog[];
  const totalLogs = apiResponse?.data?.total || 0;
  const lastPage = apiResponse?.data?.last_page || 1;

  // Extract stats from API response
  const stats: UserBehaviourStats = apiResponse?.stats || {
    total_streamed_events: { count: 0 },
    total_unique_session: { count: 0 },
    total_unique_ip: { count: 0 },
    total_view: { count: 0, percentage: 0 },
    total_clicked: { count: 0, percentage: 0 },
    total_wishlisted: { count: 0, percentage: 0 },
    total_add_to_cart: { count: 0, percentage: 0 },
    total_searched: { count: 0, percentage: 0 },
    total_purchased: { count: 0, percentage: 0 },
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 md:p-8">
      {/* Glow Effect */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-64 w-full max-w-4xl -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="size-5 animate-pulse" />
            </div>
            <h1 className="font-bold text-3xl tracking-tight">User Behaviour Logs</h1>
            <Badge className="select-none bg-emerald-500 text-[10px] text-white hover:bg-emerald-500">New</Badge>
          </div>
          <p className="max-w-xl text-muted-foreground text-sm">
            Monitor visitor events, search keywords, cart updates, and checkouts across your storefront in real time.
          </p>
        </div>
      </div>

      {/* Traffic Summary Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Activity className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Streamed Events</p>
              <h3 className="font-bold text-2xl tabular-nums tracking-tight">{stats.total_streamed_events.count}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
              <Fingerprint className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Unique Sessions</p>
              <h3 className="font-bold text-2xl tabular-nums tracking-tight">{stats.total_unique_session.count}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-sky-500/10 p-3 text-sky-500">
              <Globe className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">Unique IPs</p>
              <h3 className="font-bold text-2xl tabular-nums tracking-tight">{stats.total_unique_ip.count}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted shadow-sm transition-all hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
              <DollarSign className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                Checkout Conversions
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-2xl tabular-nums tracking-tight">{stats.total_purchased.count}</h3>
                <span className="font-semibold text-emerald-600 text-xs dark:text-emerald-500">
                  ({stats.total_purchased.percentage ?? 0}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Breakdown Sub-grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <FunnelCard
          title="Product Views"
          count={stats.total_view.count}
          percentage={stats.total_view.percentage ?? 0}
          icon={<Eye className="size-4" />}
          colorClass="text-amber-500 bg-amber-500/10"
        />
        <FunnelCard
          title="Clicks"
          count={stats.total_clicked.count}
          percentage={stats.total_clicked.percentage ?? 0}
          icon={<MousePointerClick className="size-4" />}
          colorClass="text-indigo-500 bg-indigo-500/10"
        />
        <FunnelCard
          title="Cart Updates"
          count={stats.total_add_to_cart.count}
          percentage={stats.total_add_to_cart.percentage ?? 0}
          icon={<ShoppingCart className="size-4" />}
          colorClass="text-blue-500 bg-blue-500/10"
        />
        <FunnelCard
          title="Searches"
          count={stats.total_searched.count}
          percentage={stats.total_searched.percentage ?? 0}
          icon={<Search className="size-4" />}
          colorClass="text-purple-500 bg-purple-500/10"
        />
        <FunnelCard
          title="Wishlisted"
          count={stats.total_wishlisted.count}
          percentage={stats.total_wishlisted.percentage ?? 0}
          icon={<Heart className="size-4" />}
          colorClass="text-rose-500 bg-rose-500/10"
        />
      </div>

      {/* Filter and search actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Event Filters</CardTitle>
          <CardDescription>Narrow down events by keywords, session identifier, or event categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search session ID, IP, user name, search query, or product details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-lg bg-muted/20 pl-9"
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                value={eventType}
                onValueChange={(val) => {
                  setEventType(val);
                  setPage(1); // Reset page on filter change
                }}
              >
                <SelectTrigger className="h-10 rounded-lg bg-muted/20">
                  <SelectValue placeholder="Filter by event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Event Types</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="cart">Cart Update</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="view">Product View</SelectItem>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="wishlist">Wishlist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="w-[80px] font-semibold text-foreground">ID</TableHead>
                <TableHead className="w-[120px] font-semibold text-foreground">Event Type</TableHead>
                <TableHead className="w-[160px] font-semibold text-foreground">User Account</TableHead>
                <TableHead className="min-w-[280px] font-semibold text-foreground">Product / Action Context</TableHead>
                <TableHead className="w-[180px] font-semibold text-foreground">Session ID</TableHead>
                <TableHead className="w-[130px] font-semibold text-foreground">IP Address</TableHead>
                <TableHead className="w-[130px] font-semibold text-foreground">Device / OS</TableHead>
                <TableHead className="w-[180px] font-semibold text-foreground">Created At</TableHead>
                <TableHead className="w-[100px] text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: perPage }).map((_, idx) => (
                  <TableRow key={`skele-${idx}`} className="animate-pulse">
                    <TableCell>
                      <div className="h-5 w-8 rounded bg-muted/50" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 rounded-full bg-muted/50" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-24 rounded bg-muted/50" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-lg bg-muted/50" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-4 w-2/3 rounded bg-muted/50" />
                          <div className="h-3 w-1/3 rounded bg-muted/50" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-36 rounded bg-muted/50" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-24 rounded bg-muted/50" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-20 rounded bg-muted/50" />
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-28 rounded bg-muted/50" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="ml-auto h-8 w-16 rounded bg-muted/50" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="size-8" />
                      <p className="font-medium">Failed to retrieve user behaviour logs.</p>
                      <p className="text-muted-foreground text-xs">
                        Verify base backend URLs or check developer settings.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    No matching user activity events found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const deviceDetails = getDeviceDetails(log.device);
                  const formattedDate = new Date(log.created_at).toLocaleString();

                  return (
                    <TableRow key={log.id} className="group transition-colors hover:bg-muted/40">
                      <TableCell className="font-semibold text-muted-foreground tabular-nums">{log.id}</TableCell>
                      <TableCell>{getEventBadge(log.event_type)}</TableCell>
                      <TableCell>
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted font-bold text-primary text-xs uppercase">
                              {log.user.full_name.charAt(0)}
                            </div>
                            <div className="flex max-w-[120px] flex-col gap-0.5">
                              <span className="truncate font-semibold text-xs leading-none">{log.user.full_name}</span>
                              {log.user.email && (
                                <span
                                  className="mt-0.5 truncate text-[10px] text-muted-foreground leading-none"
                                  title={log.user.email}
                                >
                                  {log.user.email}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="h-4.5 select-none bg-muted/40 px-1.5 py-0 font-medium text-[10px] text-muted-foreground leading-none"
                          >
                            Guest
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.product ? (
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                              <img
                                src={getProductImageUrl(log.product.product_thumbnail_img)}
                                alt={log.product.title}
                                className="size-full object-cover"
                              />
                            </div>
                            <div className="flex max-w-[280px] flex-col gap-0.5">
                              <span className="truncate font-semibold text-sm">{log.product.title}</span>
                              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                <span className="font-mono">{log.product.sku}</span>
                                <span>•</span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-500">
                                  ৳{log.product.selling_price}
                                </span>
                              </div>
                              {(log.main_category || log.sub_category) && (
                                <div className="mt-1 flex items-center gap-1">
                                  {log.main_category && (
                                    <Badge variant="outline" className="h-4 px-1 py-0 text-[9px] leading-none">
                                      {log.main_category.name}
                                    </Badge>
                                  )}
                                  {log.sub_category && (
                                    <Badge
                                      variant="outline"
                                      className="h-4 bg-muted/20 px-1 py-0 text-[9px] leading-none"
                                    >
                                      {log.sub_category.name}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : log.event_type === "search" && log.search_query ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium text-sm">Keywords searched</span>
                            <Badge variant="secondary" className="px-2 py-0.5 font-mono text-xs">
                              "{log.search_query}"
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
                            <Info className="size-4 shrink-0" />
                            <span>General action context (Session startup / checkout)</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-[180px] items-center gap-2">
                          <span className="truncate font-mono text-xs" title={log.session_id}>
                            {log.session_id}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() => handleCopySession(log.session_id)}
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs tabular-nums">
                        {log.ip_address || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2" title={log.device || "Unknown Browser"}>
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/60">
                            {deviceDetails.icon}
                          </div>
                          <span className="max-w-[80px] truncate font-medium text-muted-foreground text-xs">
                            {deviceDetails.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground/80" />
                          {formattedDate}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="h-8 gap-1.5 rounded-lg px-2.5 font-semibold text-xs shadow-sm hover:bg-muted/80"
                        >
                          <Eye className="size-3.5" />
                          Payload
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        {!isLoading && !isError && totalLogs > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t bg-muted/5 p-4 sm:flex-row">
            <div className="text-muted-foreground text-xs">
              Showing <span className="font-semibold text-foreground">{(page - 1) * perPage + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{Math.min(page * perPage, totalLogs)}</span> of{" "}
              <span className="font-semibold text-foreground">{totalLogs}</span> entries
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>Rows per page:</span>
                <Select
                  value={perPage.toString()}
                  onValueChange={(val) => {
                    setPerPage(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-18 bg-transparent text-xs">
                    <SelectValue placeholder={perPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: Math.min(5, lastPage) }).map((_, i) => {
                  // Show pages around current_page
                  let pageNum = i + 1;
                  if (page > 3 && lastPage > 5) {
                    pageNum = page - 3 + i;
                    if (pageNum + (4 - i) > lastPage) {
                      pageNum = lastPage - 4 + i;
                    }
                  }
                  return (
                    <Button
                      key={`page-${pageNum}`}
                      variant={page === pageNum ? "default" : "outline"}
                      size="icon"
                      className="size-8 rounded-lg text-xs"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                  disabled={page >= lastPage}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Raw Event Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col rounded-2xl p-6">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <Activity className="size-5 text-emerald-500" />
              Event payload detail [ID: {selectedLog?.id}]
            </DialogTitle>
            <DialogDescription>
              Check full raw JSON event response schema sent from proxy server logging layers.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 flex-1 overflow-y-auto rounded-xl border bg-muted/30 p-4">
            {selectedLog && (
              <pre className="scrollbar-thin select-all whitespace-pre-wrap break-all font-mono text-xs leading-relaxed">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            )}
          </div>
          <div className="flex justify-end gap-3 border-t pt-3">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedLog) {
                  navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                  toast.success("Payload JSON copied to clipboard");
                }
              }}
              className="rounded-xl"
            >
              Copy JSON
            </Button>
            <Button onClick={() => setIsModalOpen(false)} className="rounded-xl">
              Dismiss
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
