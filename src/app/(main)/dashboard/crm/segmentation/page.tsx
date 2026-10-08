"use client";

import { ExcelExportButton } from "@/components/excel-export-button";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Award,
  Crown,
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
  X,
  Tag,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  DollarSign,
  BarChart3,
  Flame,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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

const DEFAULT_FALLBACK_RULES: CustomerSegmentRule[] = [
  {
    id: 1,
    key: "vip",
    name: "VIP Spenders",
    description: "Top spenders with high repeat orders and strong loyalty",
    color: "#f59e0b",
    priority: 1,
    min_order_value: 10000,
    min_orders_count: 5,
    recency_days_max: 90,
    min_delivery_success_rate: 70,
    is_active: true,
  },
  {
    id: 2,
    key: "high_value",
    name: "High Value Customer",
    description: "High basket size spenders who make substantial purchases",
    color: "#8b5cf6",
    priority: 2,
    min_order_value: 8000,
    max_order_value: 14999.99,
    recency_days_max: 90,
    is_active: true,
  },
  {
    id: 3,
    key: "returning",
    name: "Repeat Buyers",
    description: "Customers who placed 2 or more orders with steady engagement",
    color: "#3b82f6",
    priority: 3,
    min_orders_count: 2,
    recency_days_max: 60,
    min_delivery_success_rate: 60,
    is_active: true,
  },
  {
    id: 4,
    key: "new",
    name: "New Buyers",
    description: "Recently acquired buyers who placed their first order within 30 days",
    color: "#10b981",
    priority: 4,
    min_orders_count: 1,
    max_orders_count: 1,
    recency_days_max: 30,
    is_active: true,
  },
  {
    id: 5,
    key: "inactive",
    name: "At-Risk (Inactive)",
    description: "Past buyers who have not placed any order in 60+ days",
    color: "#a855f7",
    priority: 5,
    min_orders_count: 1,
    recency_days_min: 60,
    is_active: true,
  },
  {
    id: 6,
    key: "lost",
    name: "Return Risk",
    description: "Customers with high return rate or prolonged churn",
    color: "#ef4444",
    priority: 6,
    max_return_rate: 30,
    recency_days_min: 90,
    is_active: true,
  },
  {
    id: 7,
    key: "low_value",
    name: "Low Value Customer",
    description: "Buyers with total lifetime purchase value below ৳1,000",
    color: "#64748b",
    priority: 7,
    max_order_value: 1000,
    max_orders_count: 1,
    is_active: true,
  },
];

// Human-readable criteria summary generator
function getRuleCriteriaSummary(rule: any): string {
  const parts: string[] = [];
  if (rule.min_order_value && rule.max_order_value) {
    parts.push(`Spend ৳${Number(rule.min_order_value).toLocaleString()} - ৳${Number(rule.max_order_value).toLocaleString()}`);
  } else if (rule.min_order_value) {
    parts.push(`Spend ৳${Number(rule.min_order_value).toLocaleString()}+`);
  } else if (rule.max_order_value) {
    parts.push(`Spend under ৳${Number(rule.max_order_value).toLocaleString()}`);
  }

  if (rule.min_orders_count && rule.max_orders_count) {
    parts.push(`${rule.min_orders_count}-${rule.max_orders_count} orders`);
  } else if (rule.min_orders_count) {
    parts.push(`${rule.min_orders_count}+ orders`);
  } else if (rule.max_orders_count) {
    parts.push(`≤ ${rule.max_orders_count} orders`);
  }

  if (rule.recency_days_max && rule.recency_days_min) {
    parts.push(`Last order ${rule.recency_days_min}-${rule.recency_days_max}d ago`);
  } else if (rule.recency_days_max) {
    parts.push(`Joined/ordered in last ${rule.recency_days_max}d`);
  } else if (rule.recency_days_min) {
    parts.push(`No purchases in ${rule.recency_days_min}+ days`);
  }

  if (rule.min_delivery_success_rate) {
    parts.push(`${rule.min_delivery_success_rate}%+ success`);
  }
  if (rule.max_return_rate) {
    parts.push(`Return rate above ${rule.max_return_rate}%`);
  }

  return parts.length > 0 ? parts.join(" • ") : (rule.description || "Active criteria");
}

function getRuleTag(key: string): string {
  switch (key) {
    case "vip":
      return "VIP Tier";
    case "high_value":
      return "High Value";
    case "returning":
      return "Loyal";
    case "new":
      return "Recent";
    case "inactive":
      return "Re-engage";
    case "lost":
      return "High Risk";
    case "low_value":
      return "Budget";
    default:
      return "Segment";
  }
}

function getRuleFooterNote(key: string, count: number, percent: number): string {
  if (key === "lost" || key === "return_risk") {
    return count > 0 ? "Caution on COD" : "Zero risk";
  }
  if (key === "inactive" || key === "at_risk") {
    return count > 0 ? "Win-back target" : "0% of base";
  }
  return `${percent}% of base`;
}

function CustomerSegmentationContent() {
  const searchParams = useSearchParams();
  const segmentParam = searchParams.get("segment") || searchParams.get("tab");

  const { data: customerResponse, isLoading: isCustomersLoading, mutate: mutateCustomers } = useCustomers();
  const rawCustomers: any[] = customerResponse?.data || [];

  const { rules: fetchedRules, isLoading: isRulesLoading, mutate: mutateRules } = useSegmentationRules();
  const rules = React.useMemo(() => {
    return fetchedRules && fetchedRules.length > 0 ? fetchedRules : DEFAULT_FALLBACK_RULES;
  }, [fetchedRules]);

  const [selectedSegment, setSelectedSegment] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<string>("spent-desc");
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // Normalize segment parameter if alias is passed from routes
  const normalizeSegmentKey = React.useCallback((key: string | null): string => {
    if (!key) return "all";
    const clean = key.toLowerCase().trim();
    if (clean === "loyal" || clean === "repeat" || clean === "repeat_buyers") return "returning";
    if (clean === "at_risk" || clean === "at-risk" || clean === "risk") return "inactive";
    if (clean === "high_risk" || clean === "high-risk" || clean === "churn" || clean === "return_risk") return "lost";
    if (clean === "new_buyers") return "new";
    if (clean === "vip_spenders") return "vip";
    return clean;
  }, []);

  // Sync segment from URL query parameter
  React.useEffect(() => {
    if (segmentParam) {
      setSelectedSegment(normalizeSegmentKey(segmentParam));
      setPage(1);
    }
  }, [segmentParam, normalizeSegmentKey]);

  // Handle segment selection with URL route synchronization
  const handleSelectSegment = (key: string) => {
    setSelectedSegment(key);
    setPage(1);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (key === "all") {
        url.searchParams.delete("segment");
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("segment", key);
        url.searchParams.delete("tab");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Dynamic Rule Configuration Modal state
  const [isConfigOpen, setIsConfigOpen] = React.useState<boolean>(false);
  const [editableRules, setEditableRules] = React.useState<CustomerSegmentRule[]>([]);
  const [activeRuleKey, setActiveRuleKey] = React.useState<string>("vip");
  const [isSavingRules, setIsSavingRules] = React.useState<boolean>(false);
  const [isResettingRules, setIsResettingRules] = React.useState<boolean>(false);

  // Tab scroll navigation state & ref
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkTabScroll = React.useCallback(() => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  }, []);

  React.useEffect(() => {
    checkTabScroll();
    window.addEventListener("resize", checkTabScroll);
    return () => window.removeEventListener("resize", checkTabScroll);
  }, [checkTabScroll, rules]);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollDistance = 240;
      tabsContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      });
      setTimeout(checkTabScroll, 250);
    }
  };

  const openConfigModal = (ruleKey?: string) => {
    if (ruleKey && rules.some((r) => r.key === ruleKey)) {
      setActiveRuleKey(ruleKey);
    }
    setIsConfigOpen(true);
  };

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

  // Executive CRM Metrics for Hero Banner
  const crmStats = React.useMemo(() => {
    const total = processedCustomers.length;
    const totalRevenue = processedCustomers.reduce((sum, c) => sum + (c.spent || 0), 0);
    const totalOrders = processedCustomers.reduce((sum, c) => sum + (c.orderCount || 0), 0);
    const totalProducts = processedCustomers.reduce((sum, c) => sum + (c.productsCount || 0), 0);
    const avgSpend = total > 0 ? Math.round(totalRevenue / total) : 0;
    const repeatBuyers = processedCustomers.filter((c) => c.orderCount > 1).length;
    const repeatRate = total > 0 ? Math.round((repeatBuyers / total) * 100) : 0;

    return {
      total,
      totalRevenue,
      totalOrders,
      totalProducts,
      avgSpend,
      repeatBuyers,
      repeatRate,
    };
  }, [processedCustomers]);

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

  // Icon helper per segment
  const getSegmentIcon = (key: string, className = "w-4 h-4") => {
    switch (key) {
      case "vip":
        return <Crown className={cn(className, "text-amber-500")} />;
      case "high_value":
        return <Sparkles className={cn(className, "text-purple-500")} />;
      case "returning":
        return <RotateCcw className={cn(className, "text-blue-500")} />;
      case "new":
        return <UserCheck className={cn(className, "text-emerald-500")} />;
      case "inactive":
        return <Clock className={cn(className, "text-orange-500")} />;
      case "lost":
        return <UserX className={cn(className, "text-rose-500")} />;
      case "low_value":
        return <Tag className={cn(className, "text-slate-500")} />;
      default:
        return <Users className={cn(className, "text-primary")} />;
    }
  };

  const renderSegmentBadge = (customer: any) => {
    return (
      <Badge
        variant="outline"
        className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs gap-1.5 whitespace-nowrap"
        style={{
          backgroundColor: `${customer.segmentColor}12`,
          color: customer.segmentColor,
          borderColor: `${customer.segmentColor}35`,
        }}
      >
        <span
          className="inline-block w-2 h-2 rounded-full shadow-xs shrink-0"
          style={{ backgroundColor: customer.segmentColor }}
        />
        {customer.segmentName}
      </Badge>
    );
  };

  // Active filter rule object
  const currentActiveRule = rules.find((r) => r.key === selectedSegment);

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Customer Segmentation</h1>
          <p className="text-muted-foreground text-sm">Manage customer segments and classification rules.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configure Rules Modal */}
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <SlidersHorizontal className="mr-2 size-4" />
                Configure Rules
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl lg:max-w-5xl w-[95vw] h-[88vh] max-h-[850px] p-0 flex flex-col overflow-hidden shadow-2xl border-border">
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
                            Use this for <strong>Inactive</strong> or <strong>Lost</strong> customers who haven't ordered in days.
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

      {/* Customer Segmentation Cohorts Card Container */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <span>Customer Segmentation Cohorts</span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Targeted behavioral clusters for retention, personalized re-engagement, and risk mitigation.
              </CardDescription>
            </div>
            {selectedSegment !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectSegment("all")}
                className="text-xs gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                View All Segments
              </Button>
            ) : (
              <Badge variant="secondary" className="text-xs px-2.5 py-1">
                Showing All {segmentCounts.all || 0} Customers
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-3.5">
            {/* All Customers Card */}
            <div
              onClick={() => handleSelectSegment("all")}
              className={cn(
                "rounded-xl border p-4 bg-card transition-all cursor-pointer group shadow-2xs flex flex-col justify-between hover:shadow-xs",
                selectedSegment === "all"
                  ? "border-primary ring-2 ring-primary/20 shadow-md bg-primary/[0.04] dark:bg-primary/[0.08]"
                  : "hover:border-foreground/30"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Users className="size-4" />
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full font-medium">
                    All Base
                  </Badge>
                </div>
                <h4 className={cn("text-sm font-bold text-foreground transition-colors", selectedSegment === "all" && "text-primary")}>
                  All Customers
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Total directory base
                </p>
              </div>
              <div className="pt-3 border-t mt-3 flex items-baseline justify-between">
                <span className={cn("text-2xl font-bold text-foreground", selectedSegment === "all" && "text-primary")}>
                  {segmentCounts.all || 0}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  100% of base
                </span>
              </div>
            </div>

            {/* 7 Segment Cards */}
            {rules.map((rule) => {
              const isSelected = selectedSegment === rule.key;
              const count = segmentCounts[rule.key] || 0;
              const percentage = crmStats.total > 0 ? Math.round((count / crmStats.total) * 100) : 0;
              const tag = getRuleTag(rule.key);
              const criteria = getRuleCriteriaSummary(rule);
              const footerNote = getRuleFooterNote(rule.key, count, percentage);
              const isHighRisk = rule.key === "lost";

              return (
                <div
                  key={rule.key}
                  onClick={() => handleSelectSegment(isSelected ? "all" : rule.key)}
                  className={cn(
                    "rounded-xl border p-4 bg-card transition-all cursor-pointer group shadow-2xs flex flex-col justify-between hover:shadow-xs",
                    isSelected
                      ? "ring-2 shadow-md"
                      : "hover:border-foreground/30"
                  )}
                  style={{
                    borderColor: isSelected ? rule.color : undefined,
                    boxShadow: isSelected ? `0 0 0 1.5px ${rule.color}50, 0 4px 14px ${rule.color}18` : undefined,
                    backgroundColor: isSelected ? `${rule.color}0c` : undefined,
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="size-8 rounded-lg flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: `${rule.color}15`,
                          color: rule.color,
                        }}
                      >
                        {getSegmentIcon(rule.key, "size-4")}
                      </span>
                      <Badge
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
                        style={{
                          backgroundColor: `${rule.color}18`,
                          color: rule.color,
                          borderColor: `${rule.color}35`,
                        }}
                      >
                        {tag}
                      </Badge>
                    </div>

                    <h4
                      className="text-sm font-bold text-foreground transition-colors line-clamp-1"
                      style={{ color: isSelected ? rule.color : undefined }}
                    >
                      {rule.name}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1" title={criteria}>
                      {criteria}
                    </p>
                  </div>

                  <div className="pt-3 border-t mt-3 flex items-baseline justify-between">
                    <span
                      className={cn(
                        "text-2xl font-bold",
                        isHighRisk ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                      )}
                      style={{ color: isSelected ? rule.color : undefined }}
                    >
                      {count}
                    </span>
                    <span
                      className={cn(
                        "text-[11px]",
                        isHighRisk ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"
                      )}
                    >
                      {footerNote}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card with Sleek Tab Navigation System */}
      <Card className="gap-0 py-0">
        {/* Dedicated Modern Tab System Navigation Strip */}
        <div className="border-b bg-card/60 backdrop-blur-xs px-3 sm:px-4 py-2.5 flex items-center gap-2">
          {/* Scroll Left Chevron */}
          {canScrollLeft && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollTabs("left")}
              className="h-8 w-8 rounded-full border shadow-2xs shrink-0 hover:bg-muted"
              title="Scroll tabs left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Smooth Scroll Tab Container with ZERO native scrollbar */}
          <div
            ref={tabsContainerRef}
            onScroll={checkTabScroll}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* "All Customers" Tab Button */}
            <button
              type="button"
              onClick={() => handleSelectSegment("all")}
              className={cn(
                "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border",
                selectedSegment === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>All Customers</span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors",
                  selectedSegment === "all"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20 group-hover:text-foreground"
                )}
              >
                {segmentCounts.all || 0}
              </span>
            </button>

            {/* 7 Segment Tab Buttons */}
            {rules.map((rule) => {
              const isSelected = selectedSegment === rule.key;
              const count = segmentCounts[rule.key] || 0;

              return (
                <button
                  key={rule.key}
                  type="button"
                  onClick={() => handleSelectSegment(rule.key)}
                  className={cn(
                    "group relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border",
                    isSelected
                      ? "bg-card text-foreground shadow-xs font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  style={{
                    borderColor: isSelected ? `${rule.color}60` : undefined,
                    boxShadow: isSelected ? `0 0 0 1px ${rule.color}40, 0 1px 3px rgba(0,0,0,0.05)` : undefined,
                  }}
                >
                  {/* Colored Icon */}
                  <span
                    className="p-1 rounded-md shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: `${rule.color}15` }}
                  >
                    {getSegmentIcon(rule.key, "w-3.5 h-3.5")}
                  </span>

                  <span>{rule.name}</span>

                  {/* Count Pill */}
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono transition-colors",
                      isSelected
                        ? "text-white"
                        : count > 0
                        ? "bg-muted text-foreground"
                        : "bg-muted/50 text-muted-foreground/70"
                    )}
                    style={{
                      backgroundColor: isSelected ? rule.color : undefined,
                    }}
                  >
                    {count}
                  </span>

                  {/* Active bottom indicator line */}
                  {isSelected && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: rule.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Chevron */}
          {canScrollRight && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => scrollTabs("right")}
              className="h-8 w-8 rounded-full border shadow-2xs shrink-0 hover:bg-muted"
              title="Scroll tabs right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sub-Toolbar: Filter Info, Active Pill, Search & Sort */}
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b bg-card/40">
          {/* Left: Active cohort status & filter reset */}
          <div className="flex flex-wrap items-center gap-2.5">
            {selectedSegment === "all" ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="w-4 h-4 text-primary shrink-0" />
                <span>
                  Showing all <strong className="text-foreground">{filteredCustomers.length}</strong> customers across all CRM segmentation rules
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs gap-1.5"
                  style={{
                    backgroundColor: `${currentActiveRule?.color}15`,
                    color: currentActiveRule?.color,
                    borderColor: `${currentActiveRule?.color}40`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentActiveRule?.color }}
                  />
                  {currentActiveRule?.name} ({filteredCustomers.length})
                </Badge>

                {currentActiveRule && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {currentActiveRule.min_order_value ? `Spend ≥ ৳${Number(currentActiveRule.min_order_value).toLocaleString()}` : ""}
                    {currentActiveRule.recency_days_min ? `Inactive > ${currentActiveRule.recency_days_min} days` : ""}
                    {currentActiveRule.min_orders_count ? `Orders ≥ ${currentActiveRule.min_orders_count}` : ""}
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSegment("all");
                    setPage(1);
                  }}
                  className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filter
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openConfigModal(selectedSegment)}
                  className="h-7 text-xs px-2.5 gap-1 border-dashed hover:border-primary"
                >
                  <SlidersHorizontal className="w-3 h-3 text-primary" />
                  Edit Rule
                </Button>
              </div>
            )}
          </div>

          {/* Right: Instant Search & Multi-Criteria Sort */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-7 h-9 text-xs bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-xs w-[190px] bg-background">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Sort customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spent-desc">Spend: High to Low</SelectItem>
                <SelectItem value="spent-asc">Spend: Low to High</SelectItem>
                <SelectItem value="orders-desc">Orders: High to Low</SelectItem>
                <SelectItem value="orders-asc">Orders: Low to High</SelectItem>
                <SelectItem value="products-desc">Products Count: High</SelectItem>
                <SelectItem value="recency-desc">Recent Purchase First</SelectItem>
                <SelectItem value="recency-asc">Longest Inactive First</SelectItem>
                <SelectItem value="success-desc">Success Rate: High</SelectItem>
                <SelectItem value="return-desc">Return Rate: High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex justify-end px-4 py-2"><ExcelExportButton module="crm" title="Customer segmentation" /></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[220px]">Customer Profile</th>
                <th className="py-3 px-4 min-w-[150px]">Segment Status</th>
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
                    <td className="py-3.5 px-4"><Skeleton className="h-8 w-44" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-28" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-6 w-20" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto px-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xs border"
                        style={{
                          backgroundColor: currentActiveRule ? `${currentActiveRule.color}15` : undefined,
                          borderColor: currentActiveRule ? `${currentActiveRule.color}35` : undefined,
                        }}
                      >
                        {currentActiveRule ? (
                          getSegmentIcon(currentActiveRule.key, "w-8 h-8")
                        ) : (
                          <Users className="w-8 h-8 text-muted-foreground/60" />
                        )}
                      </div>

                      <div className="space-y-1 text-center">
                        <h3 className="font-bold text-lg text-foreground">
                          {selectedSegment !== "all" && currentActiveRule
                            ? `No "${currentActiveRule.name}" Customers Found`
                            : "No Customers Found"}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {searchQuery
                            ? `No customer records matched "${searchQuery}". Try a different name, phone, or ID.`
                            : selectedSegment !== "all" && currentActiveRule
                            ? `None of your customers currently meet the qualification criteria for ${currentActiveRule.name}. You can adjust the minimum spend, order count, or recency threshold in the rules.`
                            : "No customer records currently exist in your CRM database."}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {selectedSegment !== "all" && currentActiveRule && (
                          <Button
                            size="sm"
                            onClick={() => openConfigModal(currentActiveRule.key)}
                            className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Adjust {currentActiveRule.name} Criteria
                          </Button>
                        )}
                        {selectedSegment !== "all" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSegment("all");
                              setSearchQuery("");
                            }}
                            className="text-xs gap-1"
                          >
                            <Users className="w-3.5 h-3.5" />
                            View All Customers ({segmentCounts.all})
                          </Button>
                        )}
                        {searchQuery && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="text-xs gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            Clear Search
                          </Button>
                        )}
                      </div>
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
                          <Avatar className="h-9 w-9 border border-border/80 shadow-2xs">
                            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                              {getInitials(customer.full_name || "Customer")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1 group-hover:underline text-xs whitespace-nowrap"
                            >
                              <span>{customer.full_name || "Customer"}</span>
                              <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                            </Link>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                              <span className="font-mono text-primary font-bold">#{customer.id}</span>
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
                        <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border shadow-2xs">
                          <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                          {customer.orderCount}
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                          <Package className="w-3 h-3 text-primary" />
                          {customer.productsCount}
                        </span>
                      </td>

                      {/* Total Order Value */}
                      <td className="py-3.5 px-4 align-middle font-bold text-xs text-foreground whitespace-nowrap">
                        <span className="text-muted-foreground font-normal mr-0.5">৳</span>
                        {Number(customer.spent || 0).toLocaleString()}
                      </td>

                      {/* AOV */}
                      <td className="py-3.5 px-4 align-middle text-xs text-muted-foreground whitespace-nowrap">
                        <span className="text-muted-foreground/70 mr-0.5">৳</span>
                        {Number(customer.aov || 0).toLocaleString()}
                      </td>

                      {/* Success / Return Rate */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            {customer.successRate}% DLV
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[11px] font-semibold border",
                              customer.returnRate > 20
                                ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                                : "bg-muted text-muted-foreground border-transparent"
                            )}
                          >
                            {customer.returnRate}% RET
                          </span>
                        </div>
                      </td>

                      {/* Last Purchase Date */}
                      <td className="py-3.5 px-4 align-middle text-xs whitespace-nowrap">
                        {customer.lastOrderDate ? (
                          <div>
                            <div className="text-foreground font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {customer.lastOrderDate.toLocaleDateString()}
                            </div>
                            <div className="text-[11px] mt-0.5 flex items-center gap-1">
                              {customer.daysSinceLastOrder === 0 ? (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                                  Today
                                </Badge>
                              ) : customer.daysSinceLastOrder === 1 ? (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                  Yesterday
                                </Badge>
                              ) : (
                                <span className={customer.daysSinceLastOrder > 30 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
                                  {customer.daysSinceLastOrder} days ago
                                </span>
                              )}
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
                              title="Call Customer"
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
                              title="Message on WhatsApp"
                            >
                              <Send className="w-4 h-4" />
                            </a>
                          )}
                          <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1 hover:border-primary">
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              360 View
                              <ArrowRight className="w-3 h-3 opacity-60" />
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

export default function CustomerSegmentationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-sm text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          Loading Customer Segmentation...
        </div>
      }
    >
      <CustomerSegmentationContent />
    </React.Suspense>
  );
}
