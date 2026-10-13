"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderActivityLogs, OrderActivityItem } from "@/hooks/useOrderActivityLogs";
import {
  Activity,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CreditCard,
  Flame,
  Layers,
  Loader2,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Send,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";

interface EmployeeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
  timeRangeLabel?: string;
  employee: {
    user_id: number;
    name: string;
    email: string;
    avatar: string;
    department_name: string;
    designation_title: string;
    performance_score: number;
    delivered_count: number;
    upsell_total: number;
  } | null;
}

export function EmployeeActivityModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  timeRangeLabel,
  employee,
}: EmployeeActivityModalProps) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(15);

  // Reset page when employee or date filters change
  React.useEffect(() => {
    setPage(1);
  }, [employee?.user_id, startDate, endDate]);

  const { logs, pagination, isLoading } = useOrderActivityLogs({
    userId: employee?.user_id,
    startDate,
    endDate,
    page,
    limit,
  });

  if (!employee) return null;

  const getActionBadge = (type: string) => {
    switch (type) {
      case "upsell":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-bold text-[11px]">
            <Flame className="size-3 text-emerald-500" /> Upsell Gain
          </Badge>
        );
      case "discount_edit":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Percent className="size-3 text-amber-500" /> Discount Edit
          </Badge>
        );
      case "shipping_edit":
        return (
          <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Truck className="size-3 text-sky-500" /> Shipping Edit
          </Badge>
        );
      case "product_removed":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Trash2 className="size-3 text-rose-500" /> Product Removed
          </Badge>
        );
      case "product_added":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Plus className="size-3 text-emerald-500" /> Product Added
          </Badge>
        );
      case "product_qty_edit":
        return (
          <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Layers className="size-3 text-indigo-500" /> Qty Changed
          </Badge>
        );
      case "product_price_edit":
        return (
          <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Tag className="size-3 text-violet-500" /> Price Adjusted
          </Badge>
        );
      case "product_variant_edit":
        return (
          <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <RefreshCw className="size-3 text-cyan-500" /> Variant Exchanged
          </Badge>
        );
      case "status_change":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <CheckCircle2 className="size-3 text-blue-500" /> Status Changed
          </Badge>
        );
      case "courier_sent":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <Send className="size-3 text-amber-500" /> Courier Sent
          </Badge>
        );
      case "customer_update":
        return (
          <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <UserCheck className="size-3 text-cyan-500" /> Customer Update
          </Badge>
        );
      case "payment_edit":
        return (
          <Badge className="bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 flex items-center gap-1 font-semibold text-[11px]">
            <CreditCard className="size-3 text-teal-500" /> Payment Edit
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 capitalize text-[11px]">
            <Activity className="size-3" /> {type.replace(/_/g, " ")}
          </Badge>
        );
    }
  };

  const initials = employee.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "E";

  const totalLogs = pagination?.total ?? logs.length;
  const totalPages = pagination?.last_page || 1;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-3xl sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col h-full bg-background border-l shadow-2xl z-50 overflow-hidden"
      >
        {/* Sticky Header Section */}
        <SheetHeader className="shrink-0 p-5 sm:p-6 border-b bg-muted/20 gap-0 text-left">
          {/* Top Row: Profile info + Score box + Dedicated Close button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar className="size-12 sm:size-14 border shadow-xs shrink-0">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="text-base font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle className="text-base sm:text-lg font-bold truncate">
                    {employee.name}
                  </SheetTitle>
                  <Badge variant="secondary" className="text-[10px] font-semibold py-0.5">
                    {employee.designation_title || "Executive"}
                  </Badge>
                </div>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5 truncate">
                  {employee.department_name} Department • {employee.email}
                </SheetDescription>
              </div>
            </div>

            {/* Score & Cross Button Container - Zero conflict */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right px-2.5 py-1 rounded-lg bg-card border shadow-2xs">
                <div className="text-xl sm:text-2xl font-black text-primary leading-none">
                  {employee.performance_score}
                </div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                  Score
                </div>
              </div>

              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  aria-label="Close activity log"
                >
                  <X className="size-4" />
                </Button>
              </SheetClose>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-border/60">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border text-xs shadow-2xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Package className="size-3.5 text-blue-500" /> Delivered Orders:
              </span>
              <span className="font-bold text-foreground text-sm">{employee.delivered_count}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-card border text-xs shadow-2xs">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <TrendingUp className="size-3.5 text-emerald-500" /> Upsell Credited:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                ৳{employee.upsell_total.toLocaleString()}
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* Audit Log Subheader: Title + Active Timeframe Badge */}
        <div className="shrink-0 px-5 sm:px-6 py-3 border-b bg-background flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              Audit Trail &amp; Activity Log
            </span>
            {totalLogs > 0 && (
              <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                {totalLogs} {totalLogs === 1 ? "activity" : "activities"}
              </Badge>
            )}
          </div>

          {/* Synced Timeframe Indicator */}
          {timeRangeLabel && (
            <Badge
              variant="outline"
              className="text-[10px] gap-1 py-0.5 px-2 bg-muted/40 font-normal border-primary/20 text-foreground"
            >
              <CalendarIcon className="size-3 text-primary" />
              <span>Period: <strong>{timeRangeLabel}</strong></span>
              {startDate && endDate && timeRangeLabel === "Custom Range" && (
                <span className="text-muted-foreground">({startDate} to {endDate})</span>
              )}
            </Badge>
          )}
        </div>

        {/* Scrollable Content Body with Proper Y-Axis Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium">Loading employee activity logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-xl bg-muted/10 p-6">
              <Activity className="size-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-semibold text-sm text-foreground">No recent activity found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                No orders edited, upsold, or updated for the selected time period.
              </p>
            </div>
          ) : (
            logs.map((log: OrderActivityItem) => (
              <div
                key={log.id}
                className="p-4 rounded-xl border bg-card hover:bg-muted/40 transition-colors shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getActionBadge(log.action_type)}
                    <Link
                      href={`/dashboard/orders/${log.order_no}`}
                      className="font-mono text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      #{log.order_no}
                    </Link>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0 font-medium">
                    <Clock className="size-3 text-muted-foreground/70" />
                    {new Date(log.created_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {log.description}
                </p>

                {/* Upsell Delta Highlight */}
                {log.action_type === "upsell" && log.details?.upsell_amount && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <TrendingUp className="size-3.5" /> Order Value Gain
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-300">
                      +৳{Number(log.details.upsell_amount).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Customer or Product details breakdown if present */}
                {log.details?.changes && Array.isArray(log.details.changes) && log.details.changes.length > 0 && (
                  <div className="mt-2 space-y-1.5 pt-2 border-t border-border/50">
                    {log.details.changes.map((change: string, idx: number) => (
                      <div key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="size-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" />
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sticky Pagination Footer (Matching Orders Page Table Design) */}
        {totalLogs > 0 && (
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t bg-muted/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rows per page:</span>
              <Select
                value={`${limit}`}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 15, 25, 50].map((s) => (
                    <SelectItem key={s} value={`${s}`} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground ml-2 hidden sm:inline">
                Showing {Math.min((page - 1) * limit + 1, totalLogs)} - {Math.min(page * limit, totalLogs)} of {totalLogs}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-muted-foreground mr-1.5">
                Page {page} of {totalPages}
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                className="size-7"
                onClick={() => setPage(1)}
                disabled={page <= 1 || isLoading}
                aria-label="First page"
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                className="size-7"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                className="size-7"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || isLoading}
                aria-label="Next page"
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                className="size-7"
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages || isLoading}
                aria-label="Last page"
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
