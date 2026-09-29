"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrderActivityLogs, OrderActivityItem } from "@/hooks/useOrderActivityLogs";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit3,
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
} from "lucide-react";
import Link from "next/link";

interface EmployeeActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  employee,
}: EmployeeActivityModalProps) {
  const { logs, isLoading } = useOrderActivityLogs({
    userId: employee?.user_id,
    limit: 50,
  });

  if (!employee) return null;

  const getActionBadge = (type: string) => {
    switch (type) {
      case "upsell":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-bold">
            <Flame className="w-3 h-3 text-emerald-500" /> Upsell Gain
          </Badge>
        );
      case "discount_edit":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-semibold">
            <Percent className="w-3 h-3 text-amber-500" /> Discount Edit
          </Badge>
        );
      case "shipping_edit":
        return (
          <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 flex items-center gap-1 font-semibold">
            <Truck className="w-3 h-3 text-sky-500" /> Shipping Edit
          </Badge>
        );
      case "product_removed":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 flex items-center gap-1 font-semibold">
            <Trash2 className="w-3 h-3 text-rose-500" /> Product Removed
          </Badge>
        );
      case "product_added":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 font-semibold">
            <Plus className="w-3 h-3 text-emerald-500" /> Product Added
          </Badge>
        );
      case "product_qty_edit":
        return (
          <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 flex items-center gap-1 font-semibold">
            <Layers className="w-3 h-3 text-indigo-500" /> Qty Changed
          </Badge>
        );
      case "product_price_edit":
        return (
          <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30 flex items-center gap-1 font-semibold">
            <Tag className="w-3 h-3 text-violet-500" /> Price Adjusted
          </Badge>
        );
      case "product_variant_edit":
        return (
          <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 flex items-center gap-1 font-semibold">
            <RefreshCw className="w-3 h-3 text-cyan-500" /> Variant Exchanged
          </Badge>
        );
      case "status_change":
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-blue-500" /> Status Changed
          </Badge>
        );
      case "courier_sent":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1 font-semibold">
            <Send className="w-3 h-3 text-amber-500" /> Courier Sent
          </Badge>
        );
      case "customer_update":
        return (
          <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 flex items-center gap-1 font-semibold">
            <UserCheck className="w-3 h-3 text-cyan-500" /> Customer Update
          </Badge>
        );
      case "payment_edit":
        return (
          <Badge className="bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 flex items-center gap-1 font-semibold">
            <CreditCard className="w-3 h-3 text-teal-500" /> Payment Edit
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 capitalize">
            <Activity className="w-3 h-3" /> {type.replace(/_/g, " ")}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="text-lg font-bold">
                {employee.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold">{employee.name}</DialogTitle>
                <Badge variant="secondary" className="text-xs">
                  {employee.designation_title}
                </Badge>
              </div>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                {employee.department_name} Department • {employee.email}
              </DialogDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-primary">
                {employee.performance_score}
              </div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Score
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border/40 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-500" /> Delivered Orders:
              </span>
              <span className="font-bold text-foreground">{employee.delivered_count}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border/40 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Upsell Credited:
              </span>
              <span className="font-bold text-emerald-600">৳{employee.upsell_total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Audit Trail & Activity Log
          </h3>

          <ScrollArea className="flex-1 pr-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-sm">Loading activity logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="font-medium text-sm text-foreground">No recent activity logged yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Actions like order edits, upsells, status updates and courier clicks will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log: OrderActivityItem) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border bg-card hover:bg-muted/40 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActionBadge(log.action_type)}
                        <Link
                          href={`/dashboard/orders/${log.order_no}`}
                          className="font-mono text-xs font-bold text-primary hover:underline"
                        >
                          #{log.order_no}
                        </Link>
                      </div>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground leading-relaxed">
                      {log.description}
                    </p>

                    {/* Upsell Delta Highlight */}
                    {log.action_type === "upsell" && log.details?.upsell_amount && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> Order Value Gain
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-300">
                          +৳{Number(log.details.upsell_amount).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Customer or Product details breakdown if present */}
                    {log.details?.changes && Array.isArray(log.details.changes) && (
                      <div className="mt-2 space-y-1">
                        {log.details.changes.map((change: string, idx: number) => (
                          <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            {change}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
