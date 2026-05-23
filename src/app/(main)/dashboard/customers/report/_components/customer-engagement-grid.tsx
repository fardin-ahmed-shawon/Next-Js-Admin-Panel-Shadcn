"use client";

import * as React from "react";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
  ShieldAlert,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type EngagementStatus = "Active" | "Inactive" | "Banned";

interface EngagementCustomer {
  name: string;
  phone: string;
  avatar: string;
  orders: number;
  spent: number;
  status: EngagementStatus;
  /** Active → last order time, Inactive → days since last, Banned → ban reason */
  meta: string;
  metaSub?: string;
}

const allCustomers: EngagementCustomer[] = [
  // Active
  {
    name: "Nusrat Jahan",
    phone: "+880 1614-567890",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NJ",
    orders: 42,
    spent: 28750,
    status: "Active",
    meta: "2 hours ago",
  },
  {
    name: "Arham Khan",
    phone: "+880 1711-234567",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AK",
    orders: 24,
    spent: 12450,
    status: "Active",
    meta: "1 day ago",
  },
  {
    name: "Maliha Sultana",
    phone: "+880 1918-901234",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MS",
    orders: 31,
    spent: 18500,
    status: "Active",
    meta: "2 days ago",
  },
  {
    name: "Fatima Akter",
    phone: "+880 1812-345678",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=FA",
    orders: 18,
    spent: 8920,
    status: "Active",
    meta: "3 days ago",
  },
  {
    name: "Ayesha Siddiqua",
    phone: "+880 1520-123456",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=AS",
    orders: 28,
    spent: 15200,
    status: "Active",
    meta: "4 days ago",
  },
  {
    name: "Imran Haque",
    phone: "+880 1817-890123",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=IH",
    orders: 15,
    spent: 9820,
    status: "Active",
    meta: "5 days ago",
  },
  {
    name: "Kamal Hossain",
    phone: "+880 1721-234567",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=KH",
    orders: 9,
    spent: 5430,
    status: "Active",
    meta: "1 week ago",
  },
  {
    name: "Tanvir Hossain",
    phone: "+880 1515-678901",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=TH",
    orders: 7,
    spent: 3680,
    status: "Active",
    meta: "2 weeks ago",
  },
  // Inactive
  {
    name: "Rahim Uddin",
    phone: "+880 1913-456789",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RU",
    orders: 3,
    spent: 1250,
    status: "Inactive",
    meta: "120 days inactive",
  },
  {
    name: "Sadia Rahman",
    phone: "+880 1716-789012",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=SR",
    orders: 1,
    spent: 580,
    status: "Inactive",
    meta: "150 days inactive",
  },
  {
    name: "Rafiq Islam",
    phone: "+880 1619-012345",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RI",
    orders: 1,
    spent: 450,
    status: "Inactive",
    meta: "90 days inactive",
  },
  {
    name: "Priya Das",
    phone: "+880 1822-345678",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=PD",
    orders: 2,
    spent: 1200,
    status: "Inactive",
    meta: "180 days inactive",
  },
  {
    name: "Habibur Rahman",
    phone: "+880 1511-987654",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=HR",
    orders: 5,
    spent: 3200,
    status: "Inactive",
    meta: "240 days inactive",
  },
  {
    name: "Monir Hossain",
    phone: "+880 1611-987654",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=MH",
    orders: 2,
    spent: 890,
    status: "Inactive",
    meta: "210 days inactive",
  },
  // Banned
  {
    name: "Shahid Mia",
    phone: "+880 1813-765432",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=SM",
    orders: 6,
    spent: 0,
    status: "Banned",
    meta: "Multiple fraudulent chargebacks",
    metaSub: "Banned on 2025-12-10",
  },
  {
    name: "Raju Ahmed",
    phone: "+880 1913-765432",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=RA",
    orders: 12,
    spent: 4500,
    status: "Banned",
    meta: "Repeated abusive behaviour towards delivery staff",
    metaSub: "Banned on 2026-01-22",
  },
  {
    name: "Nasir Uddin",
    phone: "+880 1712-876543",
    avatar: "https://placehold.co/48x48/1a1a2e/e0e0e0?text=NU",
    orders: 3,
    spent: 980,
    status: "Banned",
    meta: "Violation of terms of service",
    metaSub: "Banned on 2026-03-05",
  },
];

type StatusFilter = "All" | "Active" | "Inactive" | "Banned";
const statusFilters: StatusFilter[] = ["All", "Active", "Inactive", "Banned"];

type SortField = "name" | "spent" | "orders";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusConfig: Record<
  EngagementStatus,
  {
    color: string;
    border: string;
    bg: string;
    icon: React.ElementType;
    badgeVariant: "default" | "outline" | "destructive" | "secondary";
  }
> = {
  Active: {
    color: "text-emerald-600",
    border: "border-emerald-600/20 hover:border-emerald-600/40",
    bg: "",
    icon: UserCheck,
    badgeVariant: "default",
  },
  Inactive: {
    color: "text-amber-600",
    border: "border-amber-600/20 hover:border-amber-600/40",
    bg: "",
    icon: UserMinus,
    badgeVariant: "outline",
  },
  Banned: {
    color: "text-destructive",
    border: "border-destructive/20 hover:border-destructive/40",
    bg: "bg-destructive/5",
    icon: ShieldAlert,
    badgeVariant: "destructive",
  },
};

function exportCustomers(data: EngagementCustomer[]) {
  const headers = ["Name", "Phone", "Status", "Orders", "Total Spent", "Details"];
  const csvRows = [
    headers.join(","),
    ...data.map((r) => [`"${r.name}"`, `"${r.phone}"`, r.status, r.orders, r.spent, `"${r.meta}"`].join(",")),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "customer-engagement.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CustomerEngagementGrid() {
  const [filter, setFilter] = React.useState<StatusFilter>("All");
  const [search, setSearch] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>("spent");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(6);

  // Filter
  const filtered = React.useMemo(() => {
    let result = allCustomers;
    if (filter !== "All") result = result.filter((c) => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q));
    }
    return result;
  }, [filter, search]);

  // Sort
  const sorted = React.useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "spent") cmp = a.spent - b.spent;
      else cmp = a.orders - b.orders;
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortAsc]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const paged = sorted.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize);

  const canPrev = safePageIndex > 0;
  const canNext = safePageIndex < totalPages - 1;

  // Count badges
  const activeCount = allCustomers.filter((c) => c.status === "Active").length;
  const inactiveCount = allCustomers.filter((c) => c.status === "Inactive").length;
  const bannedCount = allCustomers.filter((c) => c.status === "Banned").length;

  const filterCounts: Record<StatusFilter, number> = {
    All: allCustomers.length,
    Active: activeCount,
    Inactive: inactiveCount,
    Banned: bannedCount,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-5" />
          Customer Engagement
        </CardTitle>
        <CardDescription>Active, inactive, and banned customers &middot; {sorted.length} total</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={() => exportCustomers(sorted)}>
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 w-48 rounded-[min(var(--radius-md),12px)] pl-8"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
              />
            </div>

            <ToggleGroup
              className="bg-muted p-0.75 text-muted-foreground **:data-[slot=toggle-group-item]:rounded-md **:data-[slot=toggle-group-item]:border **:data-[slot=toggle-group-item]:border-transparent **:data-[slot=toggle-group-item]:text-foreground/60 **:data-[slot=toggle-group-item]:hover:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:bg-background [&_[data-slot=toggle-group-item][data-state=on]]:text-foreground [&_[data-slot=toggle-group-item][data-state=on]]:shadow-sm dark:[&_[data-slot=toggle-group-item][data-state=on]]:border-input dark:[&_[data-slot=toggle-group-item][data-state=on]]:bg-input/30"
              onValueChange={(v) => {
                if (!v) return;
                setFilter(v as StatusFilter);
                setPageIndex(0);
              }}
              size="sm"
              spacing={1}
              type="single"
              value={filter}
            >
              {statusFilters.map((f) => (
                <ToggleGroupItem key={f} value={f}>
                  {f} <span className="ml-1 text-[10px] text-muted-foreground">({filterCounts[f]})</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={sortField}
              onValueChange={(v) => {
                setSortField(v as SortField);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-28">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spent">Spent</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button size="icon-sm" variant="outline" onClick={() => setSortAsc((p) => !p)}>
              <ArrowUpDown />
            </Button>
          </div>
        </div>

        {/* 3‑column Card Grid */}
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No customers found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paged.map((c, i) => {
              const cfg = statusConfig[c.status];
              return (
                <div
                  key={`${c.phone}-${i}`}
                  className={`rounded-lg border p-4 transition-colors ${cfg.border} ${cfg.bg} flex flex-col gap-3`}
                >
                  {/* Avatar + Identity */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 shrink-0 overflow-hidden rounded-full border bg-muted ${c.status === "Banned" ? "opacity-60 grayscale" : c.status === "Inactive" ? "opacity-70" : ""}`}
                    >
                      <img src={c.avatar} alt={c.name} className="size-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none truncate">{c.name}</p>
                        <Badge
                          variant={cfg.badgeVariant}
                          className={`shrink-0 text-[10px] px-1.5 py-0 ${c.status === "Inactive" ? "text-amber-600 border-amber-600/30" : ""}`}
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
                    </div>
                  </div>

                  {/* Status-specific meta */}
                  {c.status === "Active" && (
                    <p className="text-xs text-emerald-600 font-medium">Last order: {c.meta}</p>
                  )}
                  {c.status === "Inactive" && <p className="text-xs text-amber-600 font-medium">{c.meta}</p>}
                  {c.status === "Banned" && (
                    <div className="space-y-1">
                      <p className="text-xs text-destructive font-medium leading-snug">{c.meta}</p>
                      {c.metaSub && <p className="text-[10px] text-muted-foreground">{c.metaSub}</p>}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-2">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Orders</p>
                      <p className="text-sm font-medium tabular-nums">{c.orders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Spent</p>
                      <p className="text-sm font-medium tabular-nums">৳{c.spent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Per page</span>
            <Select
              value={`${pageSize}`}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 6, 9, 12].map((s) => (
                  <SelectItem key={s} value={`${s}`}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {safePageIndex + 1} of {totalPages}
            </span>
            <Button size="icon-sm" variant="outline" onClick={() => setPageIndex(0)} disabled={!canPrev}>
              <ChevronsLeft />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => setPageIndex((p) => p - 1)} disabled={!canPrev}>
              <ChevronLeft />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => setPageIndex((p) => p + 1)} disabled={!canNext}>
              <ChevronRight />
            </Button>
            <Button size="icon-sm" variant="outline" onClick={() => setPageIndex(totalPages - 1)} disabled={!canNext}>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
