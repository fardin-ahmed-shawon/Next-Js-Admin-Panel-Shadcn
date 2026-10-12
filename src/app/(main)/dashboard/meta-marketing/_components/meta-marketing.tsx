"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  Download,
  Ellipsis,
  Link2,
  Package,
  Search,
  ShoppingBag,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import data from "@/config/meta-marketing-demo.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const root = "/dashboard/meta-marketing";
const icons = [Wallet, TrendingUp, Target, ShoppingBag, Target, BarChart3, Package, Users];
const value = (n: number, type = "number") =>
  type === "money"
    ? `৳${n.toLocaleString("en-BD")}`
    : type === "ratio"
      ? `${n.toFixed(2)}x`
      : type === "percent"
        ? `${n}%`
        : n.toLocaleString("en-BD");
const demo = () => toast.info("Demo only — no Meta connection or campaign changes are made.");
function exportRows(name: string, rows: Record<string, unknown>[]) {
  const keys = Object.keys(rows[0] || {});
  const csv = [keys, ...rows.map((row) => keys.map((key) => row[key]))]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name + "-demo.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function Header({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">∞</span>
          <span className="text-xs font-medium text-muted-foreground">Meta Marketing</span>
          <Badge variant="secondary">Static demo</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <nav aria-label="Meta Marketing pages" className="flex flex-wrap gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link href={root}>Dashboard</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={root + "/integration"}>Meta API Integration</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={root + "/insights"}>Insights</Link>
        </Button>
      </nav>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`min-w-0 rounded-xl border bg-card ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Period({ label = "Period" }: { label?: string }) {
  const [period, setPeriod] = useState(data.periods[0]);
  return (
    <Select value={period} onValueChange={setPeriod}>
      <SelectTrigger className="w-36" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {data.periods.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Chart({ kind }: { kind: "revenue" | "roas" | "sales" }) {
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis width={38} domain={[0, 1]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
    </>
  );
  return (
    <div className="h-64 p-4" role="img" aria-label={`${kind} chart. All monthly demo values are zero.`}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === "sales" ? (
          <BarChart data={data.trends}>
            {axes}
            <Bar dataKey="sales" name="Orders" fill="#18181b" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <ComposedChart data={data.trends}>
            {axes}
            {kind === "revenue" && <Area dataKey="revenue" name="Revenue" fill="#e4e4e7" stroke="#a1a1aa" />}
            <Line
              dataKey={kind === "roas" ? "roas" : "spend"}
              name={kind === "roas" ? "ROAS" : "Ad spend"}
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground";
const td = "whitespace-nowrap px-4 py-3 text-sm";
export function MetaDashboard() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [ascending, setAscending] = useState(true);
  const [selected, setSelected] = useState<(typeof data.performance)[number] | null>(null);
  const performance = data.performance.filter((row) =>
    `${row.campaign} ${row.product}`.toLowerCase().includes(search.toLowerCase()),
  );
  const campaigns = data.campaigns
    .filter((row) => row.name.toLowerCase().includes(campaignSearch.toLowerCase()))
    .sort((a, b) => (ascending ? 1 : -1) * a.name.localeCompare(b.name));
  return (
    <div className="space-y-5">
      <Header
        title="Marketing Dashboard"
        description="Campaign performance, attributed revenue and product insights."
      />
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        Demo preview · All financial and performance values are zero. No live Meta account is connected.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric, i) => {
          const Icon = icons[i];
          return (
            <div key={metric.label} className="rounded-xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <Icon className="size-5 text-muted-foreground" />
                <Badge variant="secondary">{value(metric.change, "percent")}</Badge>
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{value(metric.value, metric.format)}</p>
              <p className="mt-2 text-xs text-muted-foreground">{metric.description}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Revenue vs Ad Spend"
          subtitle="Attributed revenue and spend · Monthly demo"
          action={
            <div className="flex gap-2">
              <Period label="Revenue period" />
              <Button asChild variant="outline">
                <Link href={root + "/insights"}>View report</Link>
              </Button>
            </div>
          }
        >
          <div className="flex gap-5 px-5 pt-4 text-xs text-muted-foreground">
            <span>● Ad Spend</span>
            <span>○ Revenue</span>
          </div>
          <Chart kind="revenue" />
        </Panel>
        <Panel title="Campaign Status" action={<Period label="Campaign status period" />}>
          <div className="mx-auto my-6 flex size-40 flex-col items-center justify-center rounded-full border-[18px] border-muted">
            <strong className="text-3xl">{data.statuses.reduce((sum, item) => sum + item.value, 0)}</strong>
            <span className="text-xs text-muted-foreground">Orders</span>
          </div>
          <div className="grid grid-cols-2 gap-4 px-5 pb-5">
            {data.statuses.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full border" style={{ backgroundColor: item.color }} />
                {item.name}
                <strong className="ml-auto">{item.value}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid gap-5 2xl:grid-cols-2">
        <Panel
          title="Top Performing Campaigns"
          subtitle="Campaigns linked to products"
          action={
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-3 size-4 text-muted-foreground" />
                <Input
                  aria-label="Search campaigns and products"
                  placeholder="Search"
                  className="w-40 pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Period label="Top campaigns period" />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  {["Campaign", "Product", "Spend", "Revenue", "ROAS", "Actions"].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {performance.map((row) => (
                  <tr className="border-t" key={row.campaign}>
                    <td className={td}>{row.campaign}</td>
                    <td className={td}>{row.product}</td>
                    <td className={td}>{value(row.spend, "money")}</td>
                    <td className={td}>{value(row.revenue, "money")}</td>
                    <td className={td}>
                      <Badge variant="secondary">{value(row.roas, "ratio")}</Badge>
                    </td>
                    <td className={td}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${row.campaign}`}
                        onClick={() => setSelected(row)}
                      >
                        <Ellipsis className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!performance.length && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                      No matching demo campaigns.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel
          title="Recent Ad Spend by Product"
          subtitle="Products driving ad revenue"
          action={
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setExpanded(true);
              }}
            >
              See All
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr>
                  {["Product", "Campaign", "Spend", "Revenue", "ROAS"].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.performance.map((row) => (
                  <tr className="border-t" key={row.product}>
                    <td className={td}>{row.product}</td>
                    <td className={td}>{row.campaign}</td>
                    <td className={td}>{value(row.spend, "money")}</td>
                    <td className={td}>{value(row.revenue, "money")}</td>
                    <td className={td}>{value(row.roas, "ratio")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      <Panel
        title="Detailed Metrics — Campaign Level"
        subtitle="Ads Manager style breakdown · Static demonstration"
        action={
          <Button
            variant="outline"
            aria-expanded={expanded}
            aria-controls="campaign-metrics"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide" : "View"} Detailed Metrics
            <ChevronDown className={`size-4 ${expanded ? "rotate-180" : ""}`} />
          </Button>
        }
      >
        {expanded && (
          <div id="campaign-metrics">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <Input
                aria-label="Search detailed campaigns"
                placeholder="Search campaigns…"
                className="max-w-xs"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                Columns: Performance · Demo switches reset on reload
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40">
                  <tr>
                    <th className={th}>Off / On</th>
                    <th className={th}>
                      <button onClick={() => setAscending(!ascending)}>Campaign {ascending ? "↑" : "↓"}</button>
                    </th>
                    {["Results", "Cost per result", "Budget", "Amount spent", "Impressions", "Reach", "Ends"].map(
                      (h) => (
                        <th key={h} className={th}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((row) => (
                    <tr className="border-t" key={row.id}>
                      <td className={td}>
                        <Switch
                          aria-label={`Toggle demo campaign ${row.name}`}
                          checked={active[row.id] ?? row.active}
                          onCheckedChange={(checked) => setActive((current) => ({ ...current, [row.id]: checked }))}
                        />
                      </td>
                      <td className={td}>
                        <div>{row.name}</div>
                        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                          {["Charts", "Edit", "Duplicate", "Compare"].map((action) => (
                            <button key={action} onClick={demo}>
                              {action}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className={td}>
                        {row.results}
                        <div className="text-xs text-muted-foreground">{row.resultLabel}</div>
                      </td>
                      <td className={td}>
                        {value(row.cost, "money")}
                        <div className="text-xs text-muted-foreground">{row.costLabel}</div>
                      </td>
                      <td className={td}>{value(row.budget, "money")} Daily</td>
                      <td className={td}>{value(row.spent, "money")}</td>
                      <td className={td}>{row.impressions}</td>
                      <td className={td}>{row.reach}</td>
                      <td className={td}>{row.ends}</td>
                    </tr>
                  ))}
                  {!campaigns.length && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-sm text-muted-foreground">
                        No matching demo campaigns.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t p-4 text-xs text-muted-foreground">
              <span>
                {value(
                  data.campaigns.reduce((sum, row) => sum + row.spent, 0),
                  "money",
                )}{" "}
                total spent · Last synced: {data.integration.lastSynced}
              </span>
              <span>Static demo data</span>
            </div>
          </div>
        )}
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Payment Overview — Ad Revenue Split" subtitle="Bangladeshi payments">
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
            {data.payments.map((payment) => (
              <div key={payment.label} className="rounded-lg border bg-muted/30 p-4">
                <Wallet className="mb-3 size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{payment.label}</p>
                <p className="mt-1 text-xl font-semibold">{value(payment.value, "money")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{value(payment.percent, "percent")}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="ROAS Trend"
          subtitle="Return on ad spend over time"
          action={
            <Button variant="outline" onClick={() => exportRows("meta-roas", data.trends)}>
              <Download className="size-4" />
              Export
            </Button>
          }
        >
          <Chart kind="roas" />
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Sales Trend via Ads"
          subtitle="Orders driven by Meta campaigns"
          action={
            <div className="flex gap-2">
              <Period label="Sales period" />
              <Button asChild variant="outline">
                <Link href={root + "/insights"}>View report</Link>
              </Button>
            </div>
          }
        >
          <Chart kind="sales" />
        </Panel>
        <Panel
          title="Top Selling Products via Ads"
          action={
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setExpanded(true);
              }}
            >
              See All
            </Button>
          }
        >
          <div className="divide-y px-5">
            {data.performance.map((row) => (
              <div key={row.product} className="flex items-center gap-3 py-4">
                <Package className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{row.product}</p>
                  <p className="text-xs text-muted-foreground">{row.units} units sold</p>
                </div>
                <Badge variant="secondary">{value(row.roas, "ratio")}</Badge>
              </div>
            ))}
          </div>
          <p className="border-t p-4 text-xs text-muted-foreground">
            ROAS = Revenue / Ad Spend. Demo ratios remain zero when there is no spend.
          </p>
        </Panel>
      </div>
      <p className="text-center text-xs text-muted-foreground">Zymerce · Meta Marketing Demo · BDT (৳)</p>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.campaign}</DialogTitle>
            <DialogDescription>Static demo campaign linked to {selected?.product}.</DialogDescription>
          </DialogHeader>
          {selected && (
            <dl className="grid grid-cols-3 gap-4">
              {[
                ["Spend", value(selected.spend, "money")],
                ["Revenue", value(selected.revenue, "money")],
                ["ROAS", value(selected.roas, "ratio")],
              ].map(([label, text]) => (
                <div key={label}>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-xl font-semibold">{text}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function MetaIntegration() {
  return (
    <div className="space-y-5">
      <Header title="Meta API Integration" description="Preview the connection setup for your Meta Business account." />
      <Panel title="Connect Meta Business" subtitle="Demo only — credentials are not collected, saved or sent.">
        <div className="max-w-3xl space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link2 className="size-5 text-blue-600" />
            <Badge variant="outline">{data.integration.status}</Badge>
            <span className="text-xs text-muted-foreground">Last synced: {data.integration.lastSynced}</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="meta-app-id">Meta App ID</Label>
              <Input id="meta-app-id" readOnly value={data.integration.appId} placeholder="App ID (demo)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-app-secret">App Secret</Label>
              <Input
                id="meta-app-secret"
                readOnly
                type="password"
                value={data.integration.appSecret}
                placeholder="App secret (demo)"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-token">Access Token (Long-lived)</Label>
            <Input
              id="meta-token"
              readOnly
              type="password"
              value={data.integration.accessToken}
              placeholder="Access token (demo)"
            />
            <p className="text-xs text-muted-foreground">
              Campaign permissions and token validation will be configured when live integration is implemented.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={demo}>Connect Meta</Button>
            <Button variant="outline" onClick={demo}>
              Test Connection
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4">
            <div className="text-sm">
              Linked campaigns <strong className="block text-2xl">{data.integration.linkedCampaigns}</strong>
            </div>
            <div className="text-sm">
              Linked products <strong className="block text-2xl">{data.integration.linkedProducts}</strong>
            </div>
          </div>
        </div>
      </Panel>
      <Panel title="How linking works — Bangladesh context">
        <ul className="list-disc space-y-3 py-5 pl-10 pr-5 text-sm text-muted-foreground">
          {data.integration.help.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
export function MetaInsights() {
  return (
    <div className="space-y-5">
      <Header
        title="Insights — Bangladeshi Market"
        description="A static preview of campaign insights and recommendations."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {data.insights.map((item) => (
          <Panel key={item.title} title={item.title}>
            <div className="p-5">
              <p className="mb-3 text-3xl font-semibold">{value(item.value, item.format)}</p>
              <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Recommendations" subtitle="Illustrative guidance, not generated from live campaign data.">
        <div className="divide-y px-5">
          {data.recommendations.map((item) => (
            <div className="flex items-center gap-3 py-5 text-sm" key={item}>
              <Target className="size-5 shrink-0 text-blue-600" />
              {item}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="ROAS Trend" subtitle="Monthly demo values">
        <Chart kind="roas" />
      </Panel>
    </div>
  );
}
