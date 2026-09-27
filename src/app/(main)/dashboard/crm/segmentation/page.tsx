"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Award,
  TrendingUp,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  Search,
  ExternalLink,
  PhoneCall,
  Send,
  ArrowUpDown,
  Filter,
  ShoppingBag,
  CreditCard,
  Percent,
  SlidersHorizontal,
  RefreshCw,
  Check,
  Package,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useCustomers,
  useSegmentationRules,
  saveSegmentationRulesBulk,
  resetSegmentationRules,
  CustomerSegmentRule,
} from "@/hooks/useCustomers";
import { TablePagination } from "@/app/(main)/dashboard/customers/[id]/_components/table-pagination";
import { cn, getInitials } from "@/lib/utils";

const COLOR_PRESETS = [
  "#f59e0b", // Amber / Gold
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f97316", // Orange
  "#ef4444", // Rose
  "#64748b", // Slate
  "#06b6d4", // Cyan
];

export default function CustomerSegmentationPage() {
  const { data: customerResponse, isLoading: isCustomersLoading, mutate: mutateCustomers } = useCustomers();
  const rawCustomers: any[] = customerResponse?.data || [];

  const { rules, isLoading: isRulesLoading, mutate: mutateRules } = useSegmentationRules();

  const [selectedSegment, setSelectedSegment] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("spent-desc");
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // Dynamic Rule Configuration Modal state
  const [isConfigOpen, setIsConfigOpen] = React.useState<boolean>(false);
  const [editableRules, setEditableRules] = React.useState<CustomerSegmentRule[]>([]);
  const [activeRuleKey, setActiveRuleKey] = React.useState<string>("vip");
  const [isSavingRules, setIsSavingRules] = React.useState<boolean>(false);
  const [isResettingRules, setIsResettingRules] = React.useState<boolean>(false);

  // Sync editable rules when backend rules arrive
  React.useEffect(() => {
    if (rules && rules.length > 0) {
      setEditableRules(JSON.parse(JSON.stringify(rules)));
      if (!activeRuleKey && rules[0]) {
        setActiveRuleKey(rules[0].key);
      }
    }
  }, [rules]);

  // Compute processed customer metrics and apply dynamic rules
  const processedCustomers = React.useMemo(() => {
    const activeRules = [...(rules || [])].filter((r) => r.is_active).sort((a, b) => a.priority - b.priority);

    return rawCustomers.map((c: any) => {
      const orders = c.orders || [];
      const orderCount = orders.length;
      const spent = orders.reduce((sum: number, o: any) => sum + Number(o.grand_total_amount || 0), 0);
      const aov = orderCount > 0 ? Math.round(spent / orderCount) : 0;

      // Ordered products count (sum of quantities across all orders)
      let productsCount = 0;
      orders.forEach((o: any) => {
        if (o.ordered_products && Array.isArray(o.ordered_products)) {
          o.ordered_products.forEach((p: any) => {
            productsCount += Number(p.qty || 1);
          });
        }
      });
      if (c.segment_metrics?.products_count !== undefined) {
        productsCount = c.segment_metrics.products_count;
      }

      const delivered = orders.filter((o: any) => o.order_status === "Delivered").length;
      const returned = orders.filter((o: any) =>
        ["Returned", "Partial", "Pending-Return"].includes(o.order_status) || Boolean(o.is_partial_return)
      ).length;

      const successRate = orderCount > 0 ? Math.round((delivered / orderCount) * 100) : 0;
      const returnRate = orderCount > 0 ? Math.round((returned / orderCount) * 100) : 0;

      let lastOrderDate: Date | null = null;
      let daysSinceLastOrder: number | null = null;
      if (orders.length > 0) {
        const timestamps = orders
          .map((o: any) => new Date(o.created_at).getTime())
          .filter((t: number) => !isNaN(t));
        if (timestamps.length > 0) {
          lastOrderDate = new Date(Math.max(...timestamps));
          const diffMs = new Date().getTime() - lastOrderDate.getTime();
          daysSinceLastOrder = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }
      }

      // Check matching rule dynamically against active rules
      let matchedRule: CustomerSegmentRule | null = null;
      for (const rule of activeRules) {
        let isMatch = true;

        // 1. Total Order Value (spent)
        if (rule.min_order_value !== null && rule.min_order_value !== undefined && spent < rule.min_order_value) {
          isMatch = false;
        }
        if (rule.max_order_value !== null && rule.max_order_value !== undefined && spent > rule.max_order_value) {
          isMatch = false;
        }

        // 2. Total Orders count
        if (rule.min_orders_count !== null && rule.min_orders_count !== undefined && orderCount < rule.min_orders_count) {
          isMatch = false;
        }
        if (rule.max_orders_count !== null && rule.max_orders_count !== undefined && orderCount > rule.max_orders_count) {
          isMatch = false;
        }

        // 3. Total Ordered Products count
        if (rule.min_products_count !== null && rule.min_products_count !== undefined && productsCount < rule.min_products_count) {
          isMatch = false;
        }
        if (rule.max_products_count !== null && rule.max_products_count !== undefined && productsCount > rule.max_products_count) {
          isMatch = false;
        }

        // 4. Last Purchase Date Scheduled (recency threshold)
        if (rule.recency_days_min !== null && rule.recency_days_min !== undefined) {
          if (daysSinceLastOrder === null || daysSinceLastOrder < rule.recency_days_min) {
            isMatch = false;
          }
        }
        if (rule.recency_days_max !== null && rule.recency_days_max !== undefined) {
          if (daysSinceLastOrder === null || daysSinceLastOrder > rule.recency_days_max) {
            isMatch = false;
          }
        }

        // 5. Delivery Success Rate %
        if (rule.min_delivery_success_rate !== null && rule.min_delivery_success_rate !== undefined && successRate < rule.min_delivery_success_rate) {
          isMatch = false;
        }

        // 6. Max Return Rate %
        if (rule.max_return_rate !== null && rule.max_return_rate !== undefined && returnRate > rule.max_return_rate) {
          isMatch = false;
        }

        if (isMatch) {
          matchedRule = rule;
          break;
        }
      }

      const segmentKey = matchedRule ? matchedRule.key : (c.dynamic_segment?.key || "standard");
      const segmentName = matchedRule ? matchedRule.name : (c.dynamic_segment?.name || "Standard Customer");
      const segmentColor = matchedRule ? matchedRule.color : (c.dynamic_segment?.color || "#64748b");

      return {
        ...c,
        orderCount,
        productsCount,
        spent,
        aov,
        delivered,
        returned,
        successRate,
        returnRate,
        lastOrderDate,
        daysSinceLastOrder,
        segmentKey,
        segmentName,
        segmentColor,
        matchedRule,
      };
    });
  }, [rawCustomers, rules]);

  // Count customers per segment
  const segmentCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: processedCustomers.length,
    };

    rules.forEach((r) => {
      counts[r.key] = 0;
    });

    processedCustomers.forEach((c) => {
      counts[c.segmentKey] = (counts[c.segmentKey] || 0) + 1;
    });

    return counts;
  }, [processedCustomers, rules]);

  // Filtering & Sorting
  const filteredCustomers = React.useMemo(() => {
    let result = [...processedCustomers];

    if (selectedSegment !== "all") {
      result = result.filter((c) => c.segmentKey === selectedSegment);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          String(c.id).includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "spent-desc") return b.spent - a.spent;
      if (sortBy === "spent-asc") return a.spent - b.spent;
      if (sortBy === "orders-desc") return b.orderCount - a.orderCount;
      if (sortBy === "orders-asc") return a.orderCount - b.orderCount;
      if (sortBy === "products-desc") return b.productsCount - a.productsCount;
      if (sortBy === "success-desc") return b.successRate - a.successRate;
      if (sortBy === "return-desc") return b.returnRate - a.returnRate;
      if (sortBy === "recency-desc") {
        const timeA = a.lastOrderDate ? a.lastOrderDate.getTime() : 0;
        const timeB = b.lastOrderDate ? b.lastOrderDate.getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "recency-asc") {
        const timeA = a.lastOrderDate ? a.lastOrderDate.getTime() : 0;
        const timeB = b.lastOrderDate ? b.lastOrderDate.getTime() : 0;
        return timeA - timeB;
      }
      return 0;
    });

    return result;
  }, [processedCustomers, selectedSegment, searchQuery, sortBy]);

  const paginatedCustomers = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, page, pageSize]);

  // Currently active rule in configuration modal
  const activeRuleIndex = editableRules.findIndex((r) => r.key === activeRuleKey);
  const selectedRule = activeRuleIndex >= 0 ? editableRules[activeRuleIndex] : editableRules[0];

  // Save modified rules
  const handleSaveRules = async () => {
    try {
      setIsSavingRules(true);
      await saveSegmentationRulesBulk(editableRules);
      toast.success("Segmentation rules updated successfully");
      setIsConfigOpen(false);
      mutateRules();
      mutateCustomers();
    } catch (err: any) {
      toast.error(err.message || "Failed to save segmentation rules");
    } finally {
      setIsSavingRules(false);
    }
  };

  // Reset rules to defaults
  const handleResetRules = async () => {
    if (!confirm("Are you sure you want to restore the default segmentation rules?")) return;
    try {
      setIsResettingRules(true);
      await resetSegmentationRules();
      toast.success("Segmentation rules restored to defaults");
      mutateRules();
      mutateCustomers();
      setIsConfigOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset rules");
    } finally {
      setIsResettingRules(false);
    }
  };

  const handleSelectedRuleChange = (field: keyof CustomerSegmentRule, value: any) => {
    if (activeRuleIndex < 0) return;
    setEditableRules((prev) => {
      const copy = [...prev];
      copy[activeRuleIndex] = { ...copy[activeRuleIndex], [field]: value };
      return copy;
    });
  };

  const renderSegmentBadge = (customer: any) => {
    return (
      <Badge
        variant="outline"
        className="text-xs font-semibold px-2 py-0.5"
        style={{
          backgroundColor: `${customer.segmentColor}15`,
          color: customer.segmentColor,
          borderColor: `${customer.segmentColor}40`,
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: customer.segmentColor }}
        />
        {customer.segmentName}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Customer Segmentation
            </h1>
            <Badge variant="secondary" className="font-semibold text-xs">
              Dynamic CRM Rules
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Classify your customer base into 7 core segments with dynamic rules: Order Value, Total Products, and Purchase Recency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configure Rules Modal */}
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-primary shadow-xs">
                <SlidersHorizontal className="w-4 h-4" />
                Configure Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[95vw] h-[88vh] max-h-[850px] p-0 flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-5 pb-4 border-b bg-card shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-bold text-foreground">Customer Segmentation Rules Setup</h2>
                      <Badge variant="secondary" className="text-xs">7 Core Segments</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure evaluation criteria for automatic customer classification based on order value, product volume, and purchase recency.
                    </p>
                  </div>
                </div>
              </div>

              {/* Master-Detail Split Layout */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-background">
                {/* Left Sidebar: 7 Segment Selector */}
                <div className="w-full md:w-[280px] border-b md:border-b-0 md:border-r bg-muted/20 flex flex-col shrink-0 overflow-y-auto p-3 space-y-1.5">
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <span>Segment Hierarchy</span>
                    <span title="Priority 1 is evaluated first">Order</span>
                  </div>

                  {editableRules.map((rule) => {
                    const isSelected = activeRuleKey === rule.key;
                    const count = segmentCounts[rule.key] || 0;

                    return (
                      <button
                        key={rule.key}
                        type="button"
                        onClick={() => setActiveRuleKey(rule.key)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between text-xs group",
                          isSelected
                            ? "bg-card border-primary/40 shadow-xs font-semibold"
                            : "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 ring-2 ring-background"
                            style={{ backgroundColor: rule.color }}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{rule.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {rule.is_active ? "Active" : "Disabled"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-mono">
                            #{rule.priority}
                          </Badge>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-medium text-foreground">
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Form Area: Selected Segment Configuration */}
                {selectedRule ? (
                  <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-card/40">
                    {/* Segment Header Box */}
                    <div className="p-4 rounded-xl border bg-card shadow-2xs space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-5 h-5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: selectedRule.color }}
                          />
                          <div>
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                              {selectedRule.name}
                              <Badge variant="outline" className="text-xs font-mono">
                                Priority #{selectedRule.priority}
                              </Badge>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {selectedRule.description || "Set specific qualification conditions for this customer segment."}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto bg-muted/40 px-3 py-1.5 rounded-lg border">
                          <Label htmlFor="active-toggle" className="text-xs font-medium cursor-pointer">
                            {selectedRule.is_active ? "Rule Enabled" : "Rule Disabled"}
                          </Label>
                          <Switch
                            id="active-toggle"
                            checked={selectedRule.is_active}
                            onCheckedChange={(val) => handleSelectedRuleChange("is_active", val)}
                          />
                        </div>
                      </div>

                      {/* Matching count indicator */}
                      <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          Currently matches: <strong className="text-foreground">{segmentCounts[selectedRule.key] || 0}</strong> customers
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px]">Badge Theme:</span>
                          <div className="flex items-center gap-1">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => handleSelectedRuleChange("color", color)}
                                className={cn(
                                  "w-4 h-4 rounded-full transition-transform",
                                  selectedRule.color === color ? "scale-125 ring-2 ring-primary ring-offset-1" : "hover:scale-110"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rule Factor 1: Total Order Value */}
                    <div className="p-4 rounded-xl border bg-card shadow-2xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">1. Total Order Value (Lifetime Spend)</h4>
                          <p className="text-xs text-muted-foreground">
                            Threshold for customer cumulative spend in BDT across all valid orders.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Minimum Spend (৳)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 15000 (No minimum if empty)"
                            className="h-9 text-xs"
                            value={selectedRule.min_order_value ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "min_order_value",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Maximum Spend (৳)</Label>
                          <Input
                            type="number"
                            placeholder="Unlimited if empty"
                            className="h-9 text-xs"
                            value={selectedRule.max_order_value ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "max_order_value",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rule Factor 2: Total Ordered Products */}
                    <div className="p-4 rounded-xl border bg-card shadow-2xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">2. Total Ordered Products (Units Count)</h4>
                          <p className="text-xs text-muted-foreground">
                            Total product quantity purchased by the customer across all their orders.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Minimum Products Quantity</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 5 items"
                            className="h-9 text-xs"
                            value={selectedRule.min_products_count ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "min_products_count",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Maximum Products Quantity</Label>
                          <Input
                            type="number"
                            placeholder="Unlimited if empty"
                            className="h-9 text-xs"
                            value={selectedRule.max_products_count ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "max_products_count",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rule Factor 3: Total Orders Count */}
                    <div className="p-4 rounded-xl border bg-card shadow-2xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">3. Total Orders Count</h4>
                          <p className="text-xs text-muted-foreground">
                            Total number of orders successfully placed by the customer.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Minimum Orders Count</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 2 for Returning Customer"
                            className="h-9 text-xs"
                            value={selectedRule.min_orders_count ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "min_orders_count",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Maximum Orders Count</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 1 for New / Single-order customers"
                            className="h-9 text-xs"
                            value={selectedRule.max_orders_count ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "max_orders_count",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rule Factor 4: Last Purchase Date Scheduled */}
                    <div className="p-4 rounded-xl border bg-card shadow-2xs space-y-3.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">4. Last Purchase Date Scheduled (Recency)</h4>
                            <p className="text-xs text-muted-foreground">
                              Control when a customer should be marked as New, Inactive, or Lost based on days since their last order.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Presets Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-medium text-muted-foreground mr-1">Quick Presets:</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => {
                            handleSelectedRuleChange("recency_days_min", null);
                            handleSelectedRuleChange("recency_days_max", null);
                          }}
                        >
                          Any Time (No Date Rule)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                          onClick={() => {
                            handleSelectedRuleChange("recency_days_min", null);
                            handleSelectedRuleChange("recency_days_max", 30);
                          }}
                        >
                          Within Last 30 Days (1 Month)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-amber-600 dark:text-amber-400 hover:text-amber-700"
                          onClick={() => {
                            handleSelectedRuleChange("recency_days_min", 7);
                            handleSelectedRuleChange("recency_days_max", null);
                          }}
                        >
                          No Order &gt; 7 Days
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-orange-600 dark:text-orange-400 hover:text-orange-700"
                          onClick={() => {
                            handleSelectedRuleChange("recency_days_min", 30);
                            handleSelectedRuleChange("recency_days_max", null);
                          }}
                        >
                          No Order &gt; 30 Days (Inactive)
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-rose-600 dark:text-rose-400 hover:text-rose-700"
                          onClick={() => {
                            handleSelectedRuleChange("recency_days_min", 90);
                            handleSelectedRuleChange("recency_days_max", null);
                          }}
                        >
                          No Order &gt; 90 Days (Lost)
                        </Button>
                      </div>

                      {/* Live Natural Language Explanation Banner */}
                      <div className="p-3 rounded-lg bg-muted/40 border text-xs flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary shrink-0" />
                        <div className="text-foreground">
                          <strong>Active Recency Rule: </strong>
                          {selectedRule.recency_days_min === null && selectedRule.recency_days_max === null ? (
                            <span>No date restriction. Customer qualifies regardless of when they last ordered.</span>
                          ) : selectedRule.recency_days_min !== null && selectedRule.recency_days_max !== null ? (
                            <span>
                              Customer must have ordered between <strong>{selectedRule.recency_days_min}</strong> and <strong>{selectedRule.recency_days_max}</strong> days ago.
                            </span>
                          ) : selectedRule.recency_days_max !== null ? (
                            <span>
                              Customer MUST have placed an order within the last <strong>{selectedRule.recency_days_max} days</strong> (Active / New buyer).
                            </span>
                          ) : (
                            <span>
                              Customer must NOT have placed any order in the last <strong>{selectedRule.recency_days_min} days</strong> (Inactive / Dormant buyer).
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {/* Option A: Inactive threshold */}
                        <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                          <Label className="text-xs font-semibold flex items-center justify-between">
                            <span className="text-foreground">No Order in Last (Days)</span>
                            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              For Inactive / Lost
                            </Badge>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g. 7, 30 (1 mo), or 90 (3 mos)"
                            className="h-9 text-xs"
                            value={selectedRule.recency_days_min ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "recency_days_min",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Use this for <strong>Inactive</strong> or <strong>Lost</strong> customers who haven't ordered in $X$ days.
                          </p>
                        </div>

                        {/* Option B: Active / Recent window */}
                        <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                          <Label className="text-xs font-semibold flex items-center justify-between">
                            <span className="text-foreground">Ordered Within Last (Days)</span>
                            <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              For New / Active
                            </Badge>
                          </Label>
                          <Input
                            type="number"
                            placeholder="e.g. 30 (purchased this month)"
                            className="h-9 text-xs"
                            value={selectedRule.recency_days_max ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "recency_days_max",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Use this for <strong>New</strong> or <strong>Returning</strong> customers who purchased recently.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rule Factor 5: Delivery & Fulfillment Reliability */}
                    <div className="p-4 rounded-xl border bg-card shadow-2xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">5. Delivery & Return Rates Quality (Optional)</h4>
                          <p className="text-xs text-muted-foreground">
                            Filter by courier parcel delivery success percentage or return risk.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Minimum Delivery Success Rate (%)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 70"
                            className="h-9 text-xs"
                            value={selectedRule.min_delivery_success_rate ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "min_delivery_success_rate",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Maximum Return Rate (%)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 20"
                            className="h-9 text-xs"
                            value={selectedRule.max_return_rate ?? ""}
                            onChange={(e) =>
                              handleSelectedRuleChange(
                                "max_return_rate",
                                e.target.value === "" ? null : Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Description and Label Notes */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Segment Label Description</Label>
                      <Textarea
                        rows={2}
                        className="text-xs"
                        placeholder="Internal description for this segment..."
                        value={selectedRule.description || ""}
                        onChange={(e) => handleSelectedRuleChange("description", e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-muted-foreground text-xs">
                    Select a segmentation rule from the left panel to configure its criteria.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-card flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetRules}
                  disabled={isResettingRules || isSavingRules}
                  className="gap-1.5 text-xs self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </Button>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfigOpen(false)}
                    disabled={isSavingRules}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveRules}
                    disabled={isSavingRules}
                    className="gap-1.5 text-xs bg-primary"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSavingRules ? "Saving Changes..." : "Apply & Save Rules"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              mutateCustomers();
              mutateRules();
            }}
            className="gap-1.5"
            disabled={isCustomersLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isCustomersLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 7 Core Segmentation Cohort Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {rules.map((rule) => {
          const isSelected = selectedSegment === rule.key;
          const count = segmentCounts[rule.key] || 0;

          return (
            <Card
              key={rule.key}
              onClick={() => {
                setSelectedSegment(isSelected ? "all" : rule.key);
                setPage(1);
              }}
              className={`cursor-pointer border transition-all hover:scale-[1.01] ${
                isSelected
                  ? "ring-2 shadow-xs"
                  : "hover:border-foreground/30 opacity-90 hover:opacity-100"
              }`}
              style={{
                borderColor: isSelected ? rule.color : undefined,
                boxShadow: isSelected ? `0 0 0 1px ${rule.color}` : undefined,
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: rule.color }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    #{rule.priority}
                  </span>
                </div>
                <div className="text-xl font-bold mt-1 text-foreground">{count}</div>
                <p className="text-xs font-medium text-foreground truncate mt-0.5" title={rule.name}>
                  {rule.name}
                </p>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {rule.min_order_value
                    ? `≥ ৳${Number(rule.min_order_value).toLocaleString()}`
                    : rule.recency_days_min
                    ? `> ${rule.recency_days_min}d inactive`
                    : "Rule active"}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Cohort Tabs */}
            <Tabs
              value={selectedSegment}
              onValueChange={(val) => {
                setSelectedSegment(val);
                setPage(1);
              }}
              className="w-full lg:w-auto overflow-x-auto"
            >
              <TabsList className="flex h-9 bg-muted/60 p-1 w-max">
                <TabsTrigger value="all" className="text-xs">
                  All ({segmentCounts.all})
                </TabsTrigger>
                {rules.map((r) => (
                  <TabsTrigger key={r.key} value={r.key} className="text-xs">
                    {r.name} ({segmentCounts[r.key] || 0})
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Search and Sort controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customer, phone, ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 text-xs w-[185px]">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Sort customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spent-desc">Spend: High to Low</SelectItem>
                  <SelectItem value="spent-asc">Spend: Low to High</SelectItem>
                  <SelectItem value="products-desc">Products Count: High</SelectItem>
                  <SelectItem value="orders-desc">Orders: High to Low</SelectItem>
                  <SelectItem value="recency-desc">Recent Purchase First</SelectItem>
                  <SelectItem value="recency-asc">Longest Inactive First</SelectItem>
                  <SelectItem value="success-desc">Success Rate: High</SelectItem>
                  <SelectItem value="return-desc">Return Rate: High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Customer Profile</th>
                <th className="py-3 px-4">Segment Status</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4">Total Order Value</th>
                <th className="py-3 px-4">Avg Order Value</th>
                <th className="py-3 px-4">Delivery / Return %</th>
                <th className="py-3 px-4">Last Purchase</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isCustomersLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-8 w-36" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-10 h-10 text-muted-foreground/40" />
                      <p className="font-medium text-sm">No customers matched this segmentation criteria.</p>
                      <p className="text-xs text-muted-foreground">
                        Try selecting another segment tab, adjusting the rules, or clearing your search.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer: any) => {
                  const phoneClean = customer.phone ? customer.phone.replace(/[^0-9]/g, "") : "";

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {getInitials(customer.full_name || "Customer")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 group-hover:underline text-xs"
                            >
                              <span>{customer.full_name || "Customer"}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </Link>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-primary font-medium">#{customer.id}</span>
                              {customer.phone && (
                                <>
                                  <span>•</span>
                                  <span>{customer.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Dynamic Segment Badge */}
                      <td className="py-3.5 px-4 align-middle">
                        {renderSegmentBadge(customer)}
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground">
                          {customer.orderCount}
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {customer.productsCount}
                        </span>
                      </td>

                      {/* Total Order Value */}
                      <td className="py-3.5 px-4 align-middle font-medium text-xs text-foreground">
                        ৳{Number(customer.spent || 0).toLocaleString()}
                      </td>

                      {/* AOV */}
                      <td className="py-3.5 px-4 align-middle text-xs text-muted-foreground">
                        ৳{Number(customer.aov || 0).toLocaleString()}
                      </td>

                      {/* Success / Return Rate */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-emerald-600 font-medium">
                            {customer.successRate}% DLV
                          </span>
                          <span className="text-muted-foreground/60">/</span>
                          <span className={`${customer.returnRate > 20 ? "text-rose-600 font-semibold" : "text-muted-foreground"}`}>
                            {customer.returnRate}% RET
                          </span>
                        </div>
                      </td>

                      {/* Last Purchase Date Scheduled */}
                      <td className="py-3.5 px-4 align-middle text-xs">
                        {customer.lastOrderDate ? (
                          <div>
                            <div className="text-foreground font-medium">
                              {customer.lastOrderDate.toLocaleDateString()}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {customer.daysSinceLastOrder === 0
                                ? "Today"
                                : customer.daysSinceLastOrder === 1
                                ? "Yesterday"
                                : `${customer.daysSinceLastOrder} days ago`}
                            </div>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground/70">No purchases</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {customer.phone && (
                            <a
                              href={`tel:${customer.phone}`}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Call"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </a>
                          )}
                          {customer.phone && (
                            <a
                              href={`https://wa.me/${phoneClean.startsWith("0") ? "88" + phoneClean : phoneClean}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors"
                              title="WhatsApp"
                            >
                              <Send className="w-4 h-4" />
                            </a>
                          )}
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs font-medium">
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              Profile
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={filteredCustomers.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </Card>
    </div>
  );
}
