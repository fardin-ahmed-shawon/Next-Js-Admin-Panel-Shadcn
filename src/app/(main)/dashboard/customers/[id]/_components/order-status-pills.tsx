"use client";

import * as React from "react";
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Undo2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Ban,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const VALID_ORDER_STATUSES = [
  "All",
  "Pending",
  "Confirmed",
  "Ready To Ship",
  "In-Courier",
  "Ship Later",
  "Hold",
  "Pending-Return",
  "Partial",
  "Returned",
  "Pre-Order",
  "Delivered",
  "Cancelled",
  "Missing",
  "Lost",
  "Fake",
  "Trash",
] as const;

export type ValidOrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export const VALID_PAYMENT_STATUSES = [
  "All",
  "Full Paid",
  "Partially Paid",
  "Unpaid",
  "Refund",
] as const;

export type ValidPaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

interface OrderStatusPillsProps {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  statusCounts?: Record<string, number>;
  className?: string;
}

export function OrderStatusPills({
  selectedStatus,
  onSelectStatus,
  statusCounts,
  className,
}: OrderStatusPillsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        className
      )}
    >
      {VALID_ORDER_STATUSES.map((status) => {
        const isSelected =
          selectedStatus.toLowerCase() === status.toLowerCase() ||
          (status === "All" && (selectedStatus === "ALL" || selectedStatus === "All"));
        const count = statusCounts ? statusCounts[status] : undefined;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onSelectStatus(status === "All" ? "ALL" : status)}
            className={cn(
              "px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-all border shrink-0 inline-flex items-center gap-1.5 cursor-pointer select-none",
              isSelected
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-sm"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/80 border-border"
            )}
          >
            <span>{status}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full leading-none font-semibold",
                  isSelected
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface PaymentStatusPillsProps {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  statusCounts?: Record<string, number>;
  className?: string;
}

export function PaymentStatusPills({
  selectedStatus,
  onSelectStatus,
  statusCounts,
  className,
}: PaymentStatusPillsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
        className
      )}
    >
      {VALID_PAYMENT_STATUSES.map((status) => {
        const isSelected =
          selectedStatus.toLowerCase() === status.toLowerCase() ||
          (status === "All" && (selectedStatus === "ALL" || selectedStatus === "All"));
        const count = statusCounts ? statusCounts[status] : undefined;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onSelectStatus(status === "All" ? "ALL" : status)}
            className={cn(
              "px-3 py-1 text-xs rounded-md font-medium whitespace-nowrap transition-all border shrink-0 inline-flex items-center gap-1.5 cursor-pointer select-none",
              isSelected
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-sm"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/80 border-border"
            )}
          >
            <span>{status}</span>
            {typeof count === "number" && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full leading-none font-semibold",
                  isSelected
                    ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Standardized Order Status Badge component for all valid statuses
 */
export function OrderStatusBadge({
  status,
  isPartial = false,
  className,
}: {
  status: string;
  isPartial?: boolean;
  className?: string;
}) {
  const s = status || "Pending";
  const lower = s.toLowerCase();

  if (lower === "partial" || isPartial) {
    return (
      <Badge
        className={cn(
          "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 gap-1 font-semibold hover:bg-amber-500/20",
          className
        )}
      >
        <RotateCcw className="size-3 shrink-0" />
        <span>Partial</span>
      </Badge>
    );
  }

  switch (lower) {
    case "pending":
      return (
        <Badge
          className={cn(
            "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-medium hover:bg-amber-500/20",
            className
          )}
        >
          <Clock className="size-3 shrink-0" /> Pending
        </Badge>
      );

    case "confirmed":
      return (
        <Badge
          className={cn(
            "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-medium hover:bg-blue-500/20",
            className
          )}
        >
          <CheckCircle2 className="size-3 shrink-0" /> Confirmed
        </Badge>
      );

    case "ready to ship":
      return (
        <Badge
          className={cn(
            "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 gap-1 font-medium hover:bg-indigo-500/20",
            className
          )}
        >
          <Package className="size-3 shrink-0" /> Ready To Ship
        </Badge>
      );

    case "in-courier":
      return (
        <Badge
          className={cn(
            "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1 font-medium hover:bg-purple-500/20",
            className
          )}
        >
          <Truck className="size-3 shrink-0" /> In-Courier
        </Badge>
      );

    case "ship later":
      return (
        <Badge
          className={cn(
            "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 gap-1 font-medium hover:bg-sky-500/20",
            className
          )}
        >
          <Calendar className="size-3 shrink-0" /> Ship Later
        </Badge>
      );

    case "hold":
      return (
        <Badge
          className={cn(
            "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 gap-1 font-medium",
            className
          )}
        >
          <AlertTriangle className="size-3 shrink-0" /> Hold
        </Badge>
      );

    case "pending-return":
      return (
        <Badge
          className={cn(
            "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1 font-medium",
            className
          )}
        >
          <Undo2 className="size-3 shrink-0" /> Pending-Return
        </Badge>
      );

    case "returned":
      return (
        <Badge
          variant="destructive"
          className={cn("gap-1 font-semibold bg-rose-600 hover:bg-rose-700", className)}
        >
          <RotateCcw className="size-3 shrink-0" /> Returned
        </Badge>
      );

    case "pre-order":
      return (
        <Badge
          className={cn(
            "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 gap-1 font-medium",
            className
          )}
        >
          <Clock className="size-3 shrink-0" /> Pre-Order
        </Badge>
      );

    case "delivered":
      return (
        <Badge
          className={cn(
            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium hover:bg-emerald-500/20",
            className
          )}
        >
          <CheckCircle2 className="size-3 shrink-0" /> Delivered
        </Badge>
      );

    case "cancelled":
      return (
        <Badge
          variant="outline"
          className={cn("text-rose-600 dark:text-rose-400 border-rose-300 gap-1 font-medium", className)}
        >
          <XCircle className="size-3 shrink-0" /> Cancelled
        </Badge>
      );

    case "missing":
      return (
        <Badge
          className={cn(
            "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 gap-1 font-medium",
            className
          )}
        >
          <AlertCircle className="size-3 shrink-0" /> Missing
        </Badge>
      );

    case "lost":
      return (
        <Badge
          variant="destructive"
          className={cn("gap-1 font-medium", className)}
        >
          <ShieldAlert className="size-3 shrink-0" /> Lost
        </Badge>
      );

    case "fake":
      return (
        <Badge
          variant="destructive"
          className={cn("gap-1 font-medium bg-red-700", className)}
        >
          <Ban className="size-3 shrink-0" /> Fake
        </Badge>
      );

    case "trash":
      return (
        <Badge
          variant="outline"
          className={cn("text-muted-foreground border-border gap-1 font-medium", className)}
        >
          <Trash2 className="size-3 shrink-0" /> Trash
        </Badge>
      );

    default:
      return (
        <Badge variant="secondary" className={className}>
          {s}
        </Badge>
      );
  }
}
