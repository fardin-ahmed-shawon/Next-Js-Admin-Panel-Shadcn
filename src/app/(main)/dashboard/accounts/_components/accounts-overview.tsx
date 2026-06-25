"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type DashboardPeriod = {
  revenue: number;
  cogs: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
  gross_margin: number;
  net_margin: number;
};

type AccountsDashboardData = {
  today: DashboardPeriod;
  this_month: DashboardPeriod;
  this_year: DashboardPeriod;
  all_time: DashboardPeriod;
};

export function AccountsOverview() {
  const [data, setData] = useState<AccountsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
        const DASHBOARD_URL = process.env.NEXT_PUBLIC_API_ACCOUNTS_DASHBOARD_URL || "accounts-dashboard";
        const cleanBase = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
        const cleanPath = DASHBOARD_URL.startsWith("/") ? DASHBOARD_URL.slice(1) : DASHBOARD_URL;
        const API_URL = `${cleanBase}${cleanPath}`;

        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(API_URL, { headers });
        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        } else {
          toast.error(result.message || "Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to connect to API");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Failed to load data</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Level KPIs */}
      <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-5 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{formatCurrency(data.all_time.revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Total COGS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{formatCurrency(data.all_time.cogs)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-destructive">
                {formatCurrency(data.all_time.expenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
                {formatCurrency(data.all_time.net_profit)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Net Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{formatPercent(data.all_time.net_margin)}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium">{formatCurrency(data.today.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">COGS</span>
              <span className="font-medium">{formatCurrency(data.today.cogs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Profit</span>
              <span className="font-medium">{formatCurrency(data.today.gross_profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-medium">{formatCurrency(data.today.expenses)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-medium">Net Profit</span>
              <span className="font-bold">{formatCurrency(data.today.net_profit)}</span>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium">{formatCurrency(data.this_month.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">COGS</span>
              <span className="font-medium">{formatCurrency(data.this_month.cogs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Profit</span>
              <span className="font-medium">{formatCurrency(data.this_month.gross_profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-medium">{formatCurrency(data.this_month.expenses)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-medium">Net Profit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-500">
                {formatCurrency(data.this_month.net_profit)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* This Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Year Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium">{formatCurrency(data.this_year.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">COGS</span>
              <span className="font-medium">{formatCurrency(data.this_year.cogs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Profit</span>
              <span className="font-medium">{formatCurrency(data.this_year.gross_profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-medium">{formatCurrency(data.this_year.expenses)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-medium">Net Profit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-500">
                {formatCurrency(data.this_year.net_profit)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* All Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Time Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-medium">{formatCurrency(data.all_time.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">COGS</span>
              <span className="font-medium">{formatCurrency(data.all_time.cogs)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Profit</span>
              <span className="font-medium">{formatCurrency(data.all_time.gross_profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expenses</span>
              <span className="font-medium">{formatCurrency(data.all_time.expenses)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-medium">Net Profit</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-500">
                {formatCurrency(data.all_time.net_profit)}
              </span>
            </div>
            <div className="pt-2 text-xs text-muted-foreground text-center">
              Gross Margin: {formatPercent(data.all_time.gross_margin)} · Net Margin:{" "}
              {formatPercent(data.all_time.net_margin)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Glossary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Understanding the Numbers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="font-medium mb-1">Revenue</p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Revenue:</span> Total revenue from Paid orders
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Cost & Expenses</p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">COGS:</span> Purchase price × quantity sold (Delivered
              Products)
            </p>
            <p className="text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Expenses:</span> Rent, salary, utilities, etc.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">Profitability</p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Gross Profit:</span> Revenue − COGS
            </p>
            <p className="text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Net Profit:</span> Gross Profit − Expenses
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
